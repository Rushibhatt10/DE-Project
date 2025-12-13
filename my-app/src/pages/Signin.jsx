import React, { useState } from "react";
import { auth, db, provider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowLeft, Phone, Mail, Lock } from "lucide-react";

import GlassCard from "../components/ui/GlassCard";
import InputGroup from "../components/ui/InputGroup";
import MagneticButton from "../components/ui/MagneticButton";
import FloatingElement from "../components/ui/FloatingElement";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authMethod, setAuthMethod] = useState("email"); // email or phone

  const navigate = useNavigate();

  const redirectToDashboard = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const role = userSnap.data().role;
      if (role === "provider") {
        navigate("/provider-dashboard");
      } else {
        navigate("/user-dashboard");
      }
      toast.success("Welcome back!");
    } else {
      toast.error("User role not found.");
    }
  };

  const handleEmailSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await redirectToDashboard(result.user.uid);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      await redirectToDashboard(result.user.uid);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success("OTP sent!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      await redirectToDashboard(result.user.uid);
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 font-sans transition-colors duration-300 selection:bg-accent selection:text-accent-foreground">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 z-20">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 md:p-10 border border-border bg-card shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">Sign in to access your account</p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex p-1 bg-secondary rounded-xl mb-8">
            <button
              onClick={() => setAuthMethod("email")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${authMethod === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod("phone")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${authMethod === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Phone
            </button>
          </div>

          {authMethod === "email" ? (
            <form onSubmit={handleEmailSignin} className="space-y-4">
              <InputGroup
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
              <InputGroup
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
              </div>

              <MagneticButton
                type="submit"
                className="w-full py-4 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </MagneticButton>
            </form>
          ) : (
            <div className="space-y-4">
              <InputGroup
                label="Phone Number"
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />

              {otpSent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <InputGroup
                    label="OTP"
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                </motion.div>
              )}

              {!otpSent ? (
                <MagneticButton
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </MagneticButton>
              ) : (
                <MagneticButton
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </MagneticButton>
              )}
            </div>
          )}

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <span className="relative px-4 bg-card text-muted-foreground text-xs uppercase tracking-wider">or continue with</span>
          </div>

          <button
            onClick={handleGoogleSignin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 border border-border rounded-xl font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>

          <div id="recaptcha-container"></div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-bold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signin;
