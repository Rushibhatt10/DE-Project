import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, Loader2, Clock, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import InputGroup from "../components/ui/InputGroup";
import MagneticButton from "../components/ui/MagneticButton";
import { toast } from "react-hot-toast";

const ProviderDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("LOADING"); // LOADING, NONE, PENDING, APPROVED, REJECTED
  const [idImage, setIdImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [providerInfo, setProviderInfo] = useState({
    fullName: "",
    phone: "",
    serviceType: "",
    govIdType: "Aadhaar",
    address: "",
    city: "",
    pincode: "",
    yearsOfExperience: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProvider(user);
        checkVerificationStatus(user.uid);
      } else {
        navigate("/signin");
      }
    });
    return () => unsub();
  }, [navigate]);

  const checkVerificationStatus = async (uid) => {
    try {
      const docRef = doc(db, "verified_providers", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setVerificationStatus(data.status || "PENDING");
        if (data.status === "APPROVED") {
          navigate("/provider-admin");
        }
      } else {
        setVerificationStatus("NONE");
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      toast.error("Failed to load profile status");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!provider) return toast.error("User not authenticated. Please refresh.");
    if (!idImage) return toast.error("Please upload your ID document.");

    // Basic Validation
    if (providerInfo.phone.length < 10) return toast.error("Please enter a valid phone number.");
    if (!providerInfo.pincode.match(/^\d{6}$/)) return toast.error("Please enter a valid 6-digit pincode.");

    setLoading(true);

    try {
      let downloadURL = "";
      try {
        // Sanitize filename
        const sanitizedName = idImage.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const storagePath = `verification_docs/${provider.uid}/${Date.now()}_${sanitizedName}`;

        const storageRef = ref(storage, storagePath);

        // Create upload task
        const uploadTask = uploadBytesResumable(storageRef, idImage);

        // Wrap upload in a promise to handle progress and timeout
        downloadURL = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error("Upload timed out."));
          }, 30000); // 30 second timeout

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
            },
            (error) => {
              clearTimeout(timeoutId);
              reject(error);
            },
            async () => {
              clearTimeout(timeoutId);
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      } catch (uploadError) {
        console.error("Upload failed, using placeholder:", uploadError);
        toast.error("Document upload failed. Submitting with placeholder.");
        // Fallback to a placeholder image if upload fails
        downloadURL = "https://placehold.co/400x600?text=Document+Upload+Failed";
      }

      const providerDoc = {
        ...providerInfo,
        email: provider.email,
        uid: provider.uid,
        idImageURL: downloadURL,
        status: "PENDING",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "verified_providers", provider.uid), providerDoc);

      toast.success("Verification submitted successfully!");
      setVerificationStatus("PENDING");
    } catch (err) {
      console.error("Verification Error:", err);
      toast.error(`Submission failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (verificationStatus === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- PENDING STATE ---
  if (verificationStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full p-8 text-center border-border bg-card shadow-2xl">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
          <p className="text-muted-foreground mb-6">
            Your details have been submitted and are currently under review by our admin team.
            This usually takes 24-48 hours.
          </p>
          <div className="p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground">
            You will be notified once your profile is approved.
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- REJECTED STATE ---
  if (verificationStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20 bg-red-500/5">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-500">Verification Rejected</h2>
          <p className="text-muted-foreground mb-6">
            Unfortunately, your verification request was rejected. Please review your details and try again.
          </p>
          <MagneticButton
            onClick={() => setVerificationStatus("NONE")}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            Try Again
          </MagneticButton>
        </GlassCard>
      </div>
    );
  }

  // --- FORM STATE (NONE) ---
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans flex items-center justify-center p-6 selection:bg-cyan-500/20">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        <GlassCard className="p-8 md:p-12 border-border bg-card/60 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <ShieldCheck className="w-10 h-10 text-cyan-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Provider Verification</h1>
            <p className="text-muted-foreground">Complete your profile to start offering services.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <InputGroup
                label="Full Name"
                type="text"
                value={providerInfo.fullName}
                onChange={(e) => setProviderInfo({ ...providerInfo, fullName: e.target.value })}
                required
                placeholder="John Doe"
              />
              <InputGroup
                label="Phone Number"
                type="tel"
                value={providerInfo.phone}
                onChange={(e) => setProviderInfo({ ...providerInfo, phone: e.target.value })}
                required
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Service & Experience */}
            <div className="grid md:grid-cols-2 gap-6">
              <InputGroup
                label="Service Category"
                type="text"
                value={providerInfo.serviceType}
                onChange={(e) => setProviderInfo({ ...providerInfo, serviceType: e.target.value })}
                required
                placeholder="e.g. Electrician, Plumber"
              />
              <InputGroup
                label="Years of Experience"
                type="number"
                value={providerInfo.yearsOfExperience}
                onChange={(e) => setProviderInfo({ ...providerInfo, yearsOfExperience: e.target.value })}
                required
                placeholder="e.g. 5"
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <InputGroup
                label="Full Address"
                type="text"
                value={providerInfo.address}
                onChange={(e) => setProviderInfo({ ...providerInfo, address: e.target.value })}
                required
                placeholder="Shop No, Street, Area"
              />
              <div className="grid grid-cols-2 gap-6">
                <InputGroup
                  label="City"
                  type="text"
                  value={providerInfo.city}
                  onChange={(e) => setProviderInfo({ ...providerInfo, city: e.target.value })}
                  required
                  placeholder="Ahmedabad"
                />
                <InputGroup
                  label="Pincode"
                  type="text"
                  value={providerInfo.pincode}
                  onChange={(e) => setProviderInfo({ ...providerInfo, pincode: e.target.value })}
                  required
                  placeholder="380001"
                  maxLength={6}
                />
              </div>
            </div>

            {/* ID Proof */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-xs text-muted-foreground absolute left-4 -top-2.5 bg-card px-1 z-10">ID Type</label>
                <select
                  value={providerInfo.govIdType}
                  onChange={(e) => setProviderInfo({ ...providerInfo, govIdType: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors text-center cursor-pointer relative group bg-secondary/20 flex flex-col items-center justify-center h-[52px]">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdImage(e.target.files[0])}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
                  <Upload className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{idImage ? idImage.name : "Upload Document"}</span>
                </div>
              </div>
            </div>

            <MagneticButton
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-foreground text-background dark:bg-cyan-500 dark:text-black font-bold rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Verification"
              )}
            </MagneticButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ProviderDashboard;
