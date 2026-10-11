import { NextResponse } from "next/server";
import { getAIConfig } from "@/lib/ai-config";
import { callLLM, ChatMessage } from "@/lib/llm-client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const lang = body?.lang === "ne" ? "ne" : "en";
    const config = getAIConfig();

    if (!config.enabled || config.provider === "local" || !config.apiKey) {
      // Local fallback mode: client will use built-in local engine
      return NextResponse.json({
        reply: null,
        provider: "local",
        fallback: true,
      });
    }

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided", reply: null },
        { status: 400 }
      );
    }

    const res = await callLLM(config, messages, lang);

    return NextResponse.json({
      reply: res.reply,
      provider: res.provider,
      model: res.model,
      latencyMs: res.latencyMs,
      fallback: !res.reply && config.fallbackToLocal,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai-chat] Error:", message);
    return NextResponse.json(
      { reply: null, fallback: true, error: message },
      { status: 200 } // Return 200 with reply: null so widget seamlessly falls back without console errors
    );
  }
}
