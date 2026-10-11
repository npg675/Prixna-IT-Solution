import { AIConfig } from "./ai-config";
import { getExcelCatalog } from "./ai-catalog";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  reply: string | null;
  provider: string;
  model: string;
  latencyMs?: number;
  error?: string;
}

export async function callLLM(
  config: AIConfig,
  messages: ChatMessage[],
  lang?: string
): Promise<LLMResponse> {
  const startTime = Date.now();

  if (!config.enabled || config.provider === "local" || !config.apiKey) {
    return {
      reply: null,
      provider: "local",
      model: "builtin-engine",
      latencyMs: 0,
    };
  }

  // Ensure system prompt is present with active language directive
  let basePrompt = config.systemPrompt || "";

  // Inject live company catalog from uploaded Excel file if present
  try {
    const catalog = getExcelCatalog();
    if (catalog && catalog.items && catalog.items.length > 0) {
      basePrompt += "\n\n" + catalog.summaryText;
    }
  } catch (e) {
    console.warn("[llm-client] Excel catalog injection skipped:", e);
  }

  if (lang === "ne") {
    basePrompt += "\n\nCRITICAL LANGUAGE INSTRUCTION: The user is in NEPALI (नेपाली) mode. You MUST reply ONLY in Nepali language using Devanagari script (e.g. नमस्ते 🙏 ...). Be respectful, polite, and concise. Do NOT reply in English.";
  } else if (lang === "en") {
    basePrompt += "\n\nCRITICAL LANGUAGE INSTRUCTION: The user is in ENGLISH mode. Reply in clear, professional English.";
  }

  const fullMessages: ChatMessage[] = [];
  if (basePrompt) {
    fullMessages.push({ role: "system", content: basePrompt });
  }
  for (const m of messages) {
    if (m.role === "system") continue;
    fullMessages.push({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    });
  }

  try {
    if (config.provider === "openai" || config.provider === "groq") {
      const endpoint =
        config.provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: config.model || (config.provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
          messages: fullMessages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 1000,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || `API error (${res.status})`;
        console.warn(`[${config.provider}] Error:`, errMsg);
        return {
          reply: null,
          provider: config.provider,
          model: config.model,
          latencyMs: Date.now() - startTime,
          error: errMsg,
        };
      }

      const reply = data?.choices?.[0]?.message?.content?.trim() || null;
      return {
        reply,
        provider: config.provider,
        model: config.model,
        latencyMs: Date.now() - startTime,
      };
    }

    if (config.provider === "gemini") {
      const model = config.model || "gemini-1.5-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        config.apiKey.trim()
      )}`;

      // Format for Gemini API
      const contents = [];
      // Combine system prompt and user messages
      let promptPrefix = "";
      if (basePrompt) {
        promptPrefix = `[System Instructions]: ${basePrompt}\n\n`;
      }

      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        const isLast = i === messages.length - 1;
        const text = isLast && promptPrefix ? promptPrefix + m.content : m.content;
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text }],
        });
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens ?? 1000,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || `Gemini API error (${res.status})`;
        console.warn("[gemini] Error:", errMsg);
        return {
          reply: null,
          provider: "gemini",
          model,
          latencyMs: Date.now() - startTime,
          error: errMsg,
        };
      }

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      return {
        reply,
        provider: "gemini",
        model,
        latencyMs: Date.now() - startTime,
      };
    }

    return {
      reply: null,
      provider: config.provider,
      model: config.model,
      latencyMs: Date.now() - startTime,
      error: `Unsupported provider: ${config.provider}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[llm-client] Connection error:`, message);
    return {
      reply: null,
      provider: config.provider,
      model: config.model,
      latencyMs: Date.now() - startTime,
      error: message,
    };
  }
}
