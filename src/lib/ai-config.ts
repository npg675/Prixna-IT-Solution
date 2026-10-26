import fs from "fs";
import path from "path";
import { AIConfig, DEFAULT_AI_CONFIG, AIProvider } from "./ai-types";

export * from "./ai-types";

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "ai-config.json");

export function getAIConfig(): AIConfig {
  let fileData: Partial<AIConfig> = {};
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      fileData = JSON.parse(raw);
    }
  } catch (err) {
    console.error("[ai-config] Failed to read config file:", err);
  }

  // Detect environment variables
  const envGroq = (process.env.GROQ_API_KEY || "").trim();
  const envOpenAI = (process.env.OPENAI_API_KEY || "").trim();
  const envGemini = (process.env.GEMINI_API_KEY || "").trim();
  const envKey = (process.env.AI_API_KEY || envGroq || envOpenAI || envGemini || "").trim();

  let envProvider: AIProvider = (process.env.AI_PROVIDER as AIProvider) || "local";
  if (envProvider === "local") {
    if (envGroq) envProvider = "groq";
    else if (envOpenAI) envProvider = "openai";
    else if (envGemini) envProvider = "gemini";
  }

  const effectiveProvider: AIProvider =
    fileData.provider && fileData.provider !== "local"
      ? fileData.provider
      : (envKey ? envProvider : (fileData.provider || "local"));

  // Effective API key from file or environment
  let effectiveKey = (fileData.apiKey || "").trim();
  if (!effectiveKey) {
    if (effectiveProvider === "groq") effectiveKey = envGroq || envKey;
    else if (effectiveProvider === "openai") effectiveKey = envOpenAI || envKey;
    else if (effectiveProvider === "gemini") effectiveKey = envGemini || envKey;
    else effectiveKey = envKey;
  }

  // Model selection
  const defaultModel =
    effectiveProvider === "groq"
      ? "llama-3.3-70b-versatile"
      : effectiveProvider === "gemini"
      ? "gemini-1.5-flash"
      : "gpt-4o-mini";

  const effectiveModel =
    fileData.model && fileData.model !== "builtin-rules"
      ? fileData.model
      : process.env.AI_MODEL || defaultModel;

  const effectiveEnabled =
    fileData.enabled !== undefined
      ? Boolean(fileData.enabled && effectiveKey)
      : Boolean(effectiveKey && effectiveProvider !== "local");

  return {
    ...DEFAULT_AI_CONFIG,
    ...fileData,
    enabled: effectiveEnabled,
    provider: effectiveProvider,
    apiKey: effectiveKey,
    model: effectiveModel,
    updatedAt: fileData.updatedAt || new Date().toISOString(),
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
