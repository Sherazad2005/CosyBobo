import prisma from "../prisma/client.js";

export async function serveOrder({ restaurantId, orderId }) {
    if (!orderId) return { ok: false, error: "Missing orderId" };

    const rid = BigInt(restaurantId)
    const oid = BigInt(orderId);

    try {
        const order = await prisma.orders.findUnique({
            where: { id: oid },
            include: {
                recipes: {
                    include: { recipe_ingredients: true },
                },
            },
        });

        if (!order || order.restaurant_id !== rid) {
            return { ok: false, error: "Order not found" };
        }
        if (order.status !== "pending") {
            return { ok: false, error: "Order not pending" };
        }
        if (new Date(order.expires_at).getTime() < Date.now()) {
            return { ok: false, error: "Order expired" };
        }

        const discovered = await prisma.discovered_recipes.findUnique({
            where: {
                restaurant_id_recipe_id: {
                    restaurant_id: rid,
                    recipe_id: order.recipe_id,
                },
            },
        });
        if (!discovered) {
            return { ok: false, error: "Recipe not discovered" };
        }

        const result = await prisma.$transaction(async (tx) => {
            const up = await tx.orders.updateMany({
                where: { id: oid, status: "pending" },
                data: { status: "served", served_at: new Date() },
            });

            if (up.count === 0) {
                return { ok: false, error: "Already processed" };
            }

            const needed = order.recipes.recipe_ingredients;
            if (needed.length > 0) {
                const ingredientIds = needed.map((ri) => ri.ingredient_id);

                const inventoryRows = await tx.inventory.findMany({
                    where: {
                        restaurant_id: rid,
                        ingredient_id: { in: ingredientIds },
                    },
                    select: { ingredient_id: true, q: true },
                });

                const invMap = new Map(
                    inventoryRows.map((r) => [r.ingredient_id.toString(), r.q])
                );

                for (const ri of needed) {
                    const have = invMap.get(ri.ingredient_id.toString()) ?? 0;
                    const want = ri.q;
                    if (have < want) {
                        throw new Error("Not enough stock");
                    }
                }

                for (const ri of needed) {
                    const have = invMap.get(ri.ingredient_id.toString()) ?? 0;
                    const want = ri.q;
                    if (have < want) {
                        throw new Error("Not enough stock");
                    }
                }
                for (const ri of needed) {
                    await tx.inventory.updateMany({
                        where: {
                            restaurant_id: rid,
                            ingredient_id: ri.ingredient_id,
                            q: { gte: ri.qty},
                        },
                        data: { q: { decrement: ri.qty} },
                    });
                }
            }

            const sellPrice = order.recipes.sell_price;

            const updatedResto = await tx.restaurants.update({
                where: { id: rid },
                data: {
                    cash: { increment: sellPrice },
                    satisfaction: { increment: 1 },
                },
                select: { cash: true, satisfaction: true },
            });

            await tx.transactions.create({
                data: {
                    restaurant_id: rid,
                    type: "sale",
                    amount: sellPrice,
                    meta_json: {
                        orderId: order.id.toString(),
                        recipeId: order.recipe_id.toString(),
                        recipeName: order.recipes.name,
                    },
                },
            });

            return {
                ok: true,
                data: {
                    orderId: order.id.toString(),
                    status: "served",
                    cash: updatedResto.cash,
                    satisfaction: updatedResto.satisfaction,
                },
            };
        });

        return result;
    } catch (err) {
        return { ok: false, error: err?.message || "Serve failed" };
    }
}

