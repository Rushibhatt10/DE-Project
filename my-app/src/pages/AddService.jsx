import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle,
  MapPin,
  DollarSign,
  Tag,
  Clock,
  Info,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import Card from "../components/ui/Card";
import MagneticButton from "../components/ui/MagneticButton";
import { toast } from "react-hot-toast";

// Standard Market Rates Data
const STANDARD_RATES = {
  "Cleaning": {
    "Full Home Deep Cleaning": 1499,
    "Kitchen Cleaning": 499,
    "Bathroom Cleaning": 399,
    "Sofa Cleaning": 299,
    "Carpet Cleaning": 249
  },
  "Electrical": {
    "Fan Repair/Installation": 149,
    "Switchboard Repair": 99,
    "Tubelight/Bulb Replacement": 49,
    "MCB Change": 249,
    "Wiring Fault Check": 199
  },
  "Plumbing": {
    "Tap Repair/Replacement": 149,
    "Pipe Leakage Fix": 299,
    "Water Tank Cleaning": 499,
    "Basin/Sink Blockage": 199,
    "Toilet Repair": 349
  },
  "AC Repair": {
    "AC Service (Split/Window)": 499,
    "Gas Refill": 1499,
    "Installation/Uninstallation": 999,
    "Cooling Issue Fix": 299
  },
  "Carpentry": {
    "Furniture Assembly": 299,
    "Door/Window Repair": 199,
    "Lock Replacement": 149,
    "Drawer Channel Fix": 149
  },
  "Gardening": {
    "Lawn Mowing": 299,
    "Plant Pruning": 199,
    "Garden Maintenance": 499
  },
  "Other": {
    "General Service": 99
  }
};

const AddService = () => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    name: "", // Will be auto-filled by subcategory or custom
    description: "",
    price: "",
    useStandardPrice: true,
    location: "",
    address: "",
    availability: "Anytime",
    estimatedTime: "1 Hour"
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const navigate = useNavigate();

  // Auth Check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProvider(user);
        // Check verification status
        try {
          const providerDoc = await getDoc(doc(db, "verified_providers", user.uid));

          if (!providerDoc.exists() || providerDoc.data().status !== "APPROVED") {
            toast.error("You must be a verified provider to add services.");
            navigate("/provider-dashboard");
            return;
          }
          setLoading(false);
        } catch (err) {
          console.error("Error checking verification:", err);
          navigate("/provider-dashboard");
        }
      } else {
        navigate("/signin");
      }
    });
    return () => unsub();
  }, [navigate]);

  // Geo-location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=76470fd0d5294effa24ded7a415a7fdf`
          );
          const data = await res.json();
          const details = data.features[0]?.properties;
          const area = details?.neighbourhood || details?.suburb || details?.city || "";
          const state = details?.state || "";
          const fullLocation = `${area}, ${state}`;
          setFormData((prev) => ({ ...prev, location: fullLocation }));
        } catch (err) {
          console.error("Geoapify location fetch failed:", err);
        }
      });
    }
  }, []);

  // Handle Category Change
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: cat,
      subcategory: "",
      name: "",
      price: "",
      useStandardPrice: true
    }));
  };

  // Handle Subcategory Change
  const handleSubcategoryChange = (e) => {
    const sub = e.target.value;
    const standardPrice = STANDARD_RATES[formData.category]?.[sub] || "";

    setFormData(prev => ({
      ...prev,
      subcategory: sub,
      name: sub === "Other" ? "" : sub,
      price: prev.useStandardPrice ? standardPrice : prev.price
    }));
  };

  // Handle Price Toggle
  const togglePriceMode = () => {
    setFormData(prev => {
      const newUseStandard = !prev.useStandardPrice;
      let newPrice = prev.price;

      if (newUseStandard && prev.category && prev.subcategory) {
        newPrice = STANDARD_RATES[prev.category]?.[prev.subcategory] || "";
      }

      return {
        ...prev,
        useStandardPrice: newUseStandard,
        price: newPrice
      };
    });
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) return toast.error("Please upload at least one image");
    if (!formData.category || !formData.name || !formData.price) return toast.error("Please fill all required fields");

    setUploading(true);
    try {
      // Upload Images to ImgBB
      console.log("Starting upload process for", imageFiles.length, "files");
      const imageUrls = await Promise.all(
        imageFiles.map(async (file, index) => {
          console.log(`File ${index}: Starting upload for ${file.name}`);
          const formData = new FormData();
          formData.append("image", file);
          try {
            const res = await axios.post(
              `https://api.imgbb.com/1/upload?key=15b6336c4094168e30360aa37d2f29be`,
              formData
            );
            console.log(`File ${index}: Upload success`, res.data);
            return res.data.data.url;
          } catch (err) {
            console.error(`File ${index}: Upload failed`, err.response?.data || err.message);
            throw new Error(err.response?.data?.error?.message || "Image upload failed");
          }
        })
      );

      // Save to Firestore
      await addDoc(collection(db, "provider_services"), {
        ...formData,
        price: parseInt(formData.price),
        imageUrls,
        providerEmail: provider.email,
        providerUid: provider.uid,
        createdAt: new Date(),
        status: "Active"
      });

      setSuccess(true);
      setTimeout(() => navigate("/provider-admin"), 2000);
    } catch (err) {
      console.error("Error adding service:", err);
      toast.error(`Failed to add service: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/provider-admin")}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Add New Service</h1>
            <p className="text-muted-foreground">List your expertise and start earning</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Category Section */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" /> Service Category
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(STANDARD_RATES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                  <select
                    value={formData.subcategory}
                    onChange={handleSubcategoryChange}
                    disabled={!formData.category}
                    className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all disabled:opacity-50"
                    required
                  >
                    <option value="">Select Service Type</option>
                    {formData.category && Object.keys(STANDARD_RATES[formData.category]).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>
              </div>

              {formData.subcategory === "Other" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Custom Service Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Custom Repair Work"
                    className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none"
                    required
                  />
                </div>
              )}
            </Card>

            {/* Pricing Section */}
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Pricing
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className={formData.useStandardPrice ? "text-primary font-bold" : "text-muted-foreground"}>Standard Rate</span>
                  <button
                    type="button"
                    onClick={togglePriceMode}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.useStandardPrice ? "bg-primary" : "bg-secondary"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.useStandardPrice ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                  <span className={!formData.useStandardPrice ? "text-primary font-bold" : "text-muted-foreground"}>Custom Rate</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-3.5 text-muted-foreground">₹</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  readOnly={formData.useStandardPrice}
                  className={`w-full p-3 pl-8 rounded-xl border border-border outline-none transition-all ${formData.useStandardPrice
                    ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                    : "bg-secondary/30 focus:border-primary"
                    }`}
                  required
                />
              </div>

              {formData.useStandardPrice && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> Based on current market rates for this service.
                </p>
              )}
            </Card>

            {/* Description & Details */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Details
              </h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Describe what's included in this service..."
                  className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Estimated Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <select
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none"
                    >
                      <option>30 Mins</option>
                      <option>1 Hour</option>
                      <option>2 Hours</option>
                      <option>3 Hours</option>
                      <option>4+ Hours</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none"
                  >
                    <option>Anytime</option>
                    <option>Weekdays Only</option>
                    <option>Weekends Only</option>
                  </select>
                </div>
              </div>
            </Card>

          </div>

          {/* Right Column: Images & Location */}
          <div className="space-y-6">

            {/* Image Upload */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Photos
              </h2>

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/30 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground mt-1">Max 5 images (JPG, PNG)</p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Location */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Location
              </h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Service Area</label>
                <input
                  type="text"
                  value={formData.location}
                  readOnly
                  className="w-full p-3 rounded-xl bg-secondary/50 border border-border text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Auto-detected from your location</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Specific Address/Landmark</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Shop No. 12, Main Market"
                  className="w-full p-3 rounded-xl bg-secondary/30 border border-border focus:border-primary outline-none"
                  required
                />
              </div>
            </Card>

            {/* Submit Button */}
            <MagneticButton
              type="submit"
              disabled={uploading || success}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${success
                ? "bg-green-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
                </span>
              ) : success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Service Added!
                </span>
              ) : (
                "Publish Service"
              )}
            </MagneticButton>

          </div>
        </form>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Service Published!</h2>
              <p className="text-muted-foreground mb-6">Your service is now live and visible to customers in your area.</p>
              <p className="text-sm text-primary font-bold">Redirecting to dashboard...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddService;
