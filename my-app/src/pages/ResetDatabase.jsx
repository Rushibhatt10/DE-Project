import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import MagneticButton from "../components/ui/MagneticButton";
import Card from "../components/ui/Card";
import { toast } from "react-hot-toast";

const ResetDatabase = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState([]);
    const [completed, setCompleted] = useState(false);

    const COLLECTIONS = [
        "users",
        "verified_providers",
        "provider_services",
        "user_requests",
        "ratings",
        "notifications"
    ];

    const clearCollection = async (collectionName) => {
        try {
            const q = collection(db, collectionName);
            const snapshot = await getDocs(q);

            if (snapshot.size === 0) {
                setProgress(prev => [...prev, { name: collectionName, status: "Skipped (Empty)" }]);
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            setProgress(prev => [...prev, { name: collectionName, status: `Deleted ${snapshot.size} docs` }]);
        } catch (error) {
            console.error(`Error clearing ${collectionName}:`, error);
            setProgress(prev => [...prev, { name: collectionName, status: "Error" }]);
            throw error;
        }
    };

    const handleReset = async () => {
        if (!window.confirm("CRITICAL WARNING: This will DELETE ALL DATA. Are you absolutely sure?")) return;

        setLoading(true);
        setProgress([]);
        setCompleted(false);

        try {
            for (const col of COLLECTIONS) {
                await clearCollection(col);
            }
            setCompleted(true);
            toast.success("Database reset complete!");
        } catch (error) {
            toast.error("Reset failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-6">
            <Card className="max-w-lg w-full p-8 border-red-500/20 shadow-2xl shadow-red-500/5">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-red-500">Database Reset</h1>
                    <p className="text-muted-foreground mt-2">
                        This tool will wipe all data from your Firestore database.
                        <br />
                        <span className="font-bold text-foreground">This action cannot be undone.</span>
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border text-sm">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Targets:
                        </h3>
                        <ul className="grid grid-cols-2 gap-2 text-muted-foreground">
                            {COLLECTIONS.map(c => (
                                <li key={c} className="list-disc list-inside">{c}</li>
                            ))}
                        </ul>
                    </div>

                    {progress.length > 0 && (
                        <div className="bg-secondary/30 p-4 rounded-xl border border-border text-sm max-h-40 overflow-y-auto">
                            {progress.map((p, i) => (
                                <div key={i} className="flex justify-between items-center py-1">
                                    <span className="font-medium">{p.name}</span>
                                    <span className={p.status.includes("Error") ? "text-red-500" : "text-green-500"}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <MagneticButton
                    onClick={handleReset}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${completed
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Wiping Data...
                        </span>
                    ) : completed ? (
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Reset Complete
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> WIPE EVERYTHING
                        </span>
                    )}
                </MagneticButton>
            </Card>
        </div>
    );
};

export default ResetDatabase;
