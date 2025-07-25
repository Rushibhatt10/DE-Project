import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Get user's role from Firestore
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        localStorage.setItem("userRole", role);

        setSuccessMsg("🎉 Successfully signed in! Redirecting you shortly...");
        setLoading(false);

        setTimeout(() => {
          if (role === "user") {
            navigate("/user-dashboard");
          } else if (role === "provider") {
            navigate("/provider-dashboard");
          } else {
            alert("Invalid role found. Please contact support.");
          }
        }, 2000);
      } else {
        setErrorMsg("User data not found. Please contact support.");
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg("Signin failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1e1e2e] px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-white/10 border dark:border-white/10 shadow-xl backdrop-blur-xl rounded-2xl space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-pink-500">
          Sign In to Your Account
        </h2>
        <form onSubmit={handleSignin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {successMsg && (
          <p className="mt-4 text-green-600 font-semibold text-center">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</p>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          Don’t have an account?{" "}
          <a href="/signup" className="text-pink-500 hover:underline">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signin;
