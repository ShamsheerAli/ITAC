import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-white">

      {/* SIGNUP CARD */}
      <div className="bg-gray-300 rounded-xl w-[420px] px-10 py-8">

        {/* EMAIL */}
        <label className="block text-black font-semibold mb-2">
          Email:
        </label>
        <input
          type="email"
          className="bg-white w-full h-12 rounded-xl px-4 mb-6 outline-none"
        />

        {/* PASSWORD */}
        <label className="block text-black font-semibold mb-2">
          Password:
        </label>
        <input
          type="password"
          className="bg-white w-full h-12 rounded-xl px-4 mb-6 outline-none"
        />

        {/* RE-PASSWORD */}
        <label className="block text-black font-semibold mb-2">
          Re-Enter Password:
        </label>
        <input
          type="password"
          className="bg-white w-full h-12 rounded-xl px-4 mb-6 outline-none"
        />

        {/* LOGIN LINK */}
        <p className="text-sm mb-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

        {/* SIGNUP BUTTON */}
        <div className="flex justify-center">
          <button
            className="
              bg-orange-500
              text-white
              font-semibold
              px-14
              py-3
              rounded-sm
              hover:bg-orange-600
              transition
            "
          >
            Signup
          </button>
        </div>

      </div>
    </div>
  );
};

export default Signup;
