import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Loader2, Download, ArrowLeft, Printer } from "lucide-react";
import MagneticButton from "../components/ui/MagneticButton";
import { FINANCE_CONFIG, formatCurrency } from "../utils/finance";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";

const InvoiceView = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Invoices can be their own collection OR part of the order. 
                // Implementation Plan says separate 'invoices' collection.
                // However, we might first look it up by ID if it's the doc ID, 
                // OR query where invoiceId field matches. 
                // Let's assume the route param IS the firebase doc ID for simplicity, 
                // or we query.

                const docRef = doc(db, "invoices", invoiceId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInvoice({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Invoice not found");
                }
            } catch (error) {
                console.error("Error fetching invoice:", error);
                toast.error("Could not load invoice");
            } finally {
                setLoading(false);
            }
        };

        if (invoiceId) fetchInvoice();
    }, [invoiceId]);

    const handleDownloadPdf = async () => {
        const element = invoiceRef.current;
        if (!element) return;

        const toastId = toast.loading("Generating PDF...");

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${invoice?.invoiceNumber || "file"}.pdf`);
            toast.success("Download started", { id: toastId });
        } catch (error) {
            console.error("PDF Gen Error:", error);
            toast.error("Failed to generate PDF", { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8 no-print">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex gap-4">
                        <MagneticButton
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </MagneticButton>
                    </div>
                </div>

                {/* Invoice Paper - Simplified Receipt Style */}
                <div
                    ref={invoiceRef}
                    className="bg-white text-black p-8 md:p-12 rounded-lg shadow-xl relative overflow-hidden print:shadow-none print:w-full max-w-2xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Receipt</h1>
                        <p className="text-gray-500 font-medium">{FINANCE_CONFIG.businessDetails.legalName}</p>
                    </div>

                    {/* Meta Data */}
                    <div className="border-t-2 border-dashed border-gray-200 py-6 mb-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="font-bold">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Receipt #</span>
                            <span className="font-bold font-mono">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Billed To</span>
                            <span className="font-bold">{invoice.userDetails.name}</span>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-10">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">{invoice.serviceDetails.name}</h3>
                                <p className="text-xs text-gray-500">Full Service</p>
                            </div>
                            <span className="font-bold text-lg">{formatCurrency(invoice.financials.grandTotal)}</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t-2 border-black pt-6 flex justify-between items-end mb-12">
                        <span className="font-bold text-xl">Total Paid</span>
                        <span className="font-black text-3xl">{formatCurrency(invoice.financials.grandTotal)}</span>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-400 space-y-1">
                        <p className="uppercase tracking-widest font-bold text-gray-300 mb-2">Thank You</p>
                        <p>For questions, contact {FINANCE_CONFIG.businessDetails.email}</p>
                        <p>{FINANCE_CONFIG.businessDetails.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;
