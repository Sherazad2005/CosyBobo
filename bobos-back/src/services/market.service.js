import prisma from "../prisma/client.js";

export async function buyIngredient({ restaurantId, ingredientId, qty }) {
    if (!Number.isInteger(qty) || qty <= 0) {
        return { ok: false, error: "Invalid qty" };
    }

    const rid = BigInt(restaurantId);
    const iid = BigInt(ingredientId);

    return prisma.$transaction(async (tx) => {
        const ingredient = await tx.ingredients.findUnique({
            where: { id: iid },
            select: { id: true, name: true, unit_cost: true },
        });

        if (!ingredient) return { ok: false, error: "Ingredient not found" };

        const cost = ingredient.unit_cost * qty;

        const resto = await tx.restaurants.findUnique({
            where: { id: rid },
            select: { id: true, cash: true },
        });

        if (!resto) return { ok: false, error: "Restaurant not found" };
        if (resto.cash < cost) return { ok: false, error: "Not enough cash" };

        const updatedResto = await tx.restaurants.update({
            where: { id: rid },
            data: { cash: { decrement: cost } },
            select: { cash: true },
        });

        await tx.inventory.upsert({
            where: {
                restaurant_id_ingredient_id: {
                    restaurant_id: rid,
                    ingredient_id: iid,
                },
            },
            update: { qty: { increment: qty } },
            create: {
                restaurant_id: rid,
                ingredient_id: iid,
                qty,
            },
        });

        await tx.transactions.create({
            data: {
                restaurant_id: rid,
                type: "buy",
                amount: cost,
                meta_json: {
                    ingredientId: iid.toString(),
                    ingredientName: ingredient.name,
                    qty,
                    unitCost: ingredient.unit_cost,
                },
            },
        });

        return { ok: true, data: { cash: updatedResto.cash, spent: cost } };
    });
}
