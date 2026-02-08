"use client";

import { useState } from "react";
import { ExternalLink, FileText, MessageSquare, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface AuditEntry {
  id: string;
  actionType: "qa" | "report";
  hash: string;
  prevHash: string | null;
  solanaTxSignature: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
}

interface HashChainVisualizationProps {
  entries: AuditEntry[];
}

function truncateHash(hash: string, length: number = 8): string {
  if (hash === "genesis") return "genesis";
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

export function HashChainVisualization({
  entries,
}: HashChainVisualizationProps) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Chain connector line */}
          {index < entries.length - 1 && (
            <div className="absolute left-6 top-full w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-purple-500" />
          )}

          <GlassCard className="p-4 hover:border-indigo-400/40 transition-colors">
            <div className="flex items-start justify-between">
              {/* Left side - Entry info */}
              <div className="flex items-start gap-4">
                {/* Chain node */}
                <div
                  className={`p-2 rounded-full ${
                    entry.solanaTxSignature
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "bg-slate-700"
                  }`}
                >
                  {entry.actionType === "qa" ? (
                    <MessageSquare className="w-4 h-4 text-white" />
                  ) : (
                    <FileText className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        entry.actionType === "qa" ? "default" : "secondary"
                      }
                    >
                      {entry.actionType === "qa" ? "Q&A" : "Report"}
                    </Badge>
                    {entry.solanaTxSignature && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Solana Verified
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400">
                      {formatTime(entry.createdAt)}
                    </span>
                  </div>

                  {/* Hash display */}
                  <div className="font-mono text-sm">
                    <span className="text-slate-400">Hash: </span>
                    <span className="text-indigo-400">
                      {truncateHash(entry.hash)}
                    </span>
                    <span className="text-slate-500 mx-2">&larr;</span>
                    <span className="text-slate-500">
                      {truncateHash(entry.prevHash || "genesis")}
                    </span>
                  </div>

                  {/* Expanded content */}
                  {expandedEntry === entry.id && (
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-lg space-y-2">
                      <div>
                        <span className="text-slate-400 text-xs">
                          Full Hash:
                        </span>
                        <p className="font-mono text-xs text-indigo-300 break-all">
                          {entry.hash}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">
                          Previous Hash:
                        </span>
                        <p className="font-mono text-xs text-slate-400 break-all">
                          {entry.prevHash || "genesis"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Payload:</span>
                        <pre className="font-mono text-xs text-slate-300 mt-1 overflow-x-auto">
                          {JSON.stringify(entry.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-2">
                {entry.solanaTxSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${entry.solanaTxSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
                    title="View on Solana Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
                >
                  {expandedEntry === entry.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      ))}

      {entries.length === 0 && (
        <GlassCard className="p-8 text-center">
          <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No audit entries yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Start asking questions or filing reports to build the audit chain
          </p>
        </GlassCard>
      )}
    </div>
  );
}
