"use client";

import * as React from "react";
import { type SoftwareDemo } from "@/lib/demos-store";
import { Badge } from "@/components/ui/Badge";
import { Sparkles } from "lucide-react";

interface DemoTabsProps {
  demos: SoftwareDemo[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DemoTabs({ demos, selectedId, onSelect }: DemoTabsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select A Software Walkthrough:
        </p>
        <span className="text-xs text-primary font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-tech" />
          {demos.length} Products Available
        </span>
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:px-0">
        {demos.map((d) => {
          const isSelected = d.id === selectedId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              className={`group relative flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/80"
              }`}
            >
              <span className="text-2xl drop-shadow-sm">{d.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">
                  {d.name.split("—")[0].trim()}
                </span>
                <span
                  className={`text-[11px] font-medium leading-tight ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {d.category} · {d.duration}
                </span>
              </div>
              {d.featured && (
                <span
                  className={`ml-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary dark:bg-primary/20"
                  }`}
                >
                  Popular
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
