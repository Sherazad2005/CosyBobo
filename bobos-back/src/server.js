import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import prisma from "./prisma/client.js";

const PORT = process.env.PORT || 3001;

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
            const order = await prisma.orders.findUnique({
                where: { id: BigInt(orderId) },
            });

            if (!order || order.restaurant_id !== rid) {
                return socket.emit("orders:error", { message: "Order not found" });
            }
            if (order.status !== "pending") {
                return socket.emit("orders:error", { message: "Order not pending" });
            }
            if (new Date(order.expires_at).getTime() < Date.now()) {
                return socket.emit("orders:error", { message: "Order expired" });
            }


            const discovered = await prisma.discovered_recipes.findUnique({
                where: {
                    restaurant_id_recipe_id: {
                        restaurant_id: rid,
                        recipe_id: order.recipe_id,
                    },
                },
            });

            if (!discovered) {
                return socket.emit("orders:error", { message: "Recipe not discovered" });
            }

            // update atomique: serve + satisfaction +1
            const newSatisfaction = await prisma.$transaction(async (tx) => {
                const up = await tx.orders.updateMany({
                    where: { id: order.id, status: "pending" },
                    data: { status: "served", served_at: new Date() },
                });
                if (up.count === 0) return null;

                const resto = await tx.restaurants.update({
                    where: { id: rid },
                    data: { satisfaction: { increment: 1 } },
                    select: { satisfaction: true },
                });

                return resto.satisfaction;
            });

            if (newSatisfaction === null) {
                return socket.emit("orders:error", { message: "Already processed" });
            }

            io.to(room).emit("orders:update", {
                orderId: order.id.toString(),
                status: "served",
                satisfaction: newSatisfaction,
            });
        } catch (err) {
            console.error("SERVE ERROR:", err);
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

            const newSatisfaction = await prisma.$transaction(async (tx) => {
                const up = await tx.orders.updateMany({
                    where: { id: o.id, status: "pending" },
                    data: { status: "expired" },
                });
                if (up.count === 0) return null;

                const resto = await tx.restaurants.update({
                    where: { id: rid },
                    data: { satisfaction: { decrement: 10 } },
                    select: { satisfaction: true },
                });

                return resto.satisfaction;
            });

            if (newSatisfaction === null) continue;

            const room = `restaurant:${rid.toString()}`;
            io.to(room).emit("orders:update", {
                orderId: o.id.toString(),
                status: "expired",
                satisfaction: newSatisfaction,
            });

            if (newSatisfaction < 0) {
                io.to(room).emit("game:over", { reason: "satisfaction" });
            }
        }
    } catch (e) {
        console.error("EXPIRE LOOP ERROR:", e);
    }
}, 2000);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



