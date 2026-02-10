import prisma from "./client.js";

async function main() {

    const ingredientsData = [
        { name: "Tomate", unit_cost: 2, icon_url: null },
        { name: "Fromage", unit_cost: 3, icon_url: null },
        { name: "Pâte", unit_cost: 1, icon_url: null },
        { name: "Basilic", unit_cost: 1, icon_url: null },
    ];

    for (const ing of ingredientsData) {
        await prisma.ingredients.upsert({
            where: { name: ing.name },
            update: {},
            create: ing,
        });
    }

    const allIngredients = await prisma.ingredients.findMany();
    const byName = Object.fromEntries(allIngredients.map(i => [i.name, i]));

    const recipesData = [
        { name: "Pizza Margherita", sell_price: 12, image_url: null },
        { name: "Bruschetta", sell_price: 7, image_url: null },
    ];

    for (const r of recipesData) {
        await prisma.recipes.upsert({
            where: { name: r.name },
            update: {},
            create: r,
        });
    }

    const allRecipes = await prisma.recipes.findMany();
    const recipeByName = Object.fromEntries(allRecipes.map(r => [r.name, r]));

    const margherita = recipeByName["Pizza Margherita"];
    const bruschetta = recipeByName["Bruschetta"];

    async function link(recipeId, ingredientId, qty = 1) {
        await prisma.recipe_ingredients.upsert({
            where: {
                recipe_id_ingredient_id: { recipe_id: recipeId, ingredient_id: ingredientId },
            },
            update: { qty },
            create: { recipe_id: recipeId, ingredient_id: ingredientId, qty },
        });
    }

    await link(margherita.id, byName["Pâte"].id, 1);
    await link(margherita.id, byName["Tomate"].id, 1);
    await link(margherita.id, byName["Fromage"].id, 1);
    await link(margherita.id, byName["Basilic"].id, 1);

    await link(bruschetta.id, byName["Tomate"].id, 1);
    await link(bruschetta.id, byName["Basilic"].id, 1);

    console.log("Seed terminé");
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
