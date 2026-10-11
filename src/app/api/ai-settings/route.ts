import { NextResponse } from "next/server";
import { getAIConfig, maskApiKey, saveAIConfig, AIConfig } from "@/lib/ai-config";
import { callLLM } from "@/lib/llm-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getAIConfig();
    return NextResponse.json({
      ...config,
      apiKeyMasked: maskApiKey(config.apiKey),
      hasKey: Boolean(config.apiKey && config.apiKey.length > 5),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Handle test connection action
    if (body.action === "test") {
      const current = getAIConfig();
      const testConfig: AIConfig = {
        ...current,
        provider: body.provider || current.provider,
        apiKey:
          body.apiKey && !body.apiKey.includes("•••")
            ? body.apiKey.trim()
            : current.apiKey,
        model: body.model || current.model,
        temperature: body.temperature ?? current.temperature,
        maxTokens: body.maxTokens ?? 150,
        systemPrompt: body.systemPrompt ?? current.systemPrompt,
        enabled: true,
      };

      if (!testConfig.apiKey && testConfig.provider !== "local") {
        return NextResponse.json({
          success: false,
          error: "API key is required to test the connection.",
        });
      }

      if (testConfig.provider === "local") {
        return NextResponse.json({
          success: true,
          reply: "Local built-in engine is active and ready (no external API needed).",
          provider: "local",
          model: "builtin-rules",
          latencyMs: 1,
        });
      }

      const res = await callLLM(testConfig, [
        {
          role: "user",
          content:
            "Hello! Please respond with a short 1-line confirmation in Nepali and English confirming that Prixna AI connection is successful.",
        },
      ]);

      if (res.error || !res.reply) {
        return NextResponse.json({
          success: false,
          error: res.error || "No response received from provider",
          latencyMs: res.latencyMs,
          provider: res.provider,
          model: res.model,
        });
      }

      return NextResponse.json({
        success: true,
        reply: res.reply,
        latencyMs: res.latencyMs,
        provider: res.provider,
        model: res.model,
      });
    }

    // Handle saving settings
    const updated = saveAIConfig({
      enabled: Boolean(body.enabled),
      provider: body.provider,
      apiKey: body.apiKey,
      model: body.model,
      temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
      maxTokens: typeof body.maxTokens === "number" ? body.maxTokens : 500,
      systemPrompt: body.systemPrompt,
      fallbackToLocal: body.fallbackToLocal !== false,
      voiceGender: body.voiceGender === "male" ? "male" : "female",
      voicePitch: typeof body.voicePitch === "number" ? body.voicePitch : 1.0,
      voiceRate: typeof body.voiceRate === "number" ? body.voiceRate : 1.0,
    });

    return NextResponse.json({
      success: true,
      config: {
        ...updated,
        apiKeyMasked: maskApiKey(updated.apiKey),
        hasKey: Boolean(updated.apiKey && updated.apiKey.length > 5),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai-settings] Error:", message);
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
