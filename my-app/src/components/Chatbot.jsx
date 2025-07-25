import { useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);

  const presetReplies = [
    "What services do you offer?",
    "What are your prices?",
    "Can I book a service?",
    "Talk to human",
  ];

  const handlePresetClick = (text) => {
    addMessage("user", text);

    let botReply = "";
    switch (text) {
      case "What services do you offer?":
        botReply = "We offer tiffin and household services like cleaning, cooking, delivery, etc.";
        break;
      case "What are your prices?":
        botReply = "Tiffin starts at ₹60/day, and household help at ₹150/hour.";
        break;
      case "Can I book a service?":
        botReply = "Yes! Click on 'Get Started' on the homepage or visit our dashboard.";
        break;
      case "Talk to human":
        botReply = "A human assistant will contact you shortly.";
        break;
      default:
        botReply = "Sorry, I didn’t understand that.";
    }

    setTimeout(() => {
      addMessage("bot", botReply);
    }, 700);
  };

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-['Manrope']">
      {isOpen ? (
        <div className="w-80 bg-[#1e1e2e] text-white border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 flex justify-between items-center">
            <span className="font-bold">💬 Chatbot</span>
            <button onClick={() => setIsOpen(false)} className="text-white font-bold">
              ✖
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-72 overflow-y-auto px-4 py-2 space-y-2 text-sm scrollbar-thin scrollbar-thumb-pink-400">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-2 rounded-xl ${
                  msg.from === "bot"
                    ? "bg-[#2e2e4e] text-left text-gray-200"
                    : "bg-gradient-to-r from-pink-500 to-blue-500 text-white ml-auto text-right"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Preset Buttons */}
          <div className="border-t border-white/10 p-3 flex flex-wrap gap-2 bg-[#252537]">
            {presetReplies.map((text, i) => (
              <button
                key={i}
                className="bg-white/10 hover:bg-white/20 text-sm text-white px-3 py-1 rounded-full border border-pink-400 transition duration-200"
                onClick={() => handlePresetClick(text)}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          className="bg-gradient-to-r from-pink-500 to-blue-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition duration-300"
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}
    </div>
  );
}
