// src/components/UserProfileForm.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const UserProfileForm = ({ onSave }) => {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    bio: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData((prev) => ({ ...prev, ...docSnap.data() }));
        }
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { ...formData, email: user.email, role: "user" }, { merge: true });
    if (onSave) onSave(); // optional callback
    alert("Profile updated!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["fullName", "phone", "address", "city", "pincode", "bio"].map((field) => (
        <div key={field}>
          <label className="block text-gray-700 dark:text-white capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
          <input
            type="text"
            name={field}
            value={formData[field] || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border bg-white/80 dark:bg-white/10 dark:text-white"
          />
        </div>
      ))}
      <button
        type="submit"
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 transition-transform"
      >
        Save Profile
      </button>
    </form>
  );
};

export default UserProfileForm;
