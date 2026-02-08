"use client";

import { Shield, Link, Clock, CheckCircle, XCircle, Activity } from "lucide-react";
import { GlassCard } from "./ui/card";

interface TrustMetricsProps {
  totalEntries: number;
  anchoredCount: number;
  anchoredPercentage: number;
  lastAnchorTime: string | null;
  chainValid: boolean;
}

export function TrustMetrics({
  totalEntries,
  anchoredCount,
  anchoredPercentage,
  lastAnchorTime,
  chainValid,
}: TrustMetricsProps) {
  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const seconds = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000
    );
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Chain Status */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              chainValid
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {chainValid ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm text-slate-400">Hash Chain</p>
            <p
              className={`text-xl font-bold ${
                chainValid ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {chainValid ? "VERIFIED" : "BROKEN"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Total Entries */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Audit Entries</p>
            <p className="text-xl font-bold text-white">
              {totalEntries.toLocaleString()}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Blockchain Anchored */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Blockchain Anchored</p>
            <p className="text-xl font-bold text-white">
              {anchoredCount}/{totalEntries}{" "}
              <span className="text-sm text-slate-400">
                ({anchoredPercentage}%)
              </span>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Last Anchor */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Last Anchor</p>
            <p className="text-xl font-bold text-white">
              {formatTimeAgo(lastAnchorTime)}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
