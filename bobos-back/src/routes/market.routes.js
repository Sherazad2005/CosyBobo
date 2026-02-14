import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { buyIngredient } from "../services/market.service.js";

const router = Router();

router.post("/buy", authMiddleware, async (req, res) => {
    try {
        const restaurantId = BigInt(req.user.restaurantId);
        const { ingredientId, qty } = req.body;

        const result = await buyIngredient({
            restaurantId,
            ingredientId,
            qty: Number(qty),
        });

        if (!result.ok) return res.status(400).json({ error: result.error });
        return res.json(result.data);
    } catch (e) {
        console.error("MARKET BUY ERROR:", e);
        res.status(500).json({
            error: "Server error",
            details: e?.message,
        });
    }

});

export default router;
