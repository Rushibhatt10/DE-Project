import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gift,
  MessageSquareLock,
  PhoneCall,
  Repeat,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";

const quickStats = [
  { value: "100%", label: "Upfront pricing" },
  { value: "24/7", label: "Tracking and support" },
  { value: "9", label: "Retention benefits" }
];

const valuePromise = [
  {
    title: "Service Guarantee for App Bookings",
    desc: "Guarantee is active only when booking and completion happen fully inside the app.",
    badge: "Core"
  },
  {
    title: "Loyalty Rewards Program",
    desc: "Earn points for each completed order and redeem them as booking credits.",
    badge: "Rewards"
  },
  {
    title: "Subscription Plans with Member Savings",
    desc: "Monthly and yearly plans reduce cost and unlock better support speed.",
    badge: "Membership"
  },
  {
    title: "Secure In-App Messaging",
    desc: "Keep chat in-app so timeline, proofs, and support records stay protected.",
    badge: "Safety"
  },
  {
    title: "Smart Rebooking Engine",
    desc: "If a provider cancels, the system automatically prioritizes the next available match.",
    badge: "Reliability"
  },
  {
    title: "Customer Safety Benefits",
    desc: "Verified providers, service logs, and escalation support improve customer protection.",
    badge: "Trust"
  },
  {
    title: "Price Transparency",
    desc: "Clear breakdown is visible before booking so there are no hidden fees later.",
    badge: "Clarity"
  },
  {
    title: "Provider Quality Benefits",
    desc: "High-performing providers gain higher visibility, improving service quality overall.",
    badge: "Quality"
  },
  {
    title: "Loyal Customer Helpline",
    desc: "Frequent customers receive priority support for urgent issues and fast rebooking.",
    badge: "Support"
  }
];

const trustHighlights = [
  {
    title: "App-only coverage",
    desc: "Support can verify service history instantly when everything remains in one system.",
    icon: ShieldCheck
  },
  {
    title: "Recovery-first operations",
    desc: "Smart rebooking and support workflow reduce interruption from cancellations.",
    icon: Repeat
  },
  {
    title: "Retention built-in",
    desc: "Rewards and plans increase value for repeat customers over time.",
    icon: Gift
  }
];

const customerSteps = [
  "Sign in as customer",
  "Select service type",
  "Add address or GPS location",
  "Review fixed pricing and schedule",
  "Confirm booking in-app",
  "Track provider in real time",
  "Complete service and rate provider"
];

const providerSteps = [
  "Sign in as provider",
  "Upload profile and required documents",
  "Get account verification",
  "Receive matching requests",
  "Accept according to availability",
  "Navigate to customer location",
  "Complete work and build rating"
];

const LandingPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activePromiseIndex, setActivePromiseIndex] = useState(0);
  const [pauseSlider, setPauseSlider] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("worklow-value-banner-dismissed") === "1") {
      setShowBanner(false);
    }
  }, []);

  useEffect(() => {
    if (pauseSlider) return undefined;
    const timer = setInterval(() => {
      setActivePromiseIndex((prev) => (prev + 1) % valuePromise.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [pauseSlider]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dismissBanner = () => {
    localStorage.setItem("worklow-value-banner-dismissed", "1");
    setShowBanner(false);
  };

  const goToSlide = (index) => {
    const total = valuePromise.length;
    setActivePromiseIndex((index + total) % total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent successfully.");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1200);
  };

  const activePromise = valuePromise[activePromiseIndex];

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-black dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_65%)]" />

      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 dark:bg-black/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-18 md:h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wide">
            Worklow
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#value-promise" className="hover:text-foreground dark:hover:text-white transition-colors">Value Promise</a>
            <a href="#workflow" className="hover:text-foreground dark:hover:text-white transition-colors">Instructions</a>
            <a href="#contact" className="hover:text-foreground dark:hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-diagnosis"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-cyan-500/70 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              AI Detector
            </Link>
            <Link
              to="/signin"
              className="hidden sm:inline-flex px-4 py-2 rounded-full border border-border text-xs font-semibold hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              Sign In
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {showBanner && (
        <div className="px-6 pt-4">
          <div className="max-w-6xl mx-auto rounded-xl border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/25 px-4 py-3 flex items-start justify-between gap-3">
            <p className="text-sm text-foreground/90 dark:text-gray-200">
              Book and chat in-app to unlock guarantee, loyalty rewards, and priority helpline support.
            </p>
            <button
              type="button"
              onClick={dismissBanner}
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="px-6 pb-24 pt-10 md:pt-14 space-y-20 md:space-y-24">
        <section className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-7">
            <div className="lg:col-span-8 rounded-3xl border border-border bg-background/95 dark:bg-black/60 p-8 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground mb-6">
                <Clock3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Trusted household service platform
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Clean booking experience,
                <span className="block text-cyan-600 dark:text-cyan-400">clear customer protection.</span>
              </h1>

              <p className="mt-5 text-base md:text-lg text-muted-foreground dark:text-gray-300 max-w-2xl">
                Worklow keeps pricing transparent, communication secure, and service quality measurable for every booking.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-foreground text-background dark:bg-white dark:text-black text-sm font-semibold hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-400 transition-colors"
                >
                  Book as Customer
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full border border-border text-sm font-semibold hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
                >
                  Join as Provider
                </Link>
                <Link
                  to="/ai-diagnosis"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full border border-cyan-500/70 bg-cyan-500/10 text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Issue Detector
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 uppercase tracking-wider">
                    New
                  </span>
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/25 px-4 py-3 flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/15 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Issue Detector is live</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload issue image + description to get instant category, estimated pricing, and provider recommendation.
                  </p>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 rounded-3xl border border-border bg-background/95 dark:bg-black/55 p-6">
              <div className="space-y-3 mb-6">
                {quickStats.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border p-4">
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <BadgeCheck className="w-4 h-4 mt-1 text-cyan-600 dark:text-cyan-400" />
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Guarantee applies only for app-booked jobs.</p>
                </div>
                <div className="flex gap-2.5">
                  <MessageSquareLock className="w-4 h-4 mt-1 text-cyan-600 dark:text-cyan-400" />
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Keep communication in-app for full support traceability.</p>
                </div>
                <div className="flex gap-2.5">
                  <PhoneCall className="w-4 h-4 mt-1 text-cyan-600 dark:text-cyan-400" />
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Loyal customers receive priority helpline support.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="value-promise" className="max-w-6xl mx-auto">
          <div className="mb-7">
            <p className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">Customer Value Promise</p>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Why Customers Stay With Worklow</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Each point below rotates automatically and explains how in-app bookings protect quality and retention.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {valuePromise.map((item, idx) => (
              <button
                key={item.title}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                  activePromiseIndex === idx
                    ? "border-cyan-500/70 bg-cyan-500/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-cyan-500/40"
                }`}
              >
                {item.badge}
              </button>
            ))}
          </div>

          <div
            className="rounded-3xl border border-border bg-background/95 dark:bg-black/60 overflow-hidden"
            onMouseEnter={() => setPauseSlider(true)}
            onMouseLeave={() => setPauseSlider(false)}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activePromiseIndex * 100}%)` }}
            >
              {valuePromise.map((item) => (
                <article key={item.title} className="min-w-full p-7 md:p-10">
                  <p className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-4">
                    {item.badge}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-3">{item.title}</h3>
                  <p className="text-base text-muted-foreground dark:text-gray-300 leading-relaxed max-w-3xl">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>

            <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Point {activePromiseIndex + 1} of {valuePromise.length}: {activePromise.title}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToSlide(activePromiseIndex - 1)}
                  className="w-9 h-9 rounded-full border border-border inline-flex items-center justify-center hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
                  aria-label="Previous point"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(activePromiseIndex + 1)}
                  className="w-9 h-9 rounded-full border border-border inline-flex items-center justify-center hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
                  aria-label="Next point"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
          {trustHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-border bg-background/95 dark:bg-black/55 p-5">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-300">{item.desc}</p>
              </article>
            );
          })}
        </section>

        <section id="workflow" className="max-w-6xl mx-auto">
          <div className="mb-7">
            <p className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">Instructions</p>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Simple Steps for Customers and Providers</h2>
            <p className="text-muted-foreground mt-2">
              The process is structured to keep service history, pricing, and support traceable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <article className="rounded-2xl border border-border bg-background/95 dark:bg-black/55 p-6">
              <h3 className="text-xl font-bold mb-5">For Customers</h3>
              <ol className="space-y-3">
                {customerSteps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm md:text-base text-muted-foreground dark:text-gray-300">{step}</p>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-2xl border border-border bg-background/95 dark:bg-black/55 p-6">
              <h3 className="text-xl font-bold mb-5">For Providers</h3>
              <ol className="space-y-3">
                {providerSteps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm md:text-base text-muted-foreground dark:text-gray-300">{step}</p>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        <section id="contact" className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-border bg-background/95 dark:bg-black/55 p-7 md:p-9">
            <div className="text-center mb-7">
              <p className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">Contact</p>
              <h2 className="text-3xl md:text-4xl font-black mt-2">Need Help Choosing the Right Plan?</h2>
              <p className="text-muted-foreground mt-2">
                Send your requirement and we will help with pricing, plans, and onboarding.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl border border-border bg-background dark:bg-black px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your email"
                  className="w-full rounded-xl border border-border bg-background dark:bg-black px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Your message"
                className="w-full rounded-xl border border-border bg-background dark:bg-black px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Loyal customers receive priority helpline response.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background dark:bg-white dark:text-black text-sm font-semibold hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-400 transition-colors"
                >
                  {loading ? "Sending..." : "Send Message"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-7">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-muted-foreground">
          <p>Copyright 2026 Worklow. All rights reserved.</p>
          <p>Book and communicate in-app for full guarantee coverage.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
