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
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 p-4 md:p-8 font-sans">
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
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </MagneticButton>
                    </div>
                </div>

                {/* Invoice Paper */}
                <div
                    ref={invoiceRef}
                    className="bg-white text-black p-8 md:p-12 rounded-lg shadow-xl relative overflow-hidden print:shadow-none print:w-full"
                    style={{ minHeight: '1123px' }} // A4 approx height in px
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">Tax Invoice</h1>
                            <p className="text-sm font-medium opacity-70">Original Recipient</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold">{FINANCE_CONFIG.businessDetails.legalName}</h2>
                            <p className="text-sm max-w-[250px] ml-auto leading-relaxed mt-1 opacity-80">
                                {FINANCE_CONFIG.businessDetails.address}
                            </p>
                            <p className="text-sm mt-1 font-mono">GSTIN: {FINANCE_CONFIG.businessDetails.gstin}</p>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Billed To</p>
                            <h3 className="text-xl font-bold mb-1">{invoice.userDetails.name}</h3>
                            <p className="text-sm opacity-80">{invoice.userDetails.phone}</p>
                            <p className="text-sm opacity-80">{invoice.userDetails.email}</p>
                            <p className="text-sm mt-2 opacity-80 max-w-[200px]">{invoice.userDetails.address}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-medium text-gray-600">Invoice No:</span>
                                <span className="font-bold font-mono">{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-medium text-gray-600">Date:</span>
                                <span className="font-bold">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-medium text-gray-600">Order ID:</span>
                                <span className="font-bold font-mono text-xs">{invoice.orderId}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-medium text-gray-600">Payment Status:</span>
                                <span className="font-bold text-green-600 uppercase">Paid</span>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="py-3 px-4 text-left font-bold uppercase text-xs tracking-wider rounded-l-md">Description</th>
                                <th className="py-3 px-4 text-center font-bold uppercase text-xs tracking-wider">HSN/SAC</th>
                                <th className="py-3 px-4 text-right font-bold uppercase text-xs tracking-wider rounded-r-md">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            <tr>
                                <td className="py-4 px-4">
                                    <p className="font-bold text-base">{invoice.serviceDetails.name}</p>
                                    <p className="text-gray-500 text-xs mt-1">Service delivered on {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                </td>
                                <td className="text-center py-4 text-gray-500 font-mono">9993</td>
                                <td className="text-right py-4 font-medium font-mono">
                                    {formatCurrency(invoice.financials.taxableAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-16">
                        <div className="w-1/2 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Taxable Amount</span>
                                <span className="font-medium">{formatCurrency(invoice.financials.taxableAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">CGST ({invoice.financials.cgstRate}%)</span>
                                <span className="font-medium">{formatCurrency(invoice.financials.cgstAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">SGST ({invoice.financials.sgstRate}%)</span>
                                <span className="font-medium">{formatCurrency(invoice.financials.sgstAmount)}</span>
                            </div>
                            <div className="border-t-2 border-black pt-3 flex justify-between items-end">
                                <span className="font-bold text-lg">Grand Total</span>
                                <span className="font-bold text-2xl">{formatCurrency(invoice.financials.grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-12 left-12 right-12 border-t pt-8 text-xs text-gray-500">
                        <div className="flex justify-between items-end">
                            <div className="max-w-md">
                                <p className="font-bold text-black mb-2 uppercase">Terms & Conditions</p>
                                <p>1. This is a computer generated invoice and needs no signature.</p>
                                <p>2. Payments once made are non-refundable.</p>
                                <p>3. Subject to Karnataka jurisdiction.</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-black mb-1">{FINANCE_CONFIG.businessDetails.legalName}</p>
                                <p>Authorized Signatory</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;
