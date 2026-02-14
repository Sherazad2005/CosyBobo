// Ecran de lab for the coffee making part
// image de fond --> panneau central -- liste des ingrédients clickable
// --> 3 emplacements (slot) pour les ingrédients choisis + deux boutons (reset et brew)

import { useState } from 'react';

// un id = un ingredient et un nom affiché et une icône dans /public/ingredients
const INGREDIENTS = [
  { id: 'coffee', name: 'Coffee', icon: '/ingredients/coffee.png' },
  { id: 'milk', name: 'Milk', icon: '/ingredients/milk.png' },
  { id: 'matcha', name: 'Matcha', icon: '/ingredients/matcha.png' },
  { id: 'chai', name: 'Chai', icon: '/ingredients/chai.png' },
  { id: 'ginger', name: 'Ginger', icon: '/ingredients/ginger.png' },
  { id: 'cinnamon', name: 'Cinnamon', icon: '/ingredients/cinnamon.png' },
  { id: 'honey', name: 'Honey', icon: '/ingredients/honey.png' },
  { id: 'lemon', name: 'Lemon', icon: '/ingredients/lemon.png' },
];

function Lab() {
  //"slots" = de trois cases vides au debut
  const [slots, setSlots] = useState([null, null, null]);

  function handleAddIngredient(ingredientId) {
    setSlots((currentSlots) => {
      // On copie le tableau actuel pour pas modifier manuellement
      const updated = [...currentSlots];

      // Je cherche la première position qui est vide (null)
      const emptyIndex = updated.findIndex((slot) => slot === null);

      // si case vide on y met l'ingredient
      if (emptyIndex !== -1) {
        updated[emptyIndex] = ingredientId;
      }

      return updated;
    });
  }

  // Vide complètement les 3 slots (remet les cases à null null null)
  function handleReset() {
    setSlots([null, null, null]);
  }

  // Pour l'instant brew va juste faire des log des ingredients choisis
  // et apres on va envoyer les ids au back via /lab/experiment
  function handleBrew() {
    console.log('Brewing with slots:', slots);
    // Appeler l'api ici pour relier au backend
  }

  // TOUT le JSX doit être retourné ici
  return (
    <>
      {/* Conteneur avec image de fond */}
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/cafe-bg.jpg')" }} // image dans public/cafe-bg.jpg.jpg
      >
        {/* Panneau central type machine Coffee Talk */}
        <div className="bg-[#1b120f]/85 border border-black/40 rounded-3xl shadow-2xl p-6 w-full max-w-5xl text-[#f5e9da]">
          {/* titre */}
          <h1 className="text-2xl font-bold text-center mb-4 tracking-wide">
            Bobo&apos;s Brew Station
          </h1>

          <div className="grid grid-cols-3 gap-4">
            {/* Colonne gauche : liste des ingrédients */}
            <div>
              <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest">
                Ingrédients
              </h2>
              <div className="space-y-2">
                {INGREDIENTS.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => handleAddIngredient(ingredient.id)}
                    className="w-full flex items-center gap-3 bg-[#2a1c16] hover:bg-[#3a261d] border border-black/40 rounded-xl px-3 py-2 text-left transition"
                  >
                    <img
                      src={ingredient.icon}
                      alt={ingredient.name}
                      className="h-8 w-8 image-pixel"
                    />
                    <span className="text-sm font-medium">
                      {ingredient.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colonne centre : les 3 slots */}
            <div>
              <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest text-center">
                Recette
              </h2>
              <div className="space-y-3">
                {slots.map((slot, index) => {
                  // Je recup l'ingredient complet si il y a dans le slot
                  const ingredient = INGREDIENTS.find((ing) => ing.id === slot);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#2a1c16] border border-black/40 rounded-xl px-4 py-2"
                    >
                      <span className="text-xs uppercase tracking-widest text-[#d0bba3]">
                        Slot {index + 1}
                      </span>
                      {ingredient ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={ingredient.icon}
                            alt={ingredient.name}
                            className="h-8 w-8 image-pixel"
                          />
                          <span className="text-sm font-medium">
                            {ingredient.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8c7360]">
                          (vide)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Boutons Reset / Brew */}
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg border border-[#d89a6a]/60 text-[#d89a6a] hover:bg-[#d89a6a]/10 transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleBrew}
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg bg-[#d89a6a] text-[#1b130f] hover:bg-[#e5aa7a] transition"
                >
                  Brew
                </button>
              </div>
            </div>

            {/* Colonne droite panneau d'infos pour l'instant c'est un décor */}
            <div>
              <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest">
                Profil de la boisson
              </h2>
              <div className="space-y-3 text-xs">
                {['Warm', 'Cool', 'Sweet', 'Bitter'].map((label) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="uppercase tracking-widest">
                        {label}
                      </span>
                      <span className="text-[#8c7360]">0 / 5</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 flex-1 bg-[#2a1c16] border border-black/50 rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lab;
