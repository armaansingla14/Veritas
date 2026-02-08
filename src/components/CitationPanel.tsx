"use client";

import { ExternalLink, FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RAGSource } from "@/lib/rag";

interface CitationPanelProps {
  sources: RAGSource[];
  confidence: "high" | "medium" | "low" | "none";
}

const confidenceConfig = {
  high: {
    label: "High Confidence",
    variant: "success" as const,
    description: "Answer strongly supported by sources",
  },
  medium: {
    label: "Medium Confidence",
    variant: "warning" as const,
    description: "Answer partially supported by sources",
  },
  low: {
    label: "Low Confidence",
    variant: "destructive" as const,
    description: "Limited source coverage",
  },
  none: {
    label: "No Sources",
    variant: "secondary" as const,
    description: "No relevant sources found",
  },
};

export function CitationPanel({ sources, confidence }: CitationPanelProps) {
  const config = confidenceConfig[confidence];

  return (
    <Card className="h-fit bg-slate-800/60 border-indigo-500/20 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <FileText className="w-5 h-5" />
            Sources
          </CardTitle>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        <p className="text-sm text-slate-400">{config.description}</p>
      </CardHeader>
      <CardContent>
        {sources.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Info className="w-4 h-4" />
            <span>No sources were used for this answer.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium flex items-center justify-center">
                        {source.id}
                      </span>
                      <h4 className="font-medium text-sm truncate text-white">
                        {source.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {source.excerpt}
                    </p>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1 rounded hover:bg-slate-600 transition-colors"
                    aria-label={`Open source: ${source.title}`}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Relevance:
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-600 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${source.similarity * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {Math.round(source.similarity * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-amber-300">
            <strong>Disclaimer:</strong> This information is provided for general
            guidance only. Please verify with official City sources for legal or
            time-sensitive matters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
