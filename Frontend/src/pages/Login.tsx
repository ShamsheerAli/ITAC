const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      
      {/* LOGIN CARD */}
      <div className="bg-gray-300 rounded-xl w-[420px] px-10 py-8">
        
        {/* EMAIL */}
        <label className="block text-black font-bold text-base mb-2">
          Email:
        </label>
        <input
          type="email"
          className="bg-white w-full h-12 rounded-xl px-4 mb-6 outline-none"
        />

        {/* PASSWORD */}
        <label className="block text-black font-bold text-base mb-2">
          Password:
        </label>
        <input
          type="password"
          className="bg-white w-full h-12 rounded-xl px-4 mb-8 outline-none"
        />

        {/* LOGIN BUTTON */}
        <div className="flex justify-center">
          <button
            className="
              bg-orange-500
              text-white
              font-bold
              px-14
              py-3
              rounded-sm
              hover:bg-orange-600
              transition
            "
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
