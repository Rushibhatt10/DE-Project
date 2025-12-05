import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    doc,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    addDoc,
    collection
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
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
    MessageSquare,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    XCircle
} from "lucide-react";
import Card from "../components/ui/Card";
import GlassCard from "../components/ui/GlassCard";
import MagneticButton from "../components/ui/MagneticButton";
import PaymentModal from "../components/ui/PaymentModal";
import OrderChat from "../components/chat/OrderChat";
import { toast } from "react-hot-toast";

const OrderPortal = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (!orderId) {
            navigate("/");
            return;
        }

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Allow public view or redirect? Let's redirect for security.
                navigate("/signin");
                return;
            }
            setCurrentUser(user);
        });

        const docRef = doc(db, "user_requests", orderId);

        // Real-time listener
        const unsubOrder = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                toast.error("Order not found");
                navigate("/user-dashboard");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching order:", error);
            toast.error("Error loading order details");
            setLoading(false);
        });

        return () => {
            unsubAuth();
            unsubOrder();
        };
    }, [orderId, navigate]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const orderRef = doc(db, "user_requests", orderId);

            const updateData = { status: newStatus };
            if (newStatus === "Completed") {
                updateData.completedAt = serverTimestamp();
            }

            await updateDoc(orderRef, updateData);
            toast.success(`Status updated to ${newStatus}`);

            // Notify the other party
            const isProvider = currentUser?.uid === order.providerUid;
            const targetUid = isProvider ? order.userId : order.providerUid;

            await addDoc(collection(db, "notifications"), {
                toUid: targetUid,
                title: "Order Update",
                message: `Order status changed to ${newStatus}`,
                timestamp: serverTimestamp(),
                read: false,
                link: `/order/${orderId}`
            });
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("Failed to update status");
        }
    };

    const handleCompleteWork = async () => {
        // Provider marks work as done, waiting for user confirmation
        await handleStatusUpdate("Verification Pending");
    };

    const handleUserConfirmCompletion = async (confirmed) => {
        if (confirmed) {
            await handleStatusUpdate("Completed");
        } else {
            // Logic for "Issue Reported" could go here
            toast("Please discuss issues in the chat", { icon: "💬" });
        }
        setShowConfirmation(false);
    };

    const handlePaymentSuccess = async () => {
        try {
            await updateDoc(doc(db, "user_requests", orderId), {
                paymentStatus: "Paid",
            });
            setShowPayment(false);
            toast.success("Payment Successful!");
        } catch (error) {
            console.error("Payment update error", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order || !currentUser) return null;

    const isProvider = currentUser.uid === order.providerUid;
    const isUser = currentUser.uid === order.userId;

    // Basic security check: only involved parties can view
    // (In a real app, Firestore rules would enforce this, but double check here)
    if (!isProvider && !isUser) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4" />
                <h1 className="text-xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this order.</p>
                <button onClick={() => navigate("/")} className="mt-6 text-primary underline">Go Home</button>
            </div>
        );
    }

    const steps = ["Pending", "Accepted", "On the Way", "In Progress", "Verification Pending", "Completed"];
    // Map "Verification Pending" to same visual step as Completed but different state
    const visualSteps = ["Pending", "Accepted", "On the Way", "In Progress", "Completed"];

    let currentStepIndex = visualSteps.indexOf(order.status);
    if (order.status === "Verification Pending") currentStepIndex = 4; // Visualise as almost done
    if (currentStepIndex === -1) currentStepIndex = 0; // Fallback

    const counterpartyName = isUser ? order.providerName || "Provider" : order.userEmail?.split('@')[0] || "User";
    const counterpartyPhone = isUser ? order.providerPhone : order.userPhone;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative">
            {/* Background decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-foreground">{order.serviceName}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            Order ID: <span className="font-mono bg-secondary px-1.5 rounded text-foreground">#{orderId.slice(0, 8).toUpperCase()}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${order.status === "Completed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                order.status === "Cancelled" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    order.status === "Verification Pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse" :
                                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}>
                            {order.status === "Verification Pending" ? "Wait for User Confirmation" : order.status}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Status + Details + Chat */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Status Timeline */}
                        <GlassCard className="p-8">
                            <h3 className="font-bold text-lg mb-8">Order Timeline</h3>
                            <div className="relative px-4">
                                {/* Progress Bar Background */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full -z-10" />
                                {/* Active Progress Bar */}
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full -z-10 transition-all duration-700 ease-out"
                                    style={{ width: `${(currentStepIndex / (visualSteps.length - 1)) * 100}%` }}
                                />

                                <div className="flex justify-between relative">
                                    {visualSteps.map((step, idx) => {
                                        const isActive = idx <= currentStepIndex;
                                        const isCompleted = idx < currentStepIndex;
                                        return (
                                            <div key={step} className="flex flex-col items-center gap-3 group">
                                                <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                          ${isActive ? "bg-background border-primary scale-110 shadow-lg shadow-primary/20" : "bg-card border-muted-foreground/30 scale-100"}
                          ${isCompleted ? "bg-primary border-primary text-primary-foreground" : ""}
                        `}>
                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                                        isActive ? <div className="w-3 h-3 bg-primary rounded-full animate-pulse" /> :
                                                            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                                                    }
                                                </div>
                                                <span className={`text-xs font-bold absolute -bottom-8 w-24 text-center transition-colors ${isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mt-12"></div>
                        </GlassCard>

                        {/* Action Required Alert */}
                        <AnimatePresence>
                            {isUser && order.status === "Verification Pending" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-600">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-yellow-600">Provider Marked as Completed</h4>
                                            <p className="text-sm text-yellow-600/80">Please confirm if the work was done to your satisfaction.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <MagneticButton
                                            onClick={() => handleUserConfirmCompletion(true)}
                                            className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20"
                                        >
                                            Yes, Done
                                        </MagneticButton>
                                        <button
                                            onClick={() => handleUserConfirmCompletion(false)}
                                            className="px-6 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
                                        >
                                            Report Issue
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat Section */}
                        <OrderChat
                            orderId={orderId}
                            currentUser={currentUser}
                            isProvider={isProvider}
                            counterpartyName={counterpartyName}
                        />

                        {/* Order Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h4 className="font-bold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date & Time</h4>
                                <div className="space-y-1">
                                    <p className="text-lg font-medium">{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</p>
                                    <p className="text-muted-foreground">{order.timeSlot || "Flexible"}</p>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <h4 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Location</h4>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{order.address}</p>
                                    <p className="text-xs text-muted-foreground mt-2 opacity-70">
                                        (Coordinates: {order.coordinates ? `${order.coordinates.lat?.toFixed(4)}, ${order.coordinates.lng?.toFixed(4)}` : "N/A"})
                                    </p>
                                </div>
                            </Card>
                            <div className="md:col-span-2">
                                <Card className="p-6">
                                    <h4 className="font-bold mb-2">Description</h4>
                                    <p className="text-muted-foreground italic leading-relaxed">
                                        "{order.description}"
                                    </p>
                                </Card>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: People & Actions */}
                    <div className="space-y-6">

                        {/* Counterparty Card */}
                        <GlassCard className="p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-card border-4 border-background shadow-xl flex items-center justify-center mb-4 text-4xl font-bold bg-gradient-to-br from-secondary to-background">
                                    {/* Avatar Placeholder - uses first letter */}
                                    {counterpartyName[0]}
                                </div>
                                <h2 className="text-xl font-bold">{counterpartyName}</h2>
                                <p className="text-sm text-primary font-medium mb-6">
                                    {isUser ? "Assigned Professional" : "Customer"}
                                </p>

                                <div className="flex justify-center w-full gap-3 mb-6">
                                    <a
                                        href={`tel:${counterpartyPhone}`}
                                        className="flex-1 py-3 bg-secondary hover:bg-secondary/80 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium border border-border"
                                    >
                                        <Phone className="w-4 h-4" /> Call
                                    </a>
                                    {/* Chat handled in main area, but maybe a jump-to button? */}
                                </div>

                                <div className="w-full text-left space-y-3 text-sm border-t border-border pt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="font-bold flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${order.status === "Completed" ? "bg-green-500" : "bg-blue-500"}`}></span>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Service ID</span>
                                        <span className="font-mono text-xs">{orderId.slice(-6)}</span>
                                    </div>
                                    {isProvider && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Earnings</span>
                                            <span className="font-bold text-green-500">₹{order.price || "0"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        {/* Provider Controls */}
                        {isProvider && order.status !== "Completed" && order.status !== "Cancelled" && (
                            <GlassCard className="p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" /> Management
                                </h3>
                                <div className="space-y-3">
                                    {order.status === "Pending" && (
                                        <MagneticButton
                                            onClick={() => handleStatusUpdate("Accepted")}
                                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700"
                                        >
                                            Accept Order
                                        </MagneticButton>
                                    )}
                                    {order.status === "Accepted" && (
                                        <MagneticButton
                                            onClick={() => handleStatusUpdate("On the Way")}
                                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                        >
                                            Start Travel
                                        </MagneticButton>
                                    )}
                                    {order.status === "On the Way" && (
                                        <MagneticButton
                                            onClick={() => handleStatusUpdate("In Progress")}
                                            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 hover:bg-purple-700"
                                        >
                                            Start Work
                                        </MagneticButton>
                                    )}
                                    {order.status === "In Progress" && (
                                        <MagneticButton
                                            onClick={handleCompleteWork}
                                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90"
                                        >
                                            Mark Completed
                                        </MagneticButton>
                                    )}
                                    {order.status === "Verification Pending" && (
                                        <div className="p-3 bg-secondary rounded-xl text-center text-sm text-muted-foreground animate-pulse">
                                            Waiting for customer confirmation...
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        )}

                        {/* User Payment */}
                        {isUser && (
                            <GlassCard className="p-6">
                                <h3 className="font-bold mb-4">Payment</h3>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="text-2xl font-bold">₹{(parseInt(order.price || 0) + 50)}</span>
                                </div>

                                {order.paymentStatus === "Paid" ? (
                                    <div className="w-full py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 font-bold">
                                        <CheckCircle2 className="w-5 h-5" /> Paid
                                    </div>
                                ) : order.status === "Completed" ? (
                                    <MagneticButton
                                        onClick={() => setShowPayment(true)}
                                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-5 h-5" /> Pay Now
                                    </MagneticButton>
                                ) : (
                                    <div className="w-full py-3 bg-secondary text-muted-foreground rounded-xl text-center text-sm">
                                        Payment unlocks after completion
                                    </div>
                                )}
                            </GlassCard>
                        )}

                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPayment && (
                    <PaymentModal
                        serviceName={order.serviceName}
                        amount={order.price || "0"}
                        onClose={() => setShowPayment(false)}
                        onSuccess={handlePaymentSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderPortal;
