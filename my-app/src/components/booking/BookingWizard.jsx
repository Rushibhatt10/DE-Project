import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Calendar, Clock, MapPin, CheckCircle, ChevronLeft, ChevronRight, X, Navigation, Search, AlertTriangle, Loader2 } from "lucide-react";
import Card from "../ui/Card";
import MagneticButton from "../ui/MagneticButton";

// Fix for Leaflet marker icons
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const steps = [
    { id: 1, title: "Requirement", icon: <CheckCircle className="w-5 h-5" /> },
    { id: 2, title: "Location", icon: <MapPin className="w-5 h-5" /> },
    { id: 3, title: "Slot", icon: <Calendar className="w-5 h-5" /> },
    { id: 4, title: "Review", icon: <CheckCircle className="w-5 h-5" /> },
];

const GEOAPIFY_API_KEY = "76470fd0d5294effa24ded7a415a7fdf";

// --- Extracted Step Components ---

const StepRequirement = ({ bookingData, setBookingData }) => {
    const textareaRef = useRef(null);
    const MAX_CHARS = 500;

    const handleInput = (e) => {
        const target = e.target;
        target.style.height = "inherit";
        target.style.height = `${target.scrollHeight}px`;
        setBookingData({ ...bookingData, description: target.value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Describe your problem</h3>
                <p className="text-muted-foreground">
                    Please provide details about the issue so the provider can come prepared.
                </p>
            </div>

            <div className="relative group">
                <textarea
                    ref={textareaRef}
                    className="w-full p-5 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-background hover:bg-secondary/50 transition-all duration-300 outline-none min-h-[180px] resize-none text-lg leading-relaxed shadow-sm focus:shadow-xl"
                    placeholder="e.g., My AC is making a loud noise and not cooling properly..."
                    value={bookingData.description}
                    onChange={handleInput}
                    maxLength={MAX_CHARS}
                    autoFocus
                />
                <div className="absolute bottom-4 right-4 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-md backdrop-blur-sm border border-border/50">
                    {bookingData.description.length} / {MAX_CHARS}
                </div>
            </div>

            {bookingData.description.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-500/10 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Description is required to proceed.</span>
                </div>
            )}
        </div>
    );
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 14);
    }, [center, map]);
    return null;
};

const LocationMarker = ({ position, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return position ? <Marker position={position} /> : null;
};

const StepAddress = ({ bookingData, setBookingData, providerCoords, distance, isWithinRange }) => {
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const reverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                setBookingData(prev => ({ ...prev, address: data.features[0].properties.formatted }));
            }
        } catch (err) {
            console.error("Reverse geocoding failed", err);
        }
    };

    const handleLocationSelect = (latlng) => {
        setBookingData(prev => ({ ...prev, coordinates: latlng }));
        reverseGeocode(latlng.lat, latlng.lng);
    };

    const handleSearch = async (query) => {
        setBookingData(prev => ({ ...prev, address: query }));
        if (query.length > 2) {
            try {
                const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}`);
                const data = await res.json();
                setAddressSuggestions(data.features || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Autocomplete failed", err);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (feature) => {
        const { lat, lon, formatted } = feature.properties;
        setBookingData(prev => ({
            ...prev,
            address: formatted,
            coordinates: { lat, lng: lon }
        }));
        setShowSuggestions(false);
    };

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setBookingData(prev => ({
                        ...prev,
                        coordinates: { lat: latitude, lng: longitude }
                    }));
                    reverseGeocode(latitude, longitude);
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Geolocation error", error);
                    setLoadingLocation(false);
                    alert("Could not get your location. Please enable GPS.");
                }
            );
        } else {
            setLoadingLocation(false);
            alert("Geolocation not supported");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Confirm Location</h3>
                <button
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                    {loadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    Use Current Location
                </button>
            </div>

            <div className="relative">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for your area..."
                        className="w-full p-4 pl-12 rounded-xl bg-secondary border border-border focus:border-primary outline-none transition-all"
                        value={bookingData.address}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>

                {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[200px] overflow-y-auto">
                        {addressSuggestions.map((feature, idx) => (
                            <div
                                key={idx}
                                onClick={() => selectSuggestion(feature)}
                                className="p-3 hover:bg-primary/10 cursor-pointer border-b border-border/50 last:border-none text-sm"
                            >
                                {feature.properties.formatted}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-[300px] rounded-xl overflow-hidden border border-border relative z-0 shadow-inner">
                <MapContainer
                    center={bookingData.coordinates || providerCoords || { lat: 23.0225, lng: 72.5714 }}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapUpdater center={bookingData.coordinates} />
                    <LocationMarker position={bookingData.coordinates} onLocationSelect={handleLocationSelect} />
                    {providerCoords && (
                        <Marker position={providerCoords} opacity={0.5}>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {bookingData.coordinates && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${isWithinRange ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-red-500/10 border-red-500/20 text-red-600"}`}>
                    {isWithinRange ? (
                        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                        <p className="font-bold">{isWithinRange ? "Service Available" : "Out of Service Range"}</p>
                        <p className="text-sm opacity-90">
                            Distance: {distance} km {isWithinRange ? "(Within 5km)" : "(Above 5km limit)"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StepSlot = ({ bookingData, setBookingData }) => {
    const dates = Array.from({ length: 5 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const times = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Select Date
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {dates.map((date, i) => (
                        <button
                            key={i}
                            onClick={() => setBookingData({ ...bookingData, date: date.toISOString() })}
                            className={`flex-shrink-0 p-4 rounded-2xl border transition-all text-center min-w-[100px] ${bookingData.date === date.toISOString()
                                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                : "bg-card border-border hover:border-primary/50 hover:bg-secondary/50"
                                }`}
                        >
                            <div className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                            <div className="text-2xl font-bold">{date.getDate()}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Select Time
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {times.map((time) => (
                        <button
                            key={time}
                            onClick={() => setBookingData({ ...bookingData, timeSlot: time })}
                            className={`p-3 rounded-xl border transition-all text-sm font-medium ${bookingData.timeSlot === time
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-card border-border hover:border-primary/50 hover:bg-secondary/50"
                                }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StepReview = ({ service, bookingData, distance, isWithinRange }) => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold">Review Booking</h3>
        <div className="bg-secondary/30 p-6 rounded-2xl space-y-4 border border-border shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Service</span>
                <span className="font-bold text-lg">{service.name}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold text-primary text-lg">₹{service.price}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Date & Time</span>
                <div className="text-right">
                    <div className="font-bold">{bookingData.date ? new Date(bookingData.date).toLocaleDateString() : ""}</div>
                    <div className="text-sm text-muted-foreground">{bookingData.timeSlot}</div>
                </div>
            </div>
            <div className="flex justify-between items-start pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Address</span>
                <span className="font-bold text-right max-w-[200px] text-sm">{bookingData.address}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Distance</span>
                <span className={`font-bold ${isWithinRange ? "text-green-600" : "text-red-600"}`}>{distance} km</span>
            </div>
        </div>

        {!isWithinRange && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                Cannot proceed. Location is outside the 5km service radius.
            </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-blue-500/10 p-4 rounded-xl text-blue-600 border border-blue-500/20">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>No payment required now. You can pay after the service is completed.</span>
        </div>
    </div>
);

const BookingWizard = ({ service, onClose, onConfirm }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        description: "",
        address: "",
        coordinates: null,
        date: null,
        timeSlot: null,
    });
    const [providerCoords, setProviderCoords] = useState(null);
    const [distance, setDistance] = useState(null);
    const [isWithinRange, setIsWithinRange] = useState(true);

    // Geocode Provider Location on Init
    useEffect(() => {
        const geocodeProvider = async () => {
            if (service.coordinates) {
                setProviderCoords(service.coordinates);
            } else if (service.location) {
                try {
                    const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(service.location)}&apiKey=${GEOAPIFY_API_KEY}`);
                    const data = await res.json();
                    if (data.features && data.features.length > 0) {
                        const { lat, lon } = data.features[0].properties;
                        setProviderCoords({ lat, lng: lon });
                    }
                } catch (err) {
                    console.error("Failed to geocode provider location", err);
                    setProviderCoords({ lat: 23.0225, lng: 72.5714 }); // Default Ahmedabad
                }
            }
        };
        geocodeProvider();
    }, [service]);

    // Calculate Distance
    useEffect(() => {
        if (bookingData.coordinates && providerCoords) {
            const dist = calculateDistance(
                bookingData.coordinates.lat,
                bookingData.coordinates.lng,
                providerCoords.lat,
                providerCoords.lng
            );
            setDistance(dist);
            setIsWithinRange(dist <= 5);
        }
    }, [bookingData.coordinates, providerCoords]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return parseFloat(d.toFixed(2));
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // --- Navigation Logic ---

    const handleNext = () => {
        if (currentStep === 1 && !bookingData.description) return alert("Please describe the problem.");
        if (currentStep === 2) {
            if (!bookingData.address || !bookingData.coordinates) return alert("Please confirm your location.");
            if (!isWithinRange) return alert("Service is out of range (must be within 5km).");
        }
        if (currentStep === 3 && (!bookingData.date || !bookingData.timeSlot)) return alert("Please select date and time.");

        if (currentStep < 4) setCurrentStep(currentStep + 1);
        else onConfirm(bookingData);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm">
                    <div>
                        <h2 className="font-bold text-xl">Book Service</h2>
                        <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-6">
                    <div className="flex justify-between mb-2">
                        {steps.map((step) => (
                            <div key={step.id} className={`flex flex-col items-center gap-2 transition-colors ${step.id <= currentStep ? "text-primary" : "text-muted-foreground/50"}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step.id <= currentStep ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}>
                                    {step.id < currentStep ? <CheckCircle className="w-6 h-6" /> : step.icon}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(currentStep / 4) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 bg-background">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentStep === 1 && <StepRequirement bookingData={bookingData} setBookingData={setBookingData} />}
                            {currentStep === 2 && <StepAddress bookingData={bookingData} setBookingData={setBookingData} providerCoords={providerCoords} distance={distance} isWithinRange={isWithinRange} />}
                            {currentStep === 3 && <StepSlot bookingData={bookingData} setBookingData={setBookingData} />}
                            {currentStep === 4 && <StepReview service={service} bookingData={bookingData} distance={distance} isWithinRange={isWithinRange} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex justify-between items-center bg-card/50 backdrop-blur-sm">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <MagneticButton
                        onClick={handleNext}
                        disabled={currentStep === 4 && !isWithinRange}
                        className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-2"
                    >
                        {currentStep === 4 ? "Confirm Booking" : "Next"}
                        {currentStep < 4 && <ChevronRight className="w-4 h-4" />}
                    </MagneticButton>
                </div>
            </motion.div>
        </div>
    );
};

export default BookingWizard;
