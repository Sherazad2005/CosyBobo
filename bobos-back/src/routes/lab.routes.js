import { Router } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/experiment", authMiddleware, async (req, res) => {
    const { ingredientIds } = req.body;

    if (!Array.isArray(ingredientIds) || ingredientIds.length === 0) {
        return res.status(400).json({ error: "Invalid ingredients" });
    }

    try {
        // ✅ on récupère le restaurant via le userId du token
        const userId = BigInt(req.user.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: { user_id: userId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const restaurantId = restaurant.id;

        const recipes = await prisma.recipes.findMany({
            include: { recipe_ingredients: true },
        });

        // ✅ tri numérique safe
        const sortedInput = ingredientIds
            .map(Number)
            .sort((a, b) => a - b)
            .join(",");

        const match = recipes.find((r) => {
            const recipeIngredients = r.recipe_ingredients
                .map((i) => Number(i.ingredient_id))
                .sort((a, b) => a - b)
                .join(",");

            return recipeIngredients === sortedInput;
        });

        if (!match) {
            return res.json({ success: false });
        }

        // ✅ upsert (si ton schema prisma a bien restaurant_id_recipe_id)
        await prisma.discovered_recipes.upsert({
            where: {
                restaurant_id_recipe_id: {
                    restaurant_id: restaurantId,
                    recipe_id: match.id,
                },
            },
            update: {},
            create: {
                restaurant_id: restaurantId,
                recipe_id: match.id,
            },
        });

        return res.json({ success: true, recipe: match });
    } catch (err) {
        console.error("EXPERIMENT ERROR:", err);
        return res.status(500).json({
            error: "Experiment failed",
            details: err?.message,
        });
    }
});

export default router;
