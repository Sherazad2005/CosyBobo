import express from "express";
import cors from "cors";
import prisma from "./prisma/client.js";
import authRoutes from "./routes/auth.routes.js";
import ingredientsRoutes from "./routes/ingredients.routes.js";
import recipesRoutes from "./routes/recipes.routes.js";
import LabRoutes from "./routes/lab.routes.js";
import OrderRoutes from "./routes/orders.routes.js";
import MarketRoutes from "./routes/market.routes.js";
import restaurantsRoutes from "./routes/restaurant.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
const app = express();

BigInt.prototype.toJSON = function () {
    return this.toString();
};


app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/ingredients", ingredientsRoutes);
app.use("/recipes", recipesRoutes);
app.use("/lab", LabRoutes);
app.use("/orders", OrderRoutes);
app.use("/market", MarketRoutes);
app.use("/restaurant", restaurantsRoutes);
app.use("/transactions", transactionsRoutes);


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
