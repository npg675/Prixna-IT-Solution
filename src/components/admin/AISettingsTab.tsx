"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai-types";
import { ExcelCatalogManager } from "./ExcelCatalogManager";

interface ConfigState {
  enabled: boolean;
  provider: "local" | "openai" | "gemini" | "groq";
  apiKey: string;
  apiKeyMasked?: string;
  hasKey?: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  fallbackToLocal: boolean;
  voiceGender: "female" | "male";
  voicePitch: number;
  voiceRate: number;
}

const PROVIDER_MODELS: Record<string, string[]> = {
  local: ["builtin-rules"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
  gemini: ["gemini-1.5-flash", "gemini-1.5-pro"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
};

export function AISettingsTab() {
  const [config, setConfig] = useState<ConfigState>({
    enabled: false,
    provider: "local",
    apiKey: "",
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    fallbackToLocal: true,
    voiceGender: "female",
    voicePitch: 1.0,
    voiceRate: 1.0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; reply?: string; latency?: number; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/ai-settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setConfig({
            enabled: data.enabled ?? false,
            provider: data.provider || "local",
            apiKey: data.apiKeyMasked || "",
            apiKeyMasked: data.apiKeyMasked,
            hasKey: data.hasKey ?? false,
            model: data.model || "gpt-4o-mini",
            temperature: data.temperature ?? 0.7,
            maxTokens: data.maxTokens ?? 500,
            systemPrompt: data.systemPrompt || DEFAULT_SYSTEM_PROMPT,
            fallbackToLocal: data.fallbackToLocal !== false,
            voiceGender: data.voiceGender === "male" ? "male" : "female",
            voicePitch: typeof data.voicePitch === "number" ? data.voicePitch : 1.0,
            voiceRate: typeof data.voiceRate === "number" ? data.voiceRate : 1.0,
          });
        }
      })
      .catch((err) => console.error("Failed to load AI settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleProviderChange = (provider: ConfigState["provider"]) => {
    const defaultModel = PROVIDER_MODELS[provider]?.[0] || "gpt-4o-mini";
    setConfig((prev) => ({
      ...prev,
      provider,
      model: defaultModel,
      enabled: provider !== "local",
    }));
    setTestResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: "success", text: "AI Assistant & Voice settings saved successfully! ✅" });
        if (data.config) {
          setConfig((prev) => ({
            ...prev,
            ...data.config,
            apiKey: data.config.apiKeyMasked || prev.apiKey,
          }));
        }
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: "error", text: `Error saving: ${msg}` });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          temperature: config.temperature,
          systemPrompt: config.systemPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          reply: data.reply,
          latency: data.latencyMs,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || "Connection test failed",
          latency: data.latencyMs,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        error: `Network error: ${msg}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const playVoiceSample = (lang: "ne" | "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const text =
      lang === "ne"
        ? "नमस्ते! प्रिक्स्ना आईटी सोलुसनमा स्वागत छ। म तपाईंलाई के सहयोग गरूँ?"
        : "Hello! Welcome to Prixna IT Solution. How can I help your business today?";

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ne" ? "ne-NP" : "en-US";
    u.pitch = config.voicePitch;
    u.rate = config.voiceRate;
    u.volume = 0.95;

    const vs = window.speechSynthesis.getVoices() || [];
    const isMale = config.voiceGender === "male";
    const targetRegex = isMale
      ? /male|man|david|hemant|guy|george|mark|ravi|ajay/i
      : /female|woman|kalpana|zira|jenny|susan|aria|samantha|swara|priya/i;

    let v = null;
    const langKey = lang === "ne" ? "hi" : "en";
    for (let i = 0; i < vs.length; i++) {
      const vl = (vs[i].lang || "").toLowerCase();
      if (
        (vl.indexOf(lang === "ne" ? "ne" : "en") === 0 || vl.indexOf(langKey) === 0) &&
        targetRegex.test(vs[i].name || "")
      ) {
        v = vs[i];
        break;
      }
    }
    if (!v) {
      for (let i = 0; i < vs.length; i++) {
        const vl = (vs[i].lang || "").toLowerCase();
        if (vl.indexOf(lang === "ne" ? "ne" : "en") === 0 || vl.indexOf(langKey) === 0) {
          v = vs[i];
          break;
        }
      }
    }
    if (v) {
      u.voice = v;
      if (lang === "ne" && (v.lang || "").toLowerCase().indexOf("hi") === 0) u.lang = v.lang;
    }
    window.speechSynthesis.speak(u);
  };

  const stopVoiceSample = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const resetPrompt = () => {
    if (confirm("Reset system instructions to the default Prixna IT Solution prompt?")) {
      setConfig((prev) => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }));
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading AI configuration…</div>;
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* Header Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>🤖</span> Prixna AI Assistant & Voice Center
              </CardTitle>
              <CardDescription className="mt-1">
                Configure your conversational AI provider, API keys, intelligence model, voice tone/gender, and customer prompt.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.enabled && config.provider !== "local" ? "default" : "secondary"} className="text-xs">
                {config.provider === "local" || !config.enabled
                  ? "🔵 Free Local Engine"
                  : `🟢 Active: ${config.provider.toUpperCase()} (${config.model})`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/40 p-3">
              <span className="text-xs font-semibold text-muted-foreground">Active Brain</span>
              <p className="mt-1 text-sm font-bold capitalize">
                {config.provider === "local" ? "Free Built-in (Local)" : config.provider}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <span className="text-xs font-semibold text-muted-foreground">Voice Sound Profile</span>
              <p className="mt-1 text-sm font-bold capitalize">
                {config.voiceGender === "male" ? "👨 Male Voice" : "👩 Female Voice"}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <span className="text-xs font-semibold text-muted-foreground">Voice Sound Tone</span>
              <p className="mt-1 text-sm font-bold">
                {config.voicePitch < 0.95 ? "Deep Tone" : config.voicePitch > 1.08 ? "Bright Tone" : "Natural Tone"} ({config.voicePitch}x)
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <span className="text-xs font-semibold text-muted-foreground">Downtime Protection</span>
              <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {config.fallbackToLocal ? "✅ Auto Local Fallback" : "⚠️ Strict External Only"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Voice Sound Tone & Gender Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🎙️</span> Voice Assistant Sound Tone & Gender (100% Free)
              </CardTitle>
              <CardDescription>
                Customize male/female voice selection, deep or warm sound tone pitch, and speech speed with zero API cost.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs">
              ₹0 Cost · Native Web Speech
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Gender Selector */}
          <div className="grid gap-2">
            <Label htmlFor="voice-gender">Voice Gender</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, voiceGender: "female", voicePitch: 1.05 })}
                className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all ${
                  config.voiceGender === "female"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-input bg-card hover:bg-muted/50"
                }`}
              >
                <span className="text-2xl">👩</span>
                <div>
                  <div className="font-semibold text-sm">Female Voice (Friendly & Welcoming)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Recommended for customer support. Uses Kalpana / Zira / Swara with warm inflection.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, voiceGender: "male", voicePitch: 0.9 })}
                className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all ${
                  config.voiceGender === "male"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-input bg-card hover:bg-muted/50"
                }`}
              >
                <span className="text-2xl">👨</span>
                <div>
                  <div className="font-semibold text-sm">Male Voice (Professional & Deep)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Authoritative & clear tone. Uses Hemant / David / Ravi with confident resonance.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sound Tone (Pitch) & Speech Speed (Rate) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-pitch">Sound Tone (Pitch: {config.voicePitch.toFixed(2)})</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, voicePitch: 0.85 })}
                    className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
                  >
                    Deep (0.85)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, voicePitch: 1.0 })}
                    className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
                  >
                    Natural (1.0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, voicePitch: 1.15 })}
                    className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
                  >
                    Bright (1.15)
                  </button>
                </div>
              </div>
              <Input
                id="voice-pitch"
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={config.voicePitch}
                onChange={(e) => setConfig({ ...config, voicePitch: parseFloat(e.target.value) || 1.0 })}
              />
              <span className="text-xs text-muted-foreground">
                Lower pitch (0.85) = deeper masculine resonance · Higher pitch (1.15) = youthful, clear tone
              </span>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-rate">Speech Speed (Rate: {config.voiceRate.toFixed(2)}x)</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, voiceRate: 0.9 })}
                    className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
                  >
                    Relaxed (0.9x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, voiceRate: 1.0 })}
                    className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
                  >
                    Standard (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, voiceRate: 1.1 })}
                    className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
                  >
                    Brisk (1.1x)
                  </button>
                </div>
              </div>
              <Input
                id="voice-rate"
                type="range"
                min="0.75"
                max="1.3"
                step="0.05"
                value={config.voiceRate}
                onChange={(e) => setConfig({ ...config, voiceRate: parseFloat(e.target.value) || 1.0 })}
              />
              <span className="text-xs text-muted-foreground">
                0.90x gives optimal clarity for Nepali and English phone/customer conversations
              </span>
            </div>
          </div>

          {/* Interactive Voice Testing Bar */}
          <div className="rounded-lg border bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>🔊</span> Listen to Live Voice Preview:
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audition the current voice sound tone and gender directly in your browser.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => playVoiceSample("ne")}>
                ▶ Test Nepali (नेपाली)
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => playVoiceSample("en")}>
                ▶ Test English (EN)
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={stopVoiceSample} title="Stop voice playback">
                ⏹ Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Excel Business Knowledge & Pricing Brain */}
      <ExcelCatalogManager />

      {/* Main LLM API Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔑 AI Provider & API Credentials</CardTitle>
          <CardDescription>
            Connect an external Large Language Model for advanced conversational reasoning, or keep the free built-in engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Provider Selection */}
          <div className="grid gap-2">
            <Label htmlFor="ai-provider">AI Brain Provider</Label>
            <Select value={config.provider} onValueChange={(v) => handleProviderChange(v as ConfigState["provider"])}>
              <SelectTrigger id="ai-provider" className="w-full">
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">🔵 Free Built-in Engine (₹0 cost, no API key needed)</SelectItem>
                <SelectItem value="openai">🟢 OpenAI (ChatGPT — GPT-4o-mini / GPT-4o)</SelectItem>
                <SelectItem value="gemini">✨ Google Gemini (Gemini 1.5 Flash / Pro)</SelectItem>
                <SelectItem value="groq">⚡ Groq (Llama-3.3 70B — Ultra fast inference)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {config.provider === "local" &&
                "Runs completely client-side in the customer's browser. Zero API key, zero cost, instant answers for services, CCTV, repair, and pricing."}
              {config.provider === "openai" &&
                "Get an API key from platform.openai.com. Recommended model: gpt-4o-mini (high speed, extremely low token cost)."}
              {config.provider === "gemini" &&
                "Get an API key from aistudio.google.com. Has a generous free tier and handles Nepali/Devanagari text smoothly."}
              {config.provider === "groq" &&
                "Get an API key from console.groq.com. Powered by ultra-fast Llama-3.3-70B models."}
            </p>
          </div>

          {config.provider !== "local" && (
            <>
              {/* API Key Input */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-key">API Key</Label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {showKey ? "Hide key" : "Show key"}
                  </button>
                </div>
                <Input
                  id="ai-key"
                  type={showKey ? "text" : "password"}
                  placeholder={
                    config.provider === "openai"
                      ? "sk-proj-..."
                      : config.provider === "gemini"
                      ? "AIzaSy..."
                      : "gsk_..."
                  }
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {config.hasKey && !config.apiKey.includes("•••")
                      ? "✅ API Key configured on server"
                      : "Keys are stored securely on the server and never exposed to website visitors."}
                  </span>
                  {config.provider === "openai" && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Get OpenAI Key ↗
                    </a>
                  )}
                  {config.provider === "gemini" && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Get Gemini Key (Free tier available) ↗
                    </a>
                  )}
                  {config.provider === "groq" && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Get Groq Key ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Model Selection */}
              <div className="grid gap-2">
                <Label htmlFor="ai-model">Model</Label>
                <div className="flex flex-wrap gap-2">
                  {(PROVIDER_MODELS[config.provider] || []).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setConfig({ ...config, model: m })}
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                        config.model === m
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Input
                  id="ai-model"
                  placeholder="Or enter custom model ID…"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Advanced Parameters */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="ai-temp">Temperature ({config.temperature})</Label>
                  <Input
                    id="ai-temp"
                    type="number"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) || 0.7 })}
                  />
                  <span className="text-xs text-muted-foreground">0.2 = strictly accurate · 0.7 = natural conversation</span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ai-tokens">Max Tokens</Label>
                  <Input
                    id="ai-tokens"
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value, 10) || 500 })}
                  />
                  <span className="text-xs text-muted-foreground">500 tokens is ideal for concise voice and text responses</span>
                </div>
              </div>

              {/* Fallback Checkbox */}
              <div className="flex items-start space-x-2 rounded-lg border bg-muted/20 p-3">
                <Checkbox
                  id="ai-fallback"
                  checked={config.fallbackToLocal}
                  onCheckedChange={(c) => setConfig({ ...config, fallbackToLocal: Boolean(c) })}
                />
                <div className="grid gap-1 leading-none">
                  <label htmlFor="ai-fallback" className="text-sm font-semibold cursor-pointer">
                    Automatic Fallback to Built-in Engine
                  </label>
                  <p className="text-xs text-muted-foreground">
                    If your API key runs out of balance, hits a rate limit, or goes offline, customers will continue receiving instant answers from the free local engine with zero downtime.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* System Instructions / Prompt */}
          <div className="grid gap-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-prompt">System Instructions & Business Knowledge</Label>
              <button
                type="button"
                onClick={resetPrompt}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Reset to default prompt
              </button>
            </div>
            <Textarea
              id="ai-prompt"
              rows={8}
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              className="font-mono text-xs leading-relaxed"
              placeholder="Instructions provided to the AI on how to represent Prixna IT Solution, services, prices, and tone…"
            />
            <p className="text-xs text-muted-foreground">
              Define your business hours, services, contact details, and bilingual tone. The assistant uses these instructions for every customer query.
            </p>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                statusMsg.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                testResult.success
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{testResult.success ? "✅ Connection Successful!" : "❌ Connection Failed"}</span>
                {testResult.latency !== undefined && <span className="text-xs opacity-75">{testResult.latency} ms</span>}
              </div>
              <p className="mt-1 text-xs">
                {testResult.success ? (
                  <span><b>AI Response:</b> “{testResult.reply}”</span>
                ) : (
                  <span><b>Error:</b> {testResult.error}</span>
                )}
              </p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing || (config.provider !== "local" && !config.apiKey)}
            >
              {testing ? "Testing Connection…" : "⚡ Test Connection"}
            </Button>

            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "💾 Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
