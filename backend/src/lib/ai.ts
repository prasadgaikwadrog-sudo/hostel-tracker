const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Furniture",
  "Cleanliness",
  "Internet",
  "Security",
  "Other",
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Plumbing: ["water", "pipe", "leak", "drain", "tap", "flush", "bathroom", "toilet", "shower", "sink", "plumb"],
  Electrical: ["light", "electric", "power", "switch", "socket", "outlet", "fan", "bulb", "wiring", "voltage", "shock"],
  Furniture: ["chair", "table", "bed", "wardrobe", "desk", "shelf", "door", "window", "lock", "broken", "furniture"],
  Cleanliness: ["clean", "dirty", "garbage", "trash", "waste", "smell", "odor", "cockroach", "pest", "rat", "insect", "dust"],
  Internet: ["internet", "wifi", "network", "connection", "slow", "broadband", "router", "signal", "cable"],
  Security: ["security", "guard", "theft", "stolen", "lock", "unsafe", "danger", "cctv", "camera", "suspicious"],
};

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = "Other";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

const URGENCY_KEYWORDS = {
  URGENT: ["emergency", "urgent", "fire", "flood", "electric shock", "dangerous", "injury", "injured", "critical", "immediately", "help"],
  HIGH: ["not working", "broken", "severe", "serious", "bad", "major", "very", "extreme"],
  MEDIUM: ["issue", "problem", "need", "fix", "repair", "trouble", "concern"],
};

export function detectPriority(text: string): "LOW" | "MEDIUM" | "HIGH" | "URGENT" {
  const lower = text.toLowerCase();

  if (URGENCY_KEYWORDS.URGENT.some((kw) => lower.includes(kw))) return "URGENT";
  if (URGENCY_KEYWORDS.HIGH.some((kw) => lower.includes(kw))) return "HIGH";
  if (URGENCY_KEYWORDS.MEDIUM.some((kw) => lower.includes(kw))) return "MEDIUM";
  return "LOW";
}
