"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrustMetrics } from "@/components/TrustMetrics";
import { HashChainVisualization } from "@/components/HashChainVisualization";

interface AuditEntry {
  id: string;
  actionType: "qa" | "report";
  hash: string;
  prevHash: string | null;
  solanaTxSignature: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
}

interface AuditStats {
  totalEntries: number;
  anchoredCount: number;
  anchoredPercentage: number;
  lastAnchorTime: string | null;
  chainValid: boolean;
  entries: AuditEntry[];
}

interface VerifyResult {
  found: boolean;
  hashValid?: boolean;
  entry?: AuditEntry;
  isAnchored?: boolean;
  solanaExplorerUrl?: string | null;
  message?: string;
}

export default function TrustPage() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchHash, setSearchHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/audit/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching audit stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleVerify = async () => {
    if (!searchHash.trim()) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      const response = await fetch("/api/audit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: searchHash.trim() }),
      });

      if (!response.ok) throw new Error("Verification failed");
      const result = await response.json();
      setVerifyResult(result);
    } catch (error) {
      console.error("Error verifying hash:", error);
      setVerifyResult({
        found: false,
        message: "Verification failed. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-4s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-indigo-400" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Trust Dashboard
                  </h1>
                  <p className="text-sm text-slate-400">
                    Verifiable audit trail with blockchain anchoring
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <TrustMetrics
              totalEntries={stats.totalEntries}
              anchoredCount={stats.anchoredCount}
              anchoredPercentage={stats.anchoredPercentage}
              lastAnchorTime={stats.lastAnchorTime}
              chainValid={stats.chainValid}
            />

            {/* Verify Hash Section */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                Verify Hash
              </h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter audit hash to verify..."
                  value={searchHash}
                  onChange={(e) => setSearchHash(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="flex-1 bg-slate-800/50 border-slate-600"
                />
                <Button
                  onClick={handleVerify}
                  disabled={verifying || !searchHash.trim()}
                  variant="gradient"
                >
                  {verifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              {/* Verification Result */}
              {verifyResult && (
                <div className="mt-4">
                  {verifyResult.found ? (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        {verifyResult.hashValid ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">
                              Hash Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-medium">
                              Hash Invalid
                            </span>
                          </>
                        )}
                        {verifyResult.isAnchored && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
                            <Shield className="w-3 h-3 mr-1" />
                            Solana Anchored
                          </Badge>
                        )}
                      </div>
                      {verifyResult.entry && (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Type: </span>
                            <span className="text-white">
                              {verifyResult.entry.actionType === "qa"
                                ? "Question & Answer"
                                : "Report Filed"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Created: </span>
                            <span className="text-white">
                              {new Date(
                                verifyResult.entry.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>
                          {verifyResult.solanaExplorerUrl && (
                            <a
                              href={verifyResult.solanaExplorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 mt-2"
                            >
                              View on Solana Explorer
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400">
                        {verifyResult.message || "Hash not found in audit log"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Hash Chain Visualization */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Audit Chain Timeline
                <span className="text-sm font-normal text-slate-400">
                  (Recent {stats.entries.length} entries)
                </span>
              </h2>
              <HashChainVisualization entries={stats.entries} />
            </div>
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-slate-400">Failed to load audit data</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              Try Again
            </Button>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
