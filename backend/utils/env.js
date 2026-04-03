export const stripWrappingQuotes = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    const isQuotePair = (first === "\"" && last === "\"") || (first === "'" && last === "'");
    if (isQuotePair) return trimmed.slice(1, -1);
  }
  return trimmed;
};

export const pickEnv = (keys) => {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw !== "string") continue;
    const val = stripWrappingQuotes(raw);
    if (val) return val;
  }
  return "";
};
