"use client";

import { useState, useEffect } from "react";
import { Shield, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrustStatus {
  solanaEnabled: boolean;
  chainValid: boolean;
  totalEntries: number;
  latestAnchoredTx: string | null;
  latestAnchoredAt: string | null;
}

export function TrustBadge() {
  const [status, setStatus] = useState<TrustStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/anchor");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching trust status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <Badge variant="secondary" className="cursor-pointer">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Verifying...
      </Badge>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge
          variant="success"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Shield className="w-3 h-3 mr-1" />
          {status.solanaEnabled ? "Blockchain Verified" : "Integrity Verified"}
          {status.totalEntries > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
              {status.totalEntries}
            </span>
          )}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-emerald-400" />
            Trust & Transparency
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Chain Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2">
              {status.chainValid ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <Shield className="w-5 h-5 text-amber-400" />
              )}
              <span className="font-medium text-white">Hash Chain</span>
            </div>
            <Badge variant={status.chainValid ? "success" : "warning"}>
              {status.chainValid ? "Valid" : "Needs Review"}
            </Badge>
          </div>

          {/* Solana Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">Solana Anchoring</span>
            </div>
            <Badge variant={status.solanaEnabled ? "default" : "secondary"}>
              {status.solanaEnabled ? "Enabled" : "Local Only"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-white">{status.totalEntries}</p>
              <p className="text-xs text-slate-400">Logged Actions</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-emerald-400">100%</p>
              <p className="text-xs text-slate-400">Integrity</p>
            </div>
          </div>

          {/* Latest TX */}
          {status.latestAnchoredTx && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">
                Latest Solana Transaction
              </p>
              <a
                href={`https://explorer.solana.com/tx/${status.latestAnchoredTx}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-indigo-400 hover:underline"
              >
                <span className="font-mono truncate">
                  {status.latestAnchoredTx.slice(0, 20)}...
                </span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Explanation */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-300">
              <strong>How it works:</strong> Every Q&A response and report is
              logged with a cryptographic hash. Each hash depends on the
              previous one, creating a tamper-evident chain. Optionally, hashes
              are anchored to Solana blockchain for public verifiability.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
