import fs from "fs";
import path from "path";
import { AIConfig, DEFAULT_AI_CONFIG, AIProvider } from "./ai-types";

export * from "./ai-types";

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "ai-config.json");

export function getAIConfig(): AIConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const data = JSON.parse(raw);
      return {
        ...DEFAULT_AI_CONFIG,
        ...data,
      };
    }
  } catch (err) {
    console.error("[ai-config] Failed to read config file:", err);
  }

  // Fallback to environment variables if present
  const envProvider = (process.env.AI_PROVIDER as AIProvider) || "local";
  const envKey =
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GROQ_API_KEY ||
    "";
  const envModel =
    process.env.AI_MODEL || (envProvider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");

  return {
    ...DEFAULT_AI_CONFIG,
    enabled: Boolean(envKey && envProvider !== "local"),
    provider: envProvider,
    apiKey: envKey,
    model: envModel,
    updatedAt: new Date().toISOString(),
  };
}

export function saveAIConfig(config: Partial<AIConfig>): AIConfig {
  const current = getAIConfig();
  const dir = path.dirname(CONFIG_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Don't overwrite existing API key if incoming is masked or empty string
  let keyToSave = config.apiKey !== undefined ? config.apiKey.trim() : current.apiKey;
  if (keyToSave.includes("•••") || (keyToSave === "" && current.apiKey)) {
    keyToSave = current.apiKey;
  }

  const merged: AIConfig = {
    ...current,
    ...config,
    apiKey: keyToSave,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}
