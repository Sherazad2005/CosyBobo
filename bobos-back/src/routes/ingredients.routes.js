import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const ingredients = await prisma.ingredients.findMany({
            select: {
                id: true,
                name: true,
                icon_url: true,
            },
        });

        res.json(ingredients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch ingredients" });
    }
});

export default router;
