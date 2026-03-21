import { Blob } from "node:buffer";
import { InferenceClient } from "@huggingface/inference";
import fs from "fs/promises";

const HF_TOKEN = process.env.HF_TOKEN || process.env.HF_API_TOKEN || "";
const HF_IMAGE_MODEL = process.env.HF_IMAGE_MODEL || "zai-org/GLM-OCR";
const HF_IMAGE_PROVIDER = process.env.HF_IMAGE_PROVIDER || "auto";
const hfClient = HF_TOKEN ? new InferenceClient(HF_TOKEN) : null;

const VISITING_CHARGE_MAP = {
  Plumbing: [149, 499],
  Electrical: [149, 599],
  "AC Repair": [249, 999],
  "Appliance Repair": [249, 899],
  "Pest Control": [299, 999],
  Carpentry: [199, 699],
  Painting: [199, 799],
  Cleaning: [149, 599],
  General: [149, 699]
};

const PROVIDER_MAP = {
  Plumbing: "Plumber",
  Electrical: "Electrician",
  "AC Repair": "AC Technician",
  "Appliance Repair": "Appliance Technician",
  "Pest Control": "Pest Control Specialist",
  Carpentry: "Carpenter",
  Painting: "Painter",
  Cleaning: "Cleaning Professional",
  General: "General Technician"
};

const ISSUE_MAP = {
  Plumbing: "Possible pipe leakage or drainage issue",
  Electrical: "Electrical wiring or switch issue",
  "AC Repair": "Possible AC cooling or airflow malfunction",
  "Appliance Repair": "Appliance malfunction detected",
  "Pest Control": "Pest infestation likely",
  Carpentry: "Furniture or wood fitting issue",
  Painting: "Wall paint or surface issue",
  Cleaning: "Deep cleaning or stain issue",
  General: "Inspection required to confirm issue"
};

const ISSUE_PRICE_OPTIONS = {
  Plumbing: [
    { issue: "Tap is broken", words: ["tap", "faucet"], range: [120, 450] },
    { issue: "Pipe is broken / leaking", words: ["pipe", "leak", "drain"], range: [200, 900] },
    { issue: "Valve is broken", words: ["valve", "valv"], range: [180, 650] },
    { issue: "Toilet fitting issue", words: ["toilet", "flush"], range: [250, 850] }
  ],
  Electrical: [
    { issue: "Switch/socket issue", words: ["switch", "socket"], range: [150, 500] },
    { issue: "MCB/fuse issue", words: ["mcb", "fuse"], range: [220, 700] },
    { issue: "Wiring fault", words: ["wire", "wiring", "short"], range: [300, 1100] }
  ],
  "AC Repair": [
    { issue: "General AC service", words: ["service", "clean"], range: [350, 900] },
    { issue: "Cooling issue", words: ["cooling", "not cool"], range: [450, 1600] },
    { issue: "Gas refill related", words: ["gas", "refill"], range: [900, 2800] }
  ],
  "Appliance Repair": [
    { issue: "Minor repair visit", words: ["not working", "issue"], range: [300, 900] },
    { issue: "Part replacement likely", words: ["replace", "part", "broken"], range: [700, 2200] }
  ],
  General: [
    { issue: "Basic inspection visit", words: [], range: [149, 399] },
    { issue: "Minor repair likely", words: [], range: [300, 900] },
    { issue: "Major repair likely", words: [], range: [800, 2500] }
  ]
};

const KEYWORD_RULES = [
  { category: "Plumbing", words: ["leak", "water", "pipe", "tap", "sink", "drain", "toilet"] },
  { category: "Electrical", words: ["wire", "switch", "socket", "spark", "fuse", "short", "shock"] },
  { category: "AC Repair", words: ["ac", "air conditioner", "cooling", "compressor", "gas"] },
  { category: "Appliance Repair", words: ["fridge", "washing machine", "microwave", "geyser", "oven"] },
  { category: "Pest Control", words: ["cockroach", "termite", "rat", "pest", "insect"] },
  { category: "Carpentry", words: ["wood", "door", "cabinet", "hinge", "furniture"] },
  { category: "Painting", words: ["paint", "wall", "peeling", "stain"] },
  { category: "Cleaning", words: ["clean", "dirty", "dust", "stain", "sanitize"] }
];

const containsAny = (text, words) => words.some((word) => text.includes(word));

const confidenceByCategory = (category, text) => {
  const textLower = text.toLowerCase();
  const matchedRule = KEYWORD_RULES.find((rule) => rule.category === category);
  if (!matchedRule) return 0.5;
  const matches = matchedRule.words.filter((word) => textLower.includes(word)).length;
  return Number(Math.min(0.95, 0.45 + matches * 0.12).toFixed(2));
};

const inferSeverity = (text) => {
  const t = text.toLowerCase();
  if (containsAny(t, ["fire", "smoke", "electric shock", "gas leak"])) return "high";
  if (containsAny(t, ["major leak", "flood", "sparks", "burning smell"])) return "high";
  if (containsAny(t, ["not working", "stopped", "leak", "noise"])) return "medium";
  return "low";
};

const adjustChargeBySeverity = (range, severity) => {
  const [min, max] = range;
  if (severity === "high") return [Math.round(min * 1.2), Math.round(max * 1.35)];
  if (severity === "medium") return [min, Math.round(max * 1.15)];
  return [Math.round(min * 0.9), max];
};

const detectCategory = (inputText) => {
  const text = inputText.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (containsAny(text, rule.words)) return rule.category;
  }
  return "General";
};

const formatInrRange = ([min, max]) => `\u20B9${min} - \u20B9${max}`;

const clampRangeToBounds = (range, bounds) => {
  const [minValue, maxValue] = range;
  const [minBound, maxBound] = bounds;
  const clampedMin = Math.max(minBound, Math.min(minValue, maxBound));
  const clampedMax = Math.max(clampedMin, Math.min(maxValue, maxBound));
  return [clampedMin, clampedMax];
};

const buildPricingOptions = (category, text, severity, bounds) => {
  const categoryOptions = ISSUE_PRICE_OPTIONS[category] || ISSUE_PRICE_OPTIONS.General;
  const t = String(text || "").toLowerCase();

  let selected = categoryOptions.filter((option) => {
    if (!option.words || option.words.length === 0) return false;
    return containsAny(t, option.words);
  });

  if (selected.length === 0) {
    selected = categoryOptions.slice(0, 3);
  }

  return selected.slice(0, 4).map((option) => {
    const adjusted = adjustChargeBySeverity(option.range, severity);
    const bounded = clampRangeToBounds(adjusted, bounds);
    return {
      issue: option.issue,
      visiting_charge_range: formatInrRange(bounded)
    };
  });
};

export async function analyzeImage(imagePath) {
  if (!HF_TOKEN) {
    throw new Error("HF_TOKEN is missing in backend/.env");
  }

  try {
    const imageBuffer = await fs.readFile(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: "image/png" });
    const output = await hfClient.imageToText({
      data: imageBlob,
      model: HF_IMAGE_MODEL,
      provider: HF_IMAGE_PROVIDER
    });

    const caption = output?.generated_text || output?.generatedText || "";
    if (!caption) {
      throw new Error("Caption model did not return text.");
    }
    return caption.trim();
  } catch (error) {
    const hfMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Unknown Hugging Face error";
    throw new Error(`Image analysis failed: ${hfMessage}`);
  }
}

export function detectIssue(text) {
  const category = detectCategory(text);
  const severity = inferSeverity(text);
  const [minCharge, maxCharge] = adjustChargeBySeverity(
    VISITING_CHARGE_MAP[category] || VISITING_CHARGE_MAP.General,
    severity
  );
  const chargeBounds = [minCharge, maxCharge];
  const visitingChargeRange = formatInrRange(chargeBounds);
  const provider = PROVIDER_MAP[category] || PROVIDER_MAP.General;
  const pricingOptions = buildPricingOptions(category, text, severity, chargeBounds);

  return {
    category,
    issue: ISSUE_MAP[category] || ISSUE_MAP.General,
    severity,
    confidence: confidenceByCategory(category, text),
    approximation_note:
      "All charges below are approximate pre-inspection estimates. Final price depends on on-site diagnosis, parts, and complexity.",
    visiting_charge_range: visitingChargeRange,
    // Keep legacy key for older frontends.
    price_range: visitingChargeRange,
    pricing_options: pricingOptions,
    provider,
    next_steps: [
      `Book ${provider} through the app`,
      "These options are approximate visit/repair estimates for common cases",
      "Final repair/service cost is confirmed after inspection"
    ]
  };
}
