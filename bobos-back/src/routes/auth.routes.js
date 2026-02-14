import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password, restaurantName } = req.body;

        if (!email || !password || !restaurantName) {
            return res.status(400).json({ error: "email, password, restaurantName required" });
        }

        const existing = await prisma.users.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: "Email already used" });

        const password_hash = await bcrypt.hash(password, 10);


        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.users.create({
                data: { email, password_hash },
            });

            const restaurant = await tx.restaurants.create({
                data: {
                    user_id: createdUser.id,
                    name: restaurantName,
                    satisfaction: 20,
                    cash: 0,
                },
            });

            return { createdUser, restaurant };
        });

        const token = jwt.sign(
            { userId: user.createdUser.id.toString() }, // string to be safe
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: { id: user.createdUser.id, email: user.createdUser.email },
            restaurant: user.restaurant,
        });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "email and password required" });

        const user = await prisma.users.findUnique({
            where: { email },
            include: { restaurants: true },
        });

        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user.id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email },
            restaurant: user.restaurants,
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { restaurants: true },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            user: { id: user.id, email: user.email },
            restaurant: user.restaurants,
        });
    } catch (err) {
        console.error("ME ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
