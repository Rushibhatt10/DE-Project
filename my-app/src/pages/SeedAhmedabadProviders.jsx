import React, { useMemo, useState } from "react";
import { db } from "../firebase";
import { doc, writeBatch, Timestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { CheckCircle2, Loader2, MapPin, Wrench } from "lucide-react";
import Card from "../components/ui/Card";
import MagneticButton from "../components/ui/MagneticButton";

const PROVIDERS = [
  {
    uid: "demo_electrician_navrangpura",
    fullName: "Rahul Patel",
    email: "rahul.electrician.demo@worklow.in",
    phone: "9898001001",
    serviceType: "Electrical",
    yearsOfExperience: "6",
    address: "Navrangpura, Ahmedabad",
    city: "Ahmedabad",
    pincode: "380009",
  },
  {
    uid: "demo_electrician_maninagar",
    fullName: "Amit Shah",
    email: "amit.electrician.demo@worklow.in",
    phone: "9898001002",
    serviceType: "Electrical",
    yearsOfExperience: "8",
    address: "Maninagar, Ahmedabad",
    city: "Ahmedabad",
    pincode: "380008",
  },
  {
    uid: "demo_plumber_chandkheda",
    fullName: "Jignesh Parmar",
    email: "jignesh.plumber.demo@worklow.in",
    phone: "9898001003",
    serviceType: "Plumbing",
    yearsOfExperience: "7",
    address: "Chandkheda, Ahmedabad",
    city: "Ahmedabad",
    pincode: "382424",
  },
  {
    uid: "demo_plumber_bopal",
    fullName: "Nilesh Solanki",
    email: "nilesh.plumber.demo@worklow.in",
    phone: "9898001004",
    serviceType: "Plumbing",
    yearsOfExperience: "5",
    address: "Bopal, Ahmedabad",
    city: "Ahmedabad",
    pincode: "380058",
  },
  {
    uid: "demo_carpenter_vastrapur",
    fullName: "Pratik Bhatt",
    email: "pratik.carpenter.demo@worklow.in",
    phone: "9898001005",
    serviceType: "Carpentry",
    yearsOfExperience: "9",
    address: "Vastrapur, Ahmedabad",
    city: "Ahmedabad",
    pincode: "380015",
  },
  {
    uid: "demo_carpenter_nikol",
    fullName: "Harshad Chauhan",
    email: "harshad.carpenter.demo@worklow.in",
    phone: "9898001006",
    serviceType: "Carpentry",
    yearsOfExperience: "6",
    address: "Nikol, Ahmedabad",
    city: "Ahmedabad",
    pincode: "382350",
  },
];

const SERVICES = [
  {
    id: "demo_service_electrical_navrangpura_1",
    providerUid: "demo_electrician_navrangpura",
    name: "Switchboard Repair - Navrangpura",
    category: "Electrical",
    subcategory: "Switchboard Repair",
    visitingCharge: 199,
    location: "Navrangpura, Ahmedabad",
    address: "Near C G Road",
    rating: 4.7,
    reviewCount: 28,
  },
  {
    id: "demo_service_electrical_maninagar_1",
    providerUid: "demo_electrician_maninagar",
    name: "Wiring Fault Check - Maninagar",
    category: "Electrical",
    subcategory: "Wiring Fault Check",
    visitingCharge: 249,
    location: "Maninagar, Ahmedabad",
    address: "Near Kankaria Road",
    rating: 4.6,
    reviewCount: 20,
  },
  {
    id: "demo_service_plumbing_chandkheda_1",
    providerUid: "demo_plumber_chandkheda",
    name: "Pipe Leakage Fix - Chandkheda",
    category: "Plumbing",
    subcategory: "Pipe Leakage Fix",
    visitingCharge: 229,
    location: "Chandkheda, Ahmedabad",
    address: "Near IOC Circle",
    rating: 4.8,
    reviewCount: 35,
  },
  {
    id: "demo_service_plumbing_bopal_1",
    providerUid: "demo_plumber_bopal",
    name: "Tap Repair - Bopal",
    category: "Plumbing",
    subcategory: "Tap Repair/Replacement",
    visitingCharge: 179,
    location: "Bopal, Ahmedabad",
    address: "Near Bopal Cross Road",
    rating: 4.5,
    reviewCount: 18,
  },
  {
    id: "demo_service_carpentry_vastrapur_1",
    providerUid: "demo_carpenter_vastrapur",
    name: "Door & Window Repair - Vastrapur",
    category: "Carpentry",
    subcategory: "Door/Window Repair",
    visitingCharge: 249,
    location: "Vastrapur, Ahmedabad",
    address: "Near Vastrapur Lake",
    rating: 4.7,
    reviewCount: 22,
  },
  {
    id: "demo_service_carpentry_nikol_1",
    providerUid: "demo_carpenter_nikol",
    name: "Furniture Assembly - Nikol",
    category: "Carpentry",
    subcategory: "Furniture Assembly",
    visitingCharge: 299,
    location: "Nikol, Ahmedabad",
    address: "Near Nikol Gam",
    rating: 4.6,
    reviewCount: 19,
  },
];

const providerByUid = PROVIDERS.reduce((acc, provider) => {
  acc[provider.uid] = provider;
  return acc;
}, {});

const SeedAhmedabadProviders = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const counts = useMemo(() => {
    return {
      electricians: PROVIDERS.filter((provider) => provider.serviceType === "Electrical").length,
      plumbers: PROVIDERS.filter((provider) => provider.serviceType === "Plumbing").length,
      carpenters: PROVIDERS.filter((provider) => provider.serviceType === "Carpentry").length,
      providers: PROVIDERS.length,
      services: SERVICES.length,
    };
  }, []);

  const handleSeed = async () => {
    const ok = window.confirm(
      "Seed Ahmedabad demo providers and services? Existing demo IDs will be overwritten."
    );
    if (!ok) return;

    setLoading(true);
    setCompleted(false);
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();

      PROVIDERS.forEach((provider) => {
        const userRef = doc(db, "users", provider.uid);
        const verifiedProviderRef = doc(db, "verified_providers", provider.uid);

        batch.set(
          userRef,
          {
            name: provider.fullName,
            email: provider.email,
            phone: provider.phone,
            role: "provider",
            method: "seed",
            createdAt: now,
          },
          { merge: true }
        );

        batch.set(
          verifiedProviderRef,
          {
            uid: provider.uid,
            fullName: provider.fullName,
            name: provider.fullName,
            email: provider.email,
            phone: provider.phone,
            serviceType: provider.serviceType,
            serviceCategory: provider.serviceType,
            yearsOfExperience: provider.yearsOfExperience,
            experience: provider.yearsOfExperience,
            address: provider.address,
            city: provider.city,
            pincode: provider.pincode,
            status: "APPROVED",
            verifiedAt: now,
          },
          { merge: true }
        );
      });

      SERVICES.forEach((service) => {
        const provider = providerByUid[service.providerUid];
        const serviceRef = doc(db, "provider_services", service.id);

        batch.set(
          serviceRef,
          {
            providerUid: service.providerUid,
            providerName: provider?.fullName || "Provider",
            providerEmail: provider?.email || "",
            category: service.category,
            subcategory: service.subcategory,
            name: service.name,
            description: `${service.category} service in ${service.location}.`,
            price: service.visitingCharge,
            visitingCharge: service.visitingCharge,
            minimumVisitCharge: service.visitingCharge,
            useStandardPrice: false,
            location: service.location,
            address: service.address,
            availability: "Anytime",
            estimatedTime: "1 Hour",
            imageUrls: [],
            verified: true,
            status: "Active",
            rating: service.rating,
            reviewCount: service.reviewCount,
            createdAt: now,
          },
          { merge: true }
        );
      });

      await batch.commit();
      setCompleted(true);
      toast.success(
        `Seeded ${counts.providers} providers and ${counts.services} services in Ahmedabad.`
      );
    } catch (error) {
      console.error("Ahmedabad provider seeding failed:", error);
      toast.error("Failed to seed providers. Check Firestore permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8">
        <h1 className="text-2xl font-bold mb-2">Seed Ahmedabad Providers</h1>
        <p className="text-muted-foreground mb-6">
          Adds demo providers/services:
          <span className="font-semibold"> 2 electricians, 2 plumbers, 2 carpenters</span>
          across different Ahmedabad areas.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Providers</p>
            <p className="text-xl font-bold mt-1">{counts.providers}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Electrical: {counts.electricians}, Plumbing: {counts.plumbers}, Carpentry: {counts.carpenters}
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Services</p>
            <p className="text-xl font-bold mt-1">{counts.services}</p>
            <p className="text-xs text-muted-foreground mt-2">All set as Active + verified</p>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4 mb-6">
          <p className="text-sm font-semibold mb-2 inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Areas Covered
          </p>
          <p className="text-sm text-muted-foreground">
            Navrangpura, Maninagar, Chandkheda, Bopal, Vastrapur, Nikol
          </p>
        </div>

        <MagneticButton
          onClick={handleSeed}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            completed ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Seeding...
            </span>
          ) : completed ? (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Seed Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Seed Ahmedabad Data
            </span>
          )}
        </MagneticButton>
      </Card>
    </div>
  );
};

export default SeedAhmedabadProviders;

