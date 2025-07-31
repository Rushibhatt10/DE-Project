// src/components/PhoneAuth.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const PhoneAuth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA resolved", response);
          },
          "expired-callback": () => {
            alert("reCAPTCHA expired. Please refresh the page.");
          },
        },
        auth
      );
    }
  };

  const sendOtp = async () => {
    if (!phone.startsWith("+")) {
      alert("Phone number must start with country code, e.g., +91xxxxxxxxxx");
      return;
    }

    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      alert("OTP has been sent!");
    } catch (error) {
      console.error("OTP send error:", error);
      alert("Failed to send OTP. Check console.");
    }
  };

  const verifyOtp = async () => {
    if (!confirmationResult) {
      alert("Please request OTP first.");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      alert(`Phone verified! Welcome ${result.user.phoneNumber}`);
      // you can navigate or store user info here
    } catch (error) {
      console.error("OTP verification failed:", error);
      alert("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Phone Login</h2>

      <input
        type="text"
        placeholder="Enter phone e.g. +91xxxxxxxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <div id="recaptcha-container"></div>

      <button
        onClick={sendOtp}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mb-4"
      >
        Send OTP
      </button>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <button
        onClick={verifyOtp}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
      >
        Verify OTP
      </button>
    </div>
  );
};

export default PhoneAuth;
