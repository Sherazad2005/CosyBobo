import { Router } from "express";
import prisma from "../prisma/client.js"
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/state", authMiddleware, async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: {user_id: userId},
            select: {id: true, cash: true, satisfaction: true},
        });

        if (!restaurant) return res.status(404).json({error: "Restaurant not found"});

        const inventory = await prisma.inventory.findMany({
            where: {restaurant_id: restaurant.id},
            include: {
                ingredients: {select: {id: true, name: true, unit_cost: true, icon_url: true}},
            },
            orderBy: {ingredient_id: "asc"},
        });

        res.json({
            cash: restaurant.cash,
            satisfaction: restaurant.satisfaction,
            inventory: inventory.map((row) => ({
                ingredientId: row.ingredient_id.toString(),
                name: row.ingredients.name,
                unitCost: row.ingredients.unit_cost,
                iconUrl: row.ingredients.icon_url,
                qty: row.qty,
            })),
        });
    } catch (err) {
        console.error("STATE ERROR:", err);
        res.status(500).json({error: "Server error"});
    }
});

export default router;