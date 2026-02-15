import { useState } from 'react';

const API_URL = 'http://localhost:3001'; // http, pas https en local

// Ingrédients achetables
const SHOP_ITEMS = [
  { id: 'coffee', name: 'Coffee', price: 10 },
  { id: 'milk', name: 'Milk', price: 5 },
  { id: 'matcha', name: 'Matcha', price: 15 },
  { id: 'chai', name: 'Chai', price: 12 },
  { id: 'ginger', name: 'Ginger', price: 8 },
  { id: 'cinnamon', name: 'Cinnamon', price: 7 },
  { id: 'honey', name: 'Honey', price: 9 },
  { id: 'lemon', name: 'Lemon', price: 6 },
];

function Market() {
  // quantité pour chaque item du shop
  const [quantities, setQuantities] = useState(
    SHOP_ITEMS.reduce((acc, item) => {
      acc[item.id] = 0;
      return acc;
    }, {}),
  );

  const [cash, setCash] = useState(0); // à remplir plus tard avec /state
  const [message, setMessage] = useState('');

  // changer la quantité d'un item
  function handleQuantityChange(itemId, value) {
    const q = Math.max(0, parseInt(value, 10) || 0); // pas de négatif
    setQuantities((prev) => ({ ...prev, [itemId]: q }));
  }

  // coût total local
  const totalCost = SHOP_ITEMS.reduce(
    (total, item) => total + item.price * (quantities[item.id] || 0),
    0,
  );

  // achat et envoi au back
  async function handleBuy() {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to buy ingredients');
      return;
    }

    // construire une liste d’items à acheter
    const itemsToBuy = SHOP_ITEMS
      .filter((item) => quantities[item.id] > 0)
      .map((item) => ({
        id: item.id, // adapte à ce que ton back attend (ingredientId ?)
        quantity: quantities[item.id],
      }));

    if (itemsToBuy.length === 0) {
      setMessage('Please select at least one ingredient to buy');
      return;
    }

    try {
      setMessage('');
      const response = await fetch(`${API_URL}/market/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsToBuy }),
      });

      if (!response.ok) {
        let errorText = 'Error buying ingredients, not enough money?';
        try {
          const errorData = await response.json();
          if (errorData.message) errorText = errorData.message;
        } catch {
          // ignore si pas de JSON
        }
        setMessage(errorText);
        return;
      }

      const data = await response.json();
      // à adapter au format exact de ta réponse
      if (typeof data.cash === 'number') {
        setCash(data.cash);
      }
      setMessage('Purchase successful!');

      // reset des quantités après achat
      setQuantities(
        SHOP_ITEMS.reduce((acc, item) => {
          acc[item.id] = 0;
          return acc;
        }, {}),
      );
    } catch (err) {
      console.error(err);
      setMessage('Connection to server error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5E9DA]">
      <div className="bg-[#1b120f]/90 text-[#f5e9da] rounded-3xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-wide">Bobo&apos;s Market</h1>
          <div className="text-sm">
            Cash : <span className="font-semibold">{cash} $</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SHOP_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 bg-[#2a1c16] border border-black/40 rounded-xl px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-[#d0bba3]">{item.price} $</div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <input
                  type="number"
                  min="0"
                  className="w-16 rounded-full border border-black/40 px-2 py-1 text-sm bg-[#1b120f]"
                  value={quantities[item.id]}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm">
            Total : <span className="font-semibold">{totalCost} $</span>
          </div>
          <button
            type="button"
            onClick={handleBuy}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg bg-[#d89a6a] text-[#1b130f] hover:bg-[#e5aa7a] transition"
          >
            Buy
          </button>
        </div>

        {message && (
          <p className="mt-3 text-sm text-[#f5b2b2]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Market;
