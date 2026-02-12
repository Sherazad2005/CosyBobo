import prisma from "../prisma/client.js";

export async function serveOrder({ restaurantId, orderId }) {
    const oid = BigInt(orderId);
    const rid = BigInt(restaurantId);


    const order = await prisma.orders.findUnique({
        where: { id: oid },
        include: { recipes: { include: { recipe_ingredients: true } } },
    });

    if (!order || order.restaurant_id !== rid) {
        return { ok: false, status: 404, error: "Order not found" };
    }

    if (order.status !== "pending") {
        return { ok: false, status: 400, error: "Order not pending" };
    }

    if (new Date(order.expires_at).getTime() < Date.now()) {
        return { ok: false, status: 400, error: "Order expired" };
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
        return { ok: false, status: 403, error: "Recipe not discovered" };
    }


    const result = await prisma.$transaction(async (tx) => {
        // anti double-serve: on update uniquement si status pending
        const up = await tx.orders.updateMany({
            where: { id: oid, status: "pending" },
            data: { status: "served", served_at: new Date() },
        });

        if (up.count === 0) return null; // déjà servi/expiré au même moment

        const resto = await tx.restaurants.update({
            where: { id: rid },
            data: { satisfaction: { increment: 1 } },
            select: { satisfaction: true },
        });

        return { satisfaction: resto.satisfaction };
    });

    if (!result) {
        return { ok: false, status: 409, error: "Already processed" };
    }

    return {
        ok: true,
        status: 200,
        data: {
            orderId: order.id.toString(),
            recipeId: order.recipe_id.toString(),
            recipeName: order.recipes.name,
            status: "served",
            satisfaction: result.satisfaction,
        },
    };
}
