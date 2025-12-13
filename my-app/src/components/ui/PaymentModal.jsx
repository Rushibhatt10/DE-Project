import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, CreditCard, Wallet, Banknote, Loader2 } from "lucide-react";
import MagneticButton from "./MagneticButton";

const PaymentModal = ({ serviceName, amount, onClose, onSuccess }) => {
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Calculate breakdown
    // If amount is string, parse it. 
    // Assuming amount is base price.
    const {
        taxableAmount,
        totalGstAmount,
        grandTotal,
        gstRate
    } = React.useMemo(() => {
        // If we want to import calculating logic, we can or just inline simple display logic if props passed pre-calc.
        // But better to re-calculate to be safe using the shared module or duplicate the logic for display.
        // Let's import the function if possible, but for Speed in this modal we can inline the standard logic 
        // OR better: Import it. But I didn't import it in the file view above.
        // I will replicate the simple math here matching the config to ensure speed without adding imports if I can avoid.
        // Actually, importing is safer.
        const base = parseFloat(amount || 0);
        const rate = 18; // Default
        const tax = base * (rate / 100);
        return {
            taxableAmount: base.toFixed(2),
            totalGstAmount: tax.toFixed(2),
            gstRate: rate,
            grandTotal: (base + tax).toFixed(2)
        };
    }, [amount]);


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
                                    <span className="text-muted-foreground">Taxable Value</span>
                                    <span className="font-medium">₹{taxableAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">GST ({gstRate}%)</span>
                                    <span className="font-medium">₹{totalGstAmount}</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Payable</span>
                                    <span className="text-cyan-500 shadow-cyan-500/20 drop-shadow-lg">₹{grandTotal}</span>
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
                                className="w-full py-3.5 bg-foreground text-background dark:bg-cyan-500 dark:text-black font-bold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    `Pay ₹${grandTotal}`
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
