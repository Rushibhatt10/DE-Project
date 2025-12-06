export const FINANCE_CONFIG = {
    gstEnabled: true,
    defaultGstRate: 18, // 18%
    platformCommissionPercent: 15, // 15%
    currency: 'INR',
    businessDetails: {
        legalName: "HOUSEHOLD SERVICES INDIA PVT LTD",
        address: "123, Tech Park, Bangalore, Karnataka, 560001",
        gstin: "29AAAAA0000A1Z5", // Dummy GSTIN
        email: "support@householdservices.com",
        phone: "+91 98765 43210",
        pan: "ABCDE1234F"
    }
};

/**
 * Calculates the complete economic breakdown for an order.
 * Note: To avoid floating point errors, we operate on base values but return formatted numbers.
 * In a real strict environment, handle everything in cents/paise. Here we use standard JS math with toFixed(2).
 */
export const calculateOrderEconomics = (baseAmount, customGstRate = null) => {
    const taxableAmount = parseFloat(baseAmount);
    const gstRate = customGstRate !== null ? customGstRate : FINANCE_CONFIG.defaultGstRate;

    // Split GST (assuming intra-state default: 50% CGST, 50% SGST)
    const totalGstAmount = taxableAmount * (gstRate / 100);
    const cgstRate = gstRate / 2;
    const sgstRate = gstRate / 2;
    const cgstAmount = totalGstAmount / 2;
    const sgstAmount = totalGstAmount / 2;

    const grandTotal = taxableAmount + totalGstAmount;

    // Platform Commission & Provider Payout
    // Commission is usually taken from the TAXABLE amount or Grand Total? 
    // Usually platforms take commission on the subtotal.
    const platformCommission = taxableAmount * (FINANCE_CONFIG.platformCommissionPercent / 100);
    const providerPayout = taxableAmount - platformCommission; // Provider gets remaining taxable amount
    // Note: GST liability handling varies. Often platform collects and pays GST. 
    // For simplicity here: Platform collects everything, keeps commission + GST (to pay govt), sends rest to provider.
    // OR: Provider handles their own GST. Let's assume Platform collects all money and disburses net.

    return {
        taxableAmount,
        gstRate,
        totalGstAmount: parseFloat(totalGstAmount.toFixed(2)),
        cgstRate,
        cgstAmount: parseFloat(cgstAmount.toFixed(2)),
        sgstRate,
        sgstAmount: parseFloat(sgstAmount.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        platformCommission: parseFloat(platformCommission.toFixed(2)),
        providerPayout: parseFloat(providerPayout.toFixed(2)),
        currency: FINANCE_CONFIG.currency
    };
};

/**
 * Generates an Invoice Number
 * Format: INV-YYYYMMDD-RANDOM4
 */
export const generateInvoiceNumber = () => {
    const date = new Date();
    const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${ymd}-${random}`;
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};
