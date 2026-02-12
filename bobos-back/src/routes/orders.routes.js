import { Router } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/pending", authMiddleware, async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: { user_id: userId },
            select: { id: true, satisfaction: true },
        });

        if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

        const orders = await prisma.orders.findMany({
            where: { restaurant_id: restaurant.id, status: "pending" },
            orderBy: { expires_at: "asc" },
            include: { recipes: true },
            take: 10,
        });

        res.json({
            satisfaction: restaurant.satisfaction,
            orders: orders.map((o) => ({
                id: o.id.toString(),
                recipeId: o.recipe_id.toString(),
                recipeName: o.recipes.name,
                expiresAt: o.expires_at,
                status: o.status,
            })),
        });
    } catch (err) {
        console.error("PENDING ORDERS ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
