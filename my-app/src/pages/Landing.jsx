import React, { useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "react-hot-toast";
import ThemeToggle from "../components/ui/ThemeToggle";

const whyChooseUs = [
  { title: "Reliable Platform", desc: "Built for consistency and trust" },
  { title: "Fixed Pricing System", desc: "Prices based on real market standards" },
  { title: "Verified Professionals", desc: "All providers are verified by admin" },
  { title: "GPS & Real-Time Tracking", desc: "Track service location and status live" },
  { title: "No Hidden Charges", desc: "Transparent pricing with no surprises" },
  { title: "Efficient Workflow", desc: "Smooth booking-to-completion lifecycle" },
  { title: "Transparent Billing", desc: "Auto-generated, GST-ready invoices" },
  { title: "Real-Time Updates", desc: "Clear communication at every step" },
  { title: "Secure Platform", desc: "Protected data and role-based access" },
  { title: "Easy to Use", desc: "Clean, modern interface for everyone" }
];

const howToUseUser = [
  "Sign in as User",
  "Choose the required service",
  "Enter address or use GPS location",
  "View fixed pricing before booking",
  "Book the service",
  "Track provider in real time",
  "Service gets completed",
  "Download invoice and rate provider"
];

const howToUseProvider = [
  "Sign in as Provider",
  "Upload required documents",
  "Wait for admin verification",
  "Receive service requests",
  "Accept or decline jobs",
  "Navigate using GPS",
  "Complete the service",
  "View earnings and ratings"
];

const LandingPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-black text-foreground dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-x-hidden">

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 dark:bg-black/90 backdrop-blur-sm border-b border-border dark:border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-xl font-bold tracking-widest uppercase">WORKLOW</span>

          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white transition-colors">
              Admin Panel
            </Link>
            <Link to="/signin" className="text-xs font-bold uppercase tracking-widest hover:text-muted-foreground dark:hover:text-gray-300">
              Sign In
            </Link>
            <div className="border-l border-border dark:border-white/20 pl-6">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">

        {/* HERO SECTION */}
        <section className="px-6 mb-24 max-w-screen-xl mx-auto text-center flex flex-col items-center">

          <div className="mb-8 inline-block px-4 py-2 border border-border dark:border-white/30 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground dark:text-gray-300">
            Book trusted services • Standard Fixed Prices
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
            Future of <br /> <span className="text-cyan-500 dark:text-cyan-400 selection:bg-cyan-500/20">Household Services</span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto mb-16 leading-relaxed font-light">
            Experience the new standard. Verified professionals. <br />
            Transparent pricing. Zero friction.
          </p>

          <div className="flex flex-col md:flex-row gap-8 w-full md:w-auto px-4 justify-center">
            <Link to="/signin" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-12 py-5 bg-foreground text-background dark:bg-black dark:text-white border-2 border-foreground dark:border-white rounded-full text-lg font-bold uppercase tracking-widest hover:bg-background hover:text-foreground dark:hover:bg-cyan-950/30 dark:hover:text-cyan-400 dark:hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                Sign In as User
              </button>
            </Link>

            <Link to="/signin" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-12 py-5 bg-foreground text-background dark:bg-black dark:text-white border-2 border-foreground dark:border-white rounded-full text-lg font-bold uppercase tracking-widest hover:bg-background hover:text-foreground dark:hover:bg-cyan-950/30 dark:hover:text-cyan-400 dark:hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                Sign In as Provider
              </button>
            </Link>
          </div>
        </section>

        {/* WHY CHOOSE WORKLOW */}
        <section className="py-24 px-6 bg-background dark:bg-black border-t border-border dark:border-white/10">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-foreground dark:text-white mb-4">
                Why Choose Worklow
              </h2>
              <p className="text-muted-foreground dark:text-gray-400 text-sm md:text-base font-medium tracking-wider uppercase max-w-2xl mx-auto">
                A smarter, safer, and more transparent way to book services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="p-6 border border-border dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all duration-300 group hover:bg-secondary/50 dark:hover:bg-cyan-950/10">
                  <h3 className="text-foreground dark:text-white font-bold uppercase tracking-wider mb-2 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-500 text-xs leading-relaxed group-hover:text-foreground/80 dark:group-hover:text-gray-300 font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO USE */}
        <section className="py-24 px-6 bg-background dark:bg-black border-t border-border dark:border-white/10">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-foreground dark:text-white mb-20 text-center">
              How to Use Worklow
            </h2>

            <div className="grid md:grid-cols-2 gap-16 md:gap-24 relative">
              {/* Divider for desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border dark:bg-white/10 transform -translate-x-1/2"></div>

              {/* USER COLUMN */}
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-widest text-foreground dark:text-white mb-10 text-center md:text-left pl-4 border-l-4 border-foreground dark:border-cyan-400">
                  For Users
                </h3>
                <div className="space-y-8">
                  {howToUseUser.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-6 group">
                      <span className="text-4xl font-black text-muted-foreground/20 dark:text-white/10 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                        0{idx + 1}
                      </span>
                      <p className="text-lg text-muted-foreground dark:text-gray-300 font-light uppercase tracking-wide pt-2 border-b border-border dark:border-white/5 pb-2 w-full group-hover:border-cyan-500/30 dark:group-hover:border-cyan-400/30 transition-all group-hover:text-foreground dark:group-hover:text-white">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROVIDER COLUMN */}
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-widest text-foreground dark:text-white mb-10 text-center md:text-left pl-4 border-l-4 border-foreground dark:border-cyan-400">
                  For Providers
                </h3>
                <div className="space-y-8">
                  {howToUseProvider.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-6 group">
                      <span className="text-4xl font-black text-muted-foreground/20 dark:text-white/10 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                        0{idx + 1}
                      </span>
                      <p className="text-lg text-muted-foreground dark:text-gray-300 font-light uppercase tracking-wide pt-2 border-b border-border dark:border-white/5 pb-2 w-full group-hover:border-cyan-500/30 dark:group-hover:border-cyan-400/30 transition-all group-hover:text-foreground dark:group-hover:text-white">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="py-24 px-6 border-t border-border dark:border-white/10 bg-background dark:bg-black">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2 text-foreground dark:text-white">Get in Touch</h2>
            <p className="text-muted-foreground dark:text-gray-400 mb-12">We'd love to hear from you.</p>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground dark:text-gray-500 mb-2 block">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-background dark:bg-black border border-border dark:border-white/30 text-foreground dark:text-white p-4 rounded-sm focus:border-foreground dark:focus:border-white focus:outline-none transition-colors"
                    placeholder="YOUR NAME"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground dark:text-gray-500 mb-2 block">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-background dark:bg-black border border-border dark:border-white/30 text-foreground dark:text-white p-4 rounded-sm focus:border-foreground dark:focus:border-white focus:outline-none transition-colors"
                    placeholder="YOUR EMAIL"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground dark:text-gray-500 mb-2 block">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-background dark:bg-black border border-border dark:border-white/30 text-foreground dark:text-white p-4 rounded-sm focus:border-foreground dark:focus:border-white focus:outline-none transition-colors resize-none"
                  placeholder="HOW CAN WE HELP?"
                ></textarea>
              </div>
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="px-12 py-4 bg-foreground text-background dark:bg-cyan-500 dark:text-black font-bold uppercase tracking-widest hover:bg-muted-foreground/20 dark:hover:bg-cyan-400 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all w-full md:w-auto rounded-sm"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </section>

      </main>

      {/* Footer Minimal */}
      <footer className="py-12 text-center border-t border-border dark:border-white/10 bg-background dark:bg-black">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground dark:text-gray-500">
          © 2025 WORKLOW • Designed by Rushi, Tirth, Shyama, Vishwa
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
