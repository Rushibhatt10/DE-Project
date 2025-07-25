import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
      });

      setSuccessMsg("🎉 Signup successful! Redirecting you shortly...");
      setLoading(false);

      setTimeout(() => {
        if (role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1e1e2e] px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-white/10 shadow-xl rounded-2xl space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-pink-500">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {/* Sexy Role Selector */}
          <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full flex p-1 select-none max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setRole("user")}
              disabled={loading}
              className={`flex-1 py-2 rounded-full text-center font-semibold transition-all duration-300
                ${
                  role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:text-pink-500"
                }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              disabled={loading}
              className={`flex-1 py-2 rounded-full text-center font-semibold transition-all duration-300
                ${
                  role === "provider"
                    ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:text-pink-500"
                }`}
            >
              Provider
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Messages */}
        {successMsg && (
          <p className="mt-4 text-green-600 font-semibold text-center">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</p>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
          Already have an account? <a href="/signin" className="text-pink-500">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
