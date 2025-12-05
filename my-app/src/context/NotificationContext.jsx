import React, { createContext, useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-hot-toast";
import { Bell } from "lucide-react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        // Listen for notifications where 'toUid' matches current user
        const q = query(
            collection(db, "notifications"),
            where("toUid", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const notif = change.doc.data();
                    // Only show toast for fresh notifications (less than 10 seconds old)
                    // to prevent spam on page reload
                    const isRecent = notif.timestamp?.seconds && (Date.now() / 1000 - notif.timestamp.seconds < 10);

                    if (isRecent) {
                        toast.custom((t) => (
                            <div
                                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                                    } max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                            >
                                <div className="flex-1 w-0 p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <Bell className="h-10 w-10 text-primary bg-primary/10 rounded-full p-2" />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {notif.title}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ), { duration: 4000 });
                    }
                }
            });

            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsub();
    }, [user]);

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
