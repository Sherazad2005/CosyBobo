import { useState } from "react";

const API_URL = "https://localhost:3001"; 

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cafeName, setCafeName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
}

async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, cafeName }),
    });

        if (!response.ok) {
            setError("Error registering");
            return;
        }
        window.location.href = "/"; // redirection vers login après inscription
    } catch (err) {
        setError("Connection to server error");
    } finally {
        setLoading(false);
    }
}

return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5E9DA]">
        <div className="bg-white/90 border border-[#4B2E2B]/10 rounded-3xl shadow-xl px-10 py-8 max-w-md w-full">
            <h1 className="text-3xl font-extrabold text-[#4B2E2B] text-center">Bobo&apos;s Coffee Lab</h1>
            <p className="mt-2 text-center text-sm text-[#4B2E2B]/70">Create an account to manage your coffee lab</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-[#4B2E2B]">cafe name</label>
                    <input
                        type="text"
                        className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
                        placeholder="Enter your cafe name"
                        value={cafeName}
                        onChange={(e) => setCafeName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#4B2E2B]">Email</label>
                    <input
                        type="email"
                        className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#4B2E2B]">Password</label>
                    <input
                        type="password"
                        className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    /> 
                </div>

                {error && (<p className="text-sm text-red-600">{error}</p>)}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-full bg-[#4B2E2B] py-2.5 text-sm font-semibold text-white hover:bg-[#3A221f] transition-transform hover:scale-[1.01]"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <p className="mt-4 text-center text-xs text-[#4B2E2B]/70">
                Already have an account? <a href="/" className="font-semibold text-[#7BA66A]">Login here</a>
            </p>
        </div>
    </div>
);


export default Register;