import React, { useState } from "react";
import { auth, db, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role,
        method: "email",
      });

      setSuccessMsg("🎉 Signup successful! Redirecting you shortly...");
      setTimeout(() => {
        role === "provider" ? navigate("/provider-dashboard") : navigate("/user-dashboard");
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || name,
        email: user.email,
        role,
        method: "google",
      });

      setSuccessMsg("🎉 Google signup successful! Redirecting...");
      setTimeout(() => {
        role === "provider" ? navigate("/provider-dashboard") : navigate("/user-dashboard");
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
      }, auth);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMsg("📲 OTP sent!");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        role,
        method: "phone",
      });

      setSuccessMsg("✅ Phone verified! Redirecting...");
      setTimeout(() => {
        role === "provider" ? navigate("/provider-dashboard") : navigate("/user-dashboard");
      }, 2000);
    } catch (error) {
      setErrorMsg("❌ Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1e1e2e] px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-white/10 shadow-xl rounded-2xl space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-pink-500">Sign Up</h2>

        <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full flex p-1 select-none max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setRole("user")}
            disabled={loading}
            className={`flex-1 py-2 rounded-full text-center font-semibold transition-all duration-300 ${
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
            className={`flex-1 py-2 rounded-full text-center font-semibold transition-all duration-300 ${
              role === "provider"
                ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg scale-105"
                : "text-gray-700 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Provider
          </button>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up with Email"}
          </button>
        </form>

        <div className="text-center text-gray-500 dark:text-gray-300">or</div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-900 hover:shadow-md transition-all"
        >
          <img
            src="https://banner2.cleanpng.com/20171216/dbb/av2e6z0my.webp"
            alt="Google Logo"
            className="w-5 h-5"
          />
          {loading ? "Please wait..." : "Sign up with Google"}
        </button>

        <div className="space-y-4">
          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 border border-blue-400 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 transition-all"
            >
              Send OTP
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
            >
              Verify OTP
            </button>
          )}
        </div>

        <div id="recaptcha-container"></div>

        {successMsg && <p className="mt-4 text-green-600 font-semibold text-center">{successMsg}</p>}
        {errorMsg && <p className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</p>}

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-pink-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
