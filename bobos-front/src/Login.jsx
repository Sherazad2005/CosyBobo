import Login from Login

function Login(){
  return (
    <div className="min-h-screen flex items-center justify-center bg -[#F5E9DA]">
      <div className="bg-white/90 border border-[#4B2E2B]/10 rounded-3xl shadow-xl px-10 py-8 max-w-md w-full">
      <h1 className="text-3xl font-extrabold text-[#4B2E2B] text-center">Bobo&apos;s Coffee Lab
      </h1>
      <p className="mt-2 text-center text-sm text-[#4B2E2B]/70">
        Connect to manage your coffee lab
        </p>
        <form className="mt-6 space-y-4">
          <div>
        <label className="block text-sm font-medium text-[#4B2E2B]">
          Email
        </label>
        <input type="email" className="mt-1 w-full rounded-full border border- [4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80" placeholder="toi@bobos.cafe"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4B2E2B]">
            Password
          </label>
          <input
          type="password"
          className="mt-1 w-full rounded-full border border-[#4B2E2B]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA66A] focus:border-transparent bg-white/80"
          placeholder="........"/>
          </div>
          <button type="submit" className="mt-2 w-full rounded-full bg-[#4B2E2B] py-2.5 text-sm font-semibold text-white hover:bg-[#3A221f] transition-transform hover:scale-[1.01]">
            Login
          </button>
          </form>
      </div>
    </div>
  );
}

export default Login;