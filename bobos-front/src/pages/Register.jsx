import { useState } from "react";

function Register() {
    const [restaurantName, setRestaurantName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    restaurantName,
                    email,
                    password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(data?.error || "Error registering");
                return;
            }

            if (data?.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/lab";
            } else {

                window.location.href = "/login";
            }
        } catch (err) {
            setError("connection to server error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5E9DA]">
            <div className="bg-white/90 border border-[#4B2E2B]/10 rounded-3xl shadow-xl px-10 py-8 max-w-md w-full">
                <h1 className="text-3xl font-extrabold text-[#4B2E2B] text-center">
                    Bobo&apos;s Coffee Lab
                </h1>
                <p className="mt-2 text-center text-sm text-[#4B2E2B]/70">
                    Create an account to start your coffee lab
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-[#4B2E2B]">
                            Restaurant name
                        </label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
                            placeholder="La tour d’émeraude"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4B2E2B]">
                            Email
                        </label>
                        <input
                            type="email"
                            className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
                            placeholder="you@bobos.cafe"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4B2E2B]">
                            Password
                        </label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
                            placeholder="......."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-full bg-[#4B2E2B] py-2.5 text-sm font-semibold text-white hover:bg-[#3a221f] transition-transform hover:scale-[1.01] disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

                    <p className="text-center text-sm text-[#4B2E2B]/70">
                        Already have an account?{" "}
                        <a href="/login" className="text-[#4B2E2B] underline">
                            Login
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
