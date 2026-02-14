import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import prisma from "./prisma/client.js";
import { serveOrder } from "./services/orders.service.js";


const PORT = process.env.PORT || 3001;

const ORDER_PENALTY = Number(process.env.ORDER_PENALTY ?? 10);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});


io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Missing token"));

        const payload = jwt.verify(token, process.env.JWT_SECRET); // { userId }
        const userId = BigInt(payload.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: { user_id: userId },
            select: { id: true, satisfaction: true },
        });

        if (!restaurant) return next(new Error("Restaurant not found"));

        socket.data.userId = userId;
        socket.data.restaurantId = restaurant.id;

        next();
    } catch (e) {
        next(new Error("Invalid token"));
    }
});


io.on("connection", (socket) => {
    const rid = socket.data.restaurantId;
    const room = `restaurant:${rid.toString()}`;
    socket.join(room);

    socket.emit("connected", { restaurantId: rid.toString() });


    socket.on("orders:serve", async ({ orderId }) => {
        try {
            const restaurantId = rid; // rid vient du scope connection

            const result = await serveOrder({ restaurantId, orderId });

            if (!result.ok) {
                return socket.emit("orders:error", { message: result.error });
            }

            io.to(room).emit("orders:update", result.data);
        } catch (err) {
            console.error("SERVE SOCKET ERROR:", err);
            socket.emit("orders:error", { message: "Server error" });
        }
    });


});


setInterval(async () => {
    try {
        const rooms = Array.from(io.sockets.adapter.rooms.keys()).filter((r) =>
            r.startsWith("restaurant:")
        );

        for (const room of rooms) {
            const rid = BigInt(room.split(":")[1]);


            const pendingCount = await prisma.orders.count({
                where: { restaurant_id: rid, status: "pending" },
            });
            if (pendingCount >= 5) continue;

            const recipes = await prisma.recipes.findMany({ select: { id: true, name: true } });
            if (recipes.length === 0) continue;

            const random = recipes[Math.floor(Math.random() * recipes.length)];
            const expiresAt = new Date(Date.now() + 20_000);

            const order = await prisma.orders.create({
                data: {
                    restaurant_id: rid,
                    recipe_id: random.id,
                    status: "pending",
                    expires_at: expiresAt,
                },
            });

            io.to(room).emit("orders:new", {
                id: order.id.toString(),
                recipeId: random.id.toString(),
                recipeName: random.name,
                expiresAt,
                status: "pending",
            });
        }
    } catch (e) {
        console.error("SPAWN LOOP ERROR:", e);
    }
}, 8000);


setInterval(async () => {
    try {
        const now = new Date();

        const expired = await prisma.orders.findMany({
            where: { status: "pending", expires_at: { lt: now } },
            select: { id: true, restaurant_id: true },
        });

        for (const o of expired) {
            const rid = o.restaurant_id;

            const result = await prisma.$transaction(async (tx) => {
                const up = await tx.orders.updateMany({
                    where: { id: o.id, status: "pending" },
                    data: { status: "expired" },
                });
                if (up.count === 0) return null;

                const resto = await tx.restaurants.update({
                    where: { id: rid },
                    data: {
                        satisfaction: { decrement: 10 },
                        cash: { decrement: ORDER_PENALTY },
                    },
                    select: { satisfaction: true, cash: true },
                });

                await tx.transactions.create({
                    data: {
                        restaurant_id: rid,
                        type: "penalty",
                        amount: ORDER_PENALTY,
                        meta_json: {
                            orderId: o.id.toString(),
                            reason: "expired_order",
                        },
                    },
                });

                return { satisfaction: resto.satisfaction, cash: resto.cash };
            });

            if (result === null) continue;

            const room = `restaurant:${rid.toString()}`;

            io.to(room).emit("orders:update", {
                orderId: o.id.toString(),
                status: "expired",
                satisfaction: result.satisfaction,
                cash: result.cash,
            });

            if (result.satisfaction < 0) {
                io.to(room).emit("game:over", { reason: "satisfaction" });
            }

            if (result.cash < 0) {
                io.to(room).emit("game:over", { reason: "cash" });
            }
        }
    } catch (e) {
        console.error("EXPIRE LOOP ERROR:", e);
    }
}, 2000);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



