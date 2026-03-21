import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Star,
  UploadCloud,
  XCircle
} from "lucide-react";
import { db } from "../firebase";
import { getVisitingCharge } from "../utils/pricing";

const API_URL = import.meta.env.VITE_AI_DIAGNOSE_URL || "http://localhost:5000/api/diagnose";
const CATEGORY_HINTS = {
  Plumbing: ["plumb", "pipe", "drain", "leak", "tap", "toilet"],
  Electrical: ["electric", "wiring", "switch", "socket", "mcb"],
  "AC Repair": ["ac", "air", "cooling", "compressor"],
  "Appliance Repair": ["appliance", "fridge", "washing", "microwave", "geyser"],
  "Pest Control": ["pest", "termite", "cockroach", "rodent"],
  Carpentry: ["carpent", "wood", "door", "furniture", "cabinet"],
  Painting: ["paint", "wall", "surface"],
  Cleaning: ["clean", "deep clean", "sanit", "stain"],
  General: []
};

const IssueDetector = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  const previewUrl = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchTopRecommendations = async (detectedCategory) => {
    if (!detectedCategory) {
      setRecommendedServices([]);
      return;
    }

    setRecommendationLoading(true);
    setRecommendationError("");
    try {
      const categoryQuery = query(
        collection(db, "provider_services"),
        where("category", "==", detectedCategory)
      );
      const servicesSnap = await getDocs(categoryQuery);
      let services = servicesSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Fallback to all services if exact category match has no results.
      if (services.length === 0) {
        const allServicesSnap = await getDocs(collection(db, "provider_services"));
        const allServices = allServicesSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const categoryKeywords = CATEGORY_HINTS[detectedCategory] || [];
        const filteredByHints = allServices.filter((service) => {
          const categoryText = String(service.category || "").toLowerCase();
          const nameText = String(service.name || "").toLowerCase();
          return categoryKeywords.some(
            (keyword) => categoryText.includes(keyword) || nameText.includes(keyword)
          );
        });

        services = filteredByHints.length > 0 ? filteredByHints : allServices;
      }

      services = services.filter(
        (service) => String(service.status || "Active").toLowerCase() === "active"
      );

      if (services.length === 0) {
        setRecommendedServices([]);
        return;
      }

      const requestsSnap = await getDocs(collection(db, "user_requests"));
      const requestList = requestsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const ratingsSnap = await getDocs(collection(db, "ratings"));
      const ratingsByRequestId = new Map();
      ratingsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        ratingsByRequestId.set(data.requestId, Number(data.rating || 0));
      });

      const serviceCharges = services
        .map((service) => getVisitingCharge(service))
        .filter((charge) => charge > 0);

      const minCharge = serviceCharges.length > 0 ? Math.min(...serviceCharges) : 0;
      const maxCharge = serviceCharges.length > 0 ? Math.max(...serviceCharges) : 0;
      const chargeSpan = Math.max(1, maxCharge - minCharge);

      const scoredServices = services
        .map((service) => {
          const visitingCharge = getVisitingCharge(service);
          const serviceRequests = requestList.filter(
            (req) => req.serviceId === service.id
          );
          const serviceRatings = serviceRequests
            .map((req) => ratingsByRequestId.get(req.id))
            .filter((value) => Number.isFinite(value) && value > 0);

          const reviewCount = serviceRatings.length || Number(service.reviewCount || 0);
          const averageRating =
            serviceRatings.length > 0
              ? serviceRatings.reduce((sum, value) => sum + value, 0) / serviceRatings.length
              : Number(service.rating || 4.2);

          const ratingScore = Math.max(0, Math.min(1, averageRating / 5));
          const normalizedCharge =
            visitingCharge > 0 ? visitingCharge : maxCharge + 1;
          const priceScore =
            serviceCharges.length > 0
              ? 1 - (normalizedCharge - minCharge) / chargeSpan
              : 0.5;
          const reviewConfidence = Math.min(1, Math.log10(reviewCount + 1) / 1.2);

          // Weighted score: quality first, then cost efficiency, then confidence.
          const overallScore =
            ratingScore * 0.65 + priceScore * 0.25 + reviewConfidence * 0.1;

          return {
            ...service,
            visitingCharge,
            averageRating: Number(averageRating.toFixed(2)),
            reviewCount,
            overallScore,
            matchPercent: Math.round(overallScore * 100),
          };
        })
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 3);

      setRecommendedServices(scoredServices);
    } catch (recommendationErr) {
      console.error("Recommendation fetch error:", recommendationErr);
      setRecommendedServices([]);
      setRecommendationError("Could not load provider suggestions right now.");
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setRecommendedServices([]);
    setRecommendationError("");

    if (!image && !description.trim()) {
      setError("Please upload an image or describe the issue.");
      return;
    }

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("description", description);

    try {
      setLoading(true);
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000
      });
      setResult(response.data);
      await fetchTopRecommendations(response.data?.category);
    } catch (err) {
      const message = err?.response
        ? err?.response?.data?.error ||
          err?.response?.data?.message ||
          "AI analysis failed. Please try again."
        : `Cannot reach AI server at ${API_URL}. Please start backend and try again.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => setImage(null);

  return (
    <div className="relative min-h-screen bg-background dark:bg-black text-foreground dark:text-white px-4 py-8 md:py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.25),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_96%,rgba(148,163,184,0.08)_96%,rgba(148,163,184,0.08)_100%)] bg-[length:26px_26px] opacity-30 dark:opacity-20" />

      <div className="relative max-w-6xl mx-auto">
        <header className="rounded-3xl border border-cyan-500/30 bg-background/90 dark:bg-black/70 backdrop-blur-md p-6 md:p-8 mb-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-xs text-cyan-700 dark:text-cyan-300">
                <Bot className="w-3.5 h-3.5" />
                AI Smart Issue Detector
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-3">
                Upload Issue. Get Diagnosis. Book Faster.
              </h1>
              <p className="text-muted-foreground mt-3 max-w-3xl">
                Share issue image and explain what happened. The AI suggests the problem category, estimated visiting-charge range, and the right provider to call.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 rounded-3xl border border-border bg-card/90 dark:bg-black/60 backdrop-blur p-5 md:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold">Submit Issue Inputs</h2>
              <span className="text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                Image + Description
              </span>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium">Issue Image</span>
                <div className="mt-2 rounded-2xl border border-dashed border-cyan-500/35 bg-cyan-500/5 p-5">
                  {!image ? (
                    <div className="text-center">
                      <UploadCloud className="mx-auto w-8 h-8 text-cyan-600 dark:text-cyan-300 mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">Upload photo of damaged area or issue location</p>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-border mb-3 bg-black/10">
                      <img src={previewUrl} alt="Issue preview" className="w-full h-52 object-cover" />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="block w-full text-sm file:mr-4 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm"
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Issue Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={7}
                  placeholder="Example: Water leaking continuously from sink pipe. The floor gets wet in 10 minutes and there is a bad smell."
                  className="mt-2 w-full rounded-2xl border border-border bg-background dark:bg-black px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </label>

              {error && (
                <p className="text-sm text-red-500 inline-flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/50 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 px-5 py-3.5 font-semibold hover:bg-cyan-500/25 shadow-[0_0_24px_rgba(34,211,238,0.18)] transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Issue
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="lg:col-span-5 rounded-3xl border border-border bg-card/90 dark:bg-black/60 backdrop-blur p-5 md:p-7">
            <h2 className="text-xl md:text-2xl font-bold mb-5">AI Result</h2>

            {!result ? (
              <div className="rounded-2xl border border-border bg-background/60 dark:bg-black/40 p-5">
                <div className="w-10 h-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center mb-3">
                  <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload issue details to view detected category, estimated visiting charge, and recommended provider.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                {result.caption && (
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Image Caption</p>
                    <p className="text-sm">{result.caption}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold">{result.category || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs text-muted-foreground mb-1">Severity</p>
                    <p className="font-semibold capitalize">{result.severity || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Charge (APPROX)</p>
                    <p className="font-semibold">{result.visiting_charge_range || result.price_range || "Inspection required"}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Approximate only. Final price depends on inspection.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs text-muted-foreground mb-1">Provider</p>
                    <p className="font-semibold">{result.provider || "General Technician"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                  <p className="text-xs text-muted-foreground mb-1">Detected Issue</p>
                  <p className="font-medium">{result.issue || "Inspection required"}</p>
                </div>

                {result.approximation_note && (
                  <div className="rounded-xl border border-amber-500/30 p-3 bg-amber-500/5">
                    <p className="text-xs text-amber-600 dark:text-amber-300 mb-1">Important</p>
                    <p className="text-sm text-amber-700 dark:text-amber-200">{result.approximation_note}</p>
                  </div>
                )}

                {Array.isArray(result.pricing_options) && result.pricing_options.length > 0 && (
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs text-muted-foreground mb-2">Issue-wise Approximate Pricing Options</p>
                    <div className="space-y-2">
                      {result.pricing_options.map((option) => (
                        <div key={`${option.issue}-${option.visiting_charge_range}`} className="rounded-lg border border-border px-3 py-2">
                          <p className="text-sm font-medium">{option.issue}</p>
                          <p className="text-xs text-muted-foreground">{option.visiting_charge_range}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                  <p className="text-xs text-muted-foreground mb-2">
                    Best Provider Suggestions (Rating + Visiting Charge)
                  </p>

                  {recommendationLoading ? (
                    <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finding top matches...
                    </p>
                  ) : recommendationError ? (
                    <p className="text-sm text-red-500">{recommendationError}</p>
                  ) : recommendedServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No service providers found for this category yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {recommendedServices.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-lg border border-border px-3 py-2.5 bg-background/70 dark:bg-black/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold leading-tight">{service.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {service.providerName || service.providerEmail || "Provider"}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300">
                              {service.matchPercent}% match
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              {service.averageRating} ({service.reviewCount} reviews)
                            </span>
                            <span>Min visit: ₹{service.visitingCharge || "N/A"}</span>
                          </div>

                          <Link
                            to={`/service/${service.id}`}
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:underline"
                          >
                            View Service
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {Array.isArray(result.next_steps) && result.next_steps.length > 0 && (
                  <div className="rounded-xl border border-border p-3 bg-background/60 dark:bg-black/40">
                    <p className="text-xs text-muted-foreground mb-2">Next Steps</p>
                    <ul className="space-y-1.5">
                      {result.next_steps.map((step) => (
                        <li key={step} className="text-sm text-muted-foreground dark:text-gray-300">
                          - {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default IssueDetector;
