import { Router } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/discovered", authMiddleware, async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;

        const recipes = await prisma.discovered_recipes.findMany({
            where: { restaurant_id: restaurantId },
            include: {
                recipes: true,
            },
        });

        res.json(recipes.map(r => r.recipes));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch discovered recipes" });
    }
});

export default router;
