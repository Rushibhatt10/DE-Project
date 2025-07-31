// src/pages/Signup.jsx
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
import { Mail, Lock, Phone, ShieldCheck } from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        role,
        method: "email",
      });

      setSuccessMsg("Signup successful!");
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

    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", result.user.uid), {
        name: result.user.displayName || name,
        email: result.user.email,
        role,
        method: "google",
      });

      setSuccessMsg("Google signup successful!");
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
      window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", { size: "invisible" }, auth);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await confirmationResult.confirm(otp);
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        phone,
        role,
        method: "phone",
      });

      setSuccessMsg("Phone verified!");
      setTimeout(() => {
        role === "provider" ? navigate("/provider-dashboard") : navigate("/user-dashboard");
      }, 2000);
    } catch (error) {
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pink-50 to-blue-50 dark:from-[#1e1e2e] dark:via-[#1a1a1a] dark:to-[#121212] px-4">
      <div className="w-full max-w-md p-8 backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-white/30 dark:border-white/10 shadow-xl rounded-2xl space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">
          Create Your Account
        </h2>

        {/* Role Heading */}
        <h3 className="text-center text-gray-700 dark:text-gray-300 font-semibold">
          Select your role
        </h3>

        {/* Role Toggle */}
        <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full flex p-1 select-none max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setRole("user")}
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
            className={`flex-1 py-2 rounded-full text-center font-semibold transition-all duration-300 ${
              role === "provider"
                ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg scale-105"
                : "text-gray-700 dark:text-gray-300 hover:text-pink-500"
            }`}
          >
            Provider
          </button>
        </div>

        {/* Email Signup */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3 text-blue-500" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-pink-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-pink-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up with Email"}
          </button>
        </form>

        {/* Divider */}
        <div className="text-center text-gray-500 dark:text-gray-300">or</div>

        {/* Google Signup */}
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

        {/* Phone/OTP Signup */}
        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-blue-500" />
            <input
              type="tel"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Error/Success Message */}
        {successMsg && <p className="mt-4 text-green-600 font-semibold text-center">{successMsg}</p>}
        {errorMsg && <p className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</p>}

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-pink-500 underline hover:text-pink-600">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
