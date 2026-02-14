import { Router } from "express";
import prisma from "../prisma/client.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: { user_id: userId },
            select: { id: true },
        });
        if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

        const txs = await prisma.transactions.findMany({
            where: { restaurant_id: restaurant.id },
            orderBy: { created_at: "desc" },
            take: 50,
        });

        res.json(
            txs.map((t) => ({
                id: t.id.toString(),
                type: t.type,
                amount: t.amount,
                createdAt: t.created_at,
                meta: t.meta_json,
            }))
        );
    } catch (err) {
        console.error("TX LIST ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /transactions/summary
 * Totaux par type + cash actuel
 */
router.get("/summary", authMiddleware, async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const restaurant = await prisma.restaurants.findUnique({
            where: { user_id: userId },
            select: { id: true, cash: true },
        });
        if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

        const grouped = await prisma.transactions.groupBy({
            by: ["type"],
            where: { restaurant_id: restaurant.id },
            _sum: { amount: true },
        });

        const totals = Object.fromEntries(
            grouped.map((g) => [g.type, g._sum.amount ?? 0])
        );

        res.json({
            cash: restaurant.cash,
            totals: {
                buy: totals.buy ?? 0,
                sale: totals.sale ?? 0,
                penalty: totals.penalty ?? 0,
                bonus: totals.bonus ?? 0,
            },
        });
    } catch (err) {
        console.error("TX SUMMARY ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
