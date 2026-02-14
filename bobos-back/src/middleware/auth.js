import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

export async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const userId = BigInt(payload.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: { user_id: userId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        req.user = {
            userId: userId.toString(),
            restaurantId: restaurant.id.toString(),
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

