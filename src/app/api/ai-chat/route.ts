import { NextResponse } from "next/server";
import { getAIConfig } from "@/lib/ai-config";
import { callLLM, ChatMessage } from "@/lib/llm-client";
import { getMemoryCache, setMemoryCache } from "@/lib/ai-memory-cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const lang = body?.lang === "ne" ? "ne" : "en";
    const config = getAIConfig();

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided", reply: null },
        { status: 400 }
      );
    }

    const lastUserMsg = messages[messages.length - 1]?.content || "";

    // 1. FAST MEMORY CACHE CHECK (0ms, 0 API tokens)
    if (lastUserMsg) {
      const cached = getMemoryCache(lastUserMsg, lang);
      if (cached) {
        return NextResponse.json({
          reply: cached.reply,
          provider: "memory-cache",
          model: cached.model,
          cached: true,
          hitCount: cached.hitCount,
          latencyMs: 1,
          fallback: false,
        });
      }
    }

    if (!config.enabled || config.provider === "local" || !config.apiKey) {
      // Local fallback mode: client will use built-in local engine
      return NextResponse.json({
        reply: null,
        provider: "local",
        fallback: true,
      });
    }

    const res = await callLLM(config, messages, lang);

    // 2. AUTO-STORE VERIFIED ANSWER INTO REUSABLE MEMORY CACHE
    if (res.reply && lastUserMsg) {
      setMemoryCache(lastUserMsg, res.reply, lang, res.model, res.provider);
    }

    return NextResponse.json({
      reply: res.reply,
      provider: res.provider,
      model: res.model,
      latencyMs: res.latencyMs,
      cached: false,
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
