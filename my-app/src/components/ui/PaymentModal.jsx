import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, CreditCard, Wallet, Banknote, Loader2 } from "lucide-react";
import MagneticButton from "./MagneticButton";

const PaymentModal = ({ serviceName, amount, onClose, onSuccess }) => {
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handlePayment = () => {
        setProcessing(true);
        // Simulate payment delay
        setTimeout(() => {
            setProcessing(false);
            setCompleted(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
                <AnimatePresence mode="wait">
                    {!completed ? (
                        <motion.div
                            key="payment-form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Payment Summary</h2>
                                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-secondary/30 p-4 rounded-xl space-y-3 mb-6 border border-border">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service</span>
                                    <span className="font-medium">{serviceName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Price</span>
                                    <span className="font-medium">₹{amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes & Fees</span>
                                    <span className="font-medium">₹50</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Payable</span>
                                    <span className="text-primary">₹{parseInt(amount) + 50}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-sm font-medium text-muted-foreground">Select Payment Method</p>
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">UPI / GPay / PhonePe</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">Credit / Debit Card</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">Wallets</span>
                                </button>
                            </div>

                            <MagneticButton
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    `Pay ₹${parseInt(amount) + 50}`
                                )}
                            </MagneticButton>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                            <p className="text-muted-foreground mb-8">Your payment has been processed securely.</p>
                            <p className="text-sm text-muted-foreground">Redirecting...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
