import React, { useState, useEffect, useRef } from "react";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    doc
} from "firebase/firestore";
import { db } from "../../firebase";
import { Send, Image as ImageIcon, CheckCheck, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import MagneticButton from "../ui/MagneticButton";

const OrderChat = ({ orderId, currentUser, isProvider, counterpartyName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        const q = query(
            collection(db, "user_requests", orderId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [orderId]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await addDoc(collection(db, "user_requests", orderId, "messages"), {
                text: newMessage,
                senderUid: currentUser.uid,
                senderEmail: currentUser.email,
                timestamp: serverTimestamp(),
                type: "text", // Support for 'image' later
                seen: false
            });
            setNewMessage("");
            scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border bg-secondary/30 backdrop-blur-sm flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-foreground">Chat with {counterpartyName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Real-time
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Send className="w-6 h-6" />
                        </div>
                        <p>Start the conversation</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderUid === currentUser.uid;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm relative group ${isMe
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-secondary text-foreground rounded-tl-none border border-border"
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <div
                                        className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                            }`}
                                    >
                                        {msg.timestamp?.seconds
                                            ? format(new Date(msg.timestamp.seconds * 1000), "HH:mm")
                                            : "Sending..."}
                                        {isMe && (
                                            <span className="ml-1">
                                                {msg.seen ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border flex gap-3 items-center">
                <button
                    type="button"
                    className="p-2.5 text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
                    title="Attach Image (Coming Soon)"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-secondary/50 text-foreground px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 transition-all placeholder:text-muted-foreground/70"
                />
                <MagneticButton
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25"
                >
                    <Send className={`w-5 h-5 ${sending ? 'opacity-0' : 'opacity-100'}`} />
                    {sending && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        </div>
                    )}
                </MagneticButton>
            </form>
        </div>
    );
};

export default OrderChat;
