import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldCheck,
  BadgeCheck,
  CalendarCheck,
  Tag,
  Star
} from "lucide-react";
import BookingWizard from "../components/booking/BookingWizard";
import Card from "../components/ui/Card";
import MagneticButton from "../components/ui/MagneticButton";

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const docRef = doc(db, "provider_services", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate("/user-dashboard");
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        navigate("/user-dashboard");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
      }
    });

    fetchService();
    return () => unsubscribe();
  }, [id, navigate]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (userId && id) {
        const q = query(
          collection(db, "ratings"),
          where("userId", "==", userId),
          where("serviceId", "==", id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setFeedback(data);
        }
      }
    };
    fetchFeedback();
  }, [userId, id]);

  const sendEmails = async (bookingDetails) => {
    try {
      const templateParamsUser = {
        to_email: userEmail,
        service_name: service.name,
        date: new Date(bookingDetails.date).toLocaleDateString(),
        time: bookingDetails.timeSlot,
        address: bookingDetails.address
      };

      const templateParamsProvider = {
        to_email: service.providerEmail,
        user_email: userEmail,
        service_name: service.name,
        date: new Date(bookingDetails.date).toLocaleDateString(),
        time: bookingDetails.timeSlot,
        address: bookingDetails.address,
        description: bookingDetails.description
      };

      // Note: Replace with actual EmailJS service/template IDs
      await emailjs.send(
        "service_hsrbila",
        "template_eiv8arm",
        templateParamsUser,
        "OURe-LROKrYp6YWb_"
      );

      await emailjs.send(
        "service_hsrbila",
        "template_eiv8arm",
        templateParamsProvider,
        "OURe-LROKrYp6YWb_"
      );
    } catch (err) {
      console.error("EmailJS error:", err);
    }
  };

  const handleConfirmBooking = async (bookingDetails) => {
    if (!userEmail || !service) return;

    try {
      const requestRef = await addDoc(collection(db, "user_requests"), {
        serviceId: service.id,
        serviceName: service.name,
        providerUid: service.providerUid || "",
        providerEmail: service.providerEmail,
        userId: userId,
        userEmail: userEmail,
        status: "Pending",
        timestamp: serverTimestamp(),
        ...bookingDetails // Add description, address, date, timeSlot, coordinates
      });

      await sendEmails(bookingDetails);

      setShowBookingWizard(false);
      alert("Booking requested successfully!");
      navigate(`/order/${requestRef.id}`);
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <p className="text-lg text-primary animate-pulse">Loading service...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 font-sans">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Image & Key Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-border bg-card">
              {service.imageUrls?.length > 0 ? (
                <img
                  src={service.imageUrls[0]}
                  alt={service.name}
                  className="w-full h-[400px] object-cover"
                />
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center bg-secondary text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{service.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">₹{service.price}</div>
                  <div className="text-sm text-muted-foreground">per service</div>
                </div>
              </div>

              <div className="flex gap-4 border-y border-border py-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {service.category}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium">
                  <CalendarCheck className="w-4 h-4 text-primary" />
                  {service.availability}
                </div>
                {service.verified && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Feedback Section */}
              {feedback && (
                <div className="mt-8 bg-secondary/30 rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Your Feedback
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-foreground">{feedback.rating}/5</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{feedback.feedback}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Provider Card & CTA */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Provider Details</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {service.providerName?.[0] || "P"}
                </div>
                <div>
                  <div className="font-bold">{service.providerName || "Provider"}</div>
                  <div className="text-sm text-muted-foreground">{service.providerEmail}</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {service.contact && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {service.contact}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {service.providerEmail}
                </div>
              </div>

              <MagneticButton
                onClick={() => setShowBookingWizard(true)}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
              >
                Book Now
              </MagneticButton>
              <p className="text-xs text-center text-muted-foreground mt-3">
                No payment required until service is complete.
              </p>
            </Card>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showBookingWizard && (
          <BookingWizard
            service={service}
            onClose={() => setShowBookingWizard(false)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetails;
