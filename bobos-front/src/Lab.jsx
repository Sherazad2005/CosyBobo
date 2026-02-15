import { useEffect, useMemo, useState } from "react";

function Lab() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("token");

  const [ingredients, setIngredients] = useState([]);

  const [slots, setSlots] = useState([null, null, null]);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(""); // succès / infos
  const [error, setError] = useState(""); // erreurs

  const ingredientById = useMemo(() => {
    const m = new Map();
    for (const ing of ingredients) m.set(String(ing.id), ing);
    return m;
  }, [ingredients]);

  function getIngredientIcon(ing) {
    if (!ing) return "";
    if (ing.icon_url) return ing.icon_url;

    const safe = String(ing.name || "")
        .toLowerCase()
        .trim()
        .replaceAll(" ", "_");
    return `/ingredients/${safe}.png`;
  }

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    (async () => {
      try {
        setError("");
        setInfo("");

        const res = await fetch(`${API_URL}/ingredients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Failed to load ingredients");
        }

        const data = await res.json();
        setIngredients(Array.isArray(data) ? data : data?.ingredients ?? []);
      } catch (e) {
        setError(e?.message || "Cannot load ingredients");
      }
    })();
  }, [API_URL, token]);

  function handleAddIngredient(ingredientId) {
    setSlots((currentSlots) => {
      const updated = [...currentSlots];
      const emptyIndex = updated.findIndex((slot) => slot === null);
      if (emptyIndex !== -1) updated[emptyIndex] = String(ingredientId);
      return updated;
    });
  }

  function handleReset() {
    setSlots([null, null, null]);
    setError("");
    setInfo("");
  }

  async function handleBrew() {
    setError("");
    setInfo("");

    const ingredientIds = slots.filter(Boolean).map((id) => Number(id));

    if (ingredientIds.length === 0) {
      setError("Choisis au moins 1 ingrédient.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/lab/experiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredientIds }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Experiment failed");
        return;
      }

      if (data?.success) {
        const recipeName = data?.recipe?.name || "Recette inconnue";
        setInfo(`Recette découverte : ${recipeName} !`);
        setSlots([null, null, null]);
      } else {
        setError("Aucune recette ne correspond à cette combinaison.");
        setSlots([null, null, null]);
      }
    } catch (e) {
      setError("connection to server error");
    } finally {
      setLoading(false);
    }
  }

  function slotLabel(slotId) {
    if (!slotId) return "(vide)";
    const ing = ingredientById.get(String(slotId));
    return ing ? ing.name : "(?)";
  }

  return (
      <>

        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/cafe-bg.jpg')" }}
        >

          <div className="w-[95%] max-w-6xl rounded-3xl bg-black/40 p-6 text-white shadow-xl backdrop-blur-sm">
            <h1 className="text-center text-4xl font-extrabold mb-6">
              Bobo&apos;s Brew Station
            </h1>

            {error && (
                <div className="mb-4 rounded-xl bg-red-600/20 border border-red-400/40 px-4 py-2 text-sm">
                  {error}
                </div>
            )}
            {info && (
                <div className="mb-4 rounded-xl bg-green-600/20 border border-green-400/40 px-4 py-2 text-sm">
                  {info}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-3">INGRÉDIENTS</h2>

                <div className="space-y-3 max-h-[520px] overflow-auto pr-2">
                  {ingredients.map((ing) => (
                      <button
                          key={String(ing.id)}
                          onClick={() => handleAddIngredient(ing.id)}
                          className="w-full flex items-center gap-3 rounded-2xl bg-[#2a1b16]/70 border border-white/10 px-4 py-3 hover:bg-[#2a1b16] transition"
                          type="button"
                          title="Ajouter au premier slot vide"
                      >
                        <img
                            src={getIngredientIcon(ing)}
                            alt={ing.name}
                            className="h-10 w-10 object-contain"
                            onError={(e) => {
                              // fallback si image introuvable
                              e.currentTarget.style.display = "none";
                            }}
                        />
                        <span className="font-semibold">{ing.name}</span>
                      </button>
                  ))}

                  {ingredients.length === 0 && (
                      <div className="text-sm opacity-70">
                        Aucun ingrédient chargé (vérifie /ingredients).
                      </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-3">RECETTE</h2>

                <div className="w-full space-y-3">
                  {slots.map((slot, idx) => (
                      <div
                          key={idx}
                          className="w-full rounded-2xl bg-[#2a1b16]/60 border border-white/10 px-4 py-3 flex items-center justify-between"
                      >
                        <span className="font-semibold">SLOT {idx + 1}</span>
                        <span className="opacity-80">{slotLabel(slot)}</span>
                      </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-xl border border-white/20 px-6 py-2 hover:bg-white/10 transition"
                  >
                    RESET
                  </button>

                  <button
                      type="button"
                      onClick={handleBrew}
                      disabled={loading}
                      className="rounded-xl bg-[#c98d5b] text-black font-bold px-6 py-2 hover:brightness-110 disabled:opacity-60 transition"
                  >
                    {loading ? "BREW..." : "BREW"}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3">PROFIL DE LA BOISSON</h2>

                <div className="space-y-4 rounded-2xl bg-[#2a1b16]/40 border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <span>WARM</span>
                    <span className="opacity-70">0/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>COOL</span>
                    <span className="opacity-70">0/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SWEET</span>
                    <span className="opacity-70">0/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BITTER</span>
                    <span className="opacity-70">0/5</span>
                  </div>

                  <p className="text-xs opacity-70 mt-2">
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
}

export default Lab;
