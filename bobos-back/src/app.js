import express from "express";
import cors from "cors";
import prisma from "./prisma/client.js";
import authRoutes from "./routes/auth.routes.js";



const app = express();

BigInt.prototype.toJSON = function () {
    return this.toString();
};


app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);


app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Backend running" });
});

app.get("/test-db", async (req, res) => {
    try {
        const ingredients = await prisma.ingredients.findMany(); // <-- OK (ton model s'appelle "ingredients")
        res.json(ingredients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" })
    }
});

app.get("/test-recipes", async (req, res) => {
    const recipes = await prisma.recipes.findMany();
    res.json(recipes);
});

export default app;
