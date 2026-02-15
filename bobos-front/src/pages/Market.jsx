import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

export default function Market() {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const API_BG = "/pixel-jess-night-market-start-rng.jpg"; // fichier dans /public

  const [ingredients, setIngredients] = useState([]);
  const [cash, setCash] = useState(null);
  const [loading, setLoading] = useState(true);

  const [qtyById, setQtyById] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!token) {
        setError("Tu n'es pas connecté(e). Reviens sur /login.");
        return;
      }

      
      const ing = await apiFetch("/ingredients", { token });
      setIngredients(Array.isArray(ing) ? ing : []);

      const state = await apiFetch("/restaurant/state", { token });
      setCash(state?.cash ?? null);
    } catch (e) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleBuy(ingredientId) {
    setError("");
    setSuccess("");

    const qty = Number(qtyById[ingredientId] ?? 1);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantité invalide");
      return;
    }

    try {
      const res = await apiFetch("/market/buy", {
        token,
        method: "POST",
        body: JSON.stringify({ ingredientId: Number(ingredientId), qty }),
      });

      const newCash = res?.data?.cash ?? res?.cash;
      if (typeof newCash !== "undefined" && newCash !== null) setCash(newCash);

      setSuccess("Achat effectué ✅");

    } catch (e) {
      setError(e.message || "Erreur d'achat");
    }
  }

  return (
      <div
          className="min-h-screen bg-cover bg-center"
          style={{ backgroundImage: `url('${API_BG}')` }}
      >
        <div className="min-h-screen bg-black/50">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 shadow-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">Bobo’s Market</h1>
                  <p className="text-white/80">Achète des ingrédients pour remplir ton stock.</p>
                </div>

                <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white">
                  <div className="text-xs uppercase tracking-wide text-white/70">Cash</div>
                  <div className="text-xl font-bold">
                    {cash === null ? "—" : `${cash}`}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {error && (
                    <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/20 px-4 py-2 text-red-100">
                      {error}
                    </div>
                )}
                {success && (
                    <div className="mb-3 rounded-lg border border-green-400/30 bg-green-500/20 px-4 py-2 text-green-100">
                      {success}
                    </div>
                )}
              </div>

              {loading ? (
                  <p className="mt-6 text-white/80">Chargement…</p>
              ) : (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ingredients.map((ing) => (
                        <div
                            key={String(ing.id)}
                            className="rounded-2xl bg-black/30 border border-white/10 p-4 text-white"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-lg font-bold">{ing.name}</div>
                              <div className="text-sm text-white/70">
                                Coût unité : <span className="font-semibold">{ing.unit_cost}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                className="w-20 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none"
                                value={qtyById[ing.id] ?? 1}
                                onChange={(e) =>
                                    setQtyById((prev) => ({
                                      ...prev,
                                      [ing.id]: e.target.value,
                                    }))
                                }
                            />
                            <button
                                onClick={() => handleBuy(ing.id)}
                                className="flex-1 rounded-lg bg-amber-500/90 hover:bg-amber-500 px-4 py-2 font-semibold text-black transition"
                            >
                              Acheter
                            </button>
                          </div>
                        </div>
                    ))}

                    {ingredients.length === 0 && (
                        <p className="text-white/80">Aucun ingrédient en base.</p>
                    )}
                  </div>
              )}

              <div className="mt-8 flex gap-3">
                <a
                    href="/lab"
                    className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 text-white transition"
                >
                  Retour au Lab
                </a>
                <button
                    onClick={loadData}
                    className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 text-white transition"
                >
                  Rafraîchir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}


