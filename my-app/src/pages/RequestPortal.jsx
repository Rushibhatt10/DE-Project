import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from "lucide-react";
import Card from "../components/ui/Card";
import MagneticButton from "../components/ui/MagneticButton";
import PaymentModal from "../components/ui/PaymentModal";
import { toast } from "react-hot-toast";

const RequestPortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [servicePrice, setServicePrice] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        const docRef = doc(db, "user_requests", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRequestData(data);

          // Fetch service price if not in request
          if (data.serviceId) {
            const serviceSnap = await getDoc(doc(db, "provider_services", data.serviceId));
            if (serviceSnap.exists()) {
              setServicePrice(serviceSnap.data().price);
            }
          }
        } else {
          toast.error("Request not found");
          navigate("/user-dashboard");
        }
      } catch (err) {
        console.error("Error fetching request:", err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDoc(doc(db, "user_requests", id), {
        status: newStatus,
      });
      setRequestData((prev) => ({
        ...prev,
        status: newStatus,
      }));
      toast.success(`Status updated to ${newStatus}`);

      // Create Notification for User
      await addDoc(collection(db, "notifications"), {
        toUid: requestData.userId,
        title: "Order Update",
        message: `Your request for ${requestData.serviceName} is now ${newStatus}.`,
        timestamp: serverTimestamp(),
        read: false,
        link: `/request/${id}`
      });
    } catch (err) {
      console.error("Error updating status:", err.message);
      toast.error("Failed to update status");
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await updateDoc(doc(db, "user_requests", id), {
        paymentStatus: "Paid",
        status: "Completed" // Auto-complete on payment for now, or keep as is
      });
      setRequestData(prev => ({ ...prev, paymentStatus: "Paid", status: "Completed" }));
      setShowPayment(false);
      toast.success("Payment Successful!");

      // Create Notification for Provider
      await addDoc(collection(db, "notifications"), {
        toUid: requestData.providerUid,
        title: "Payment Received",
        message: `Payment of ₹${parseInt(servicePrice) + 50} received for ${requestData.serviceName}.`,
        timestamp: serverTimestamp(),
        read: false,
        link: `/request/${id}`
      });
    } catch (error) {
      console.error("Payment update error", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-primary font-medium">Loading details...</div>
    </div>
  );

  if (!requestData) return null;

  const isProvider = currentUser?.email === requestData?.providerEmail;
  const isUser = currentUser?.uid === requestData?.userId;

  const steps = ["Pending", "Accepted", "On the Way", "Completed"];
  const currentStepIndex = steps.indexOf(requestData.status) === -1 ? 0 : steps.indexOf(requestData.status);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{requestData.serviceName}</h1>
                  <p className="text-sm text-muted-foreground">Order ID: #{id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${requestData.status === "Completed" ? "bg-green-500/10 text-green-600" :
                  requestData.status === "Cancelled" ? "bg-red-500/10 text-red-600" :
                    "bg-yellow-500/10 text-yellow-600"
                  }`}>
                  {requestData.status}
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full -z-10" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />
                <div className="flex justify-between">
                  {steps.map((step, idx) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${idx <= currentStepIndex ? "bg-primary border-primary" : "bg-background border-muted-foreground"
                        }`} />
                      <span className={`text-xs font-medium ${idx <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                        }`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p className="text-muted-foreground">
                      {requestData.date ? new Date(requestData.date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Time Slot</p>
                    <p className="text-muted-foreground">{requestData.timeSlot || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-muted-foreground">{requestData.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              {requestData.description && (
                <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border">
                  <p className="text-sm font-medium mb-1">Problem Description</p>
                  <p className="text-sm text-muted-foreground italic">"{requestData.description}"</p>
                </div>
              )}
            </Card>

            {/* Actions for Provider */}
            {isProvider && requestData.status !== "Completed" && requestData.status !== "Cancelled" && (
              <Card className="p-6">
                <h3 className="font-bold mb-4">Update Status</h3>
                <div className="flex gap-3">
                  {requestData.status === "Pending" && (
                    <MagneticButton
                      onClick={() => handleStatusUpdate("Accepted")}
                      className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
                    >
                      Accept Request
                    </MagneticButton>
                  )}
                  {requestData.status === "Accepted" && (
                    <MagneticButton
                      onClick={() => handleStatusUpdate("On the Way")}
                      className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                    >
                      Mark On the Way
                    </MagneticButton>
                  )}
                  {requestData.status === "On the Way" && (
                    <MagneticButton
                      onClick={() => handleStatusUpdate("Completed")}
                      className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90"
                    >
                      Mark Completed
                    </MagneticButton>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Counterparty Info */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">{isUser ? "Provider Details" : "Customer Details"}</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {isUser ? requestData.providerName || "Provider" : requestData.userEmail?.split('@')[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isUser ? "Verified Professional" : "Customer"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{isUser ? requestData.providerEmail : requestData.userEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{isUser ? requestData.providerPhone || "N/A" : requestData.userPhone || "N/A"}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Chat
                </button>
                <button className="flex-1 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Call
                </button>
              </div>
            </Card>

            {/* Payment / Summary */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Payment Summary</h3>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Service Cost</span>
                <span className="font-medium">₹{servicePrice}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium">₹50</span>
              </div>
              <div className="h-px bg-border mb-4" />
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>₹{parseInt(servicePrice) + 50}</span>
              </div>

              {isUser && requestData.status === "Completed" && requestData.paymentStatus !== "Paid" ? (
                <MagneticButton
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Pay Now
                </MagneticButton>
              ) : requestData.paymentStatus === "Paid" ? (
                <div className="w-full py-3 bg-green-500/10 text-green-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-500/20">
                  <CheckCircle className="w-5 h-5" /> Paid Successfully
                </div>
              ) : (
                <div className="text-center text-xs text-muted-foreground bg-secondary/50 py-2 rounded-lg">
                  Payment available after completion
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          serviceName={requestData.serviceName}
          amount={servicePrice}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default RequestPortal;
