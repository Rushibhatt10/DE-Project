import React from "react";
import { motion } from "framer-motion";

const WebsiteFeature = () => {
  const features = [
    { label: "Cleaning", icon: "🧴" },
    { label: "Painting", icon: "🖌️" },
    { label: "Plumbing", icon: "🔧" },
    { label: "Carpentry", icon: "🪚" },
    { label: "Appliance Repair", icon: "🧺" },
    { label: "Moving", icon: "📦" },
    { label: "Pest Control", icon: "🐜" },
    { label: "Lawn Care", icon: "🦺" },
    { label: "Electrical", icon: "💡" },
  ];

  return (
    <section className="bg-gradient-to-br from-[#e6f0ff] to-white py-20 relative" id="features">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-4">
          What’s waiting for you on the website?
        </h2>
        <p className="text-gray-600 text-lg">
          Our website offers a variety of household services to cater to your every need.
        </p>
      </div>

      <div className="mt-16 relative flex justify-center">
        {/* Laptop Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-[90%] max-w-5xl bg-white rounded-3xl shadow-2xl p-8 pt-16 relative z-10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {features.slice(1, 8).map((item, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center shadow hover:scale-105 transition"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-blue-900">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Laptop Mock Frame */}
        <div className="absolute top-0 z-0 w-[95%] max-w-5xl h-full border-8 border-gray-300 rounded-3xl"></div>
      </div>

      {/* Floating Side Features */}
      <div className="absolute left-10 top-[30%] flex flex-col gap-4">
        <div className="bg-white p-3 rounded-xl shadow text-sm text-center w-24">🧼<br />Cleaning</div>
        <div className="bg-white p-3 rounded-xl shadow text-sm text-center w-24">🖌️<br />Fioritral</div>
      </div>
      <div className="absolute right-10 top-[30%] flex flex-col gap-4">
        <div className="bg-white p-3 rounded-xl shadow text-sm text-center w-24">💡<br />Electrical</div>
        <div className="bg-white p-3 rounded-xl shadow text-sm text-center w-24">🚚<br />Moving</div>
      </div>
    </section>
  );
};

export default WebsiteFeature;
