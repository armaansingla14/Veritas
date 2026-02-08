"use client";

import { useState } from "react";
import {
  Construction,
  Paintbrush,
  Lightbulb,
  Footprints,
  Trash2,
  HelpCircle,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface DetectedIssue {
  type: "pothole" | "graffiti" | "streetlight" | "sidewalk" | "litter" | "other";
  confidence: number;
  description: string;
  severity: "low" | "medium" | "high";
  suggestedTitle: string;
}

interface DetectedIssueCardProps {
  issue: DetectedIssue;
  index: number;
  onConfirm: (issue: DetectedIssue) => Promise<void>;
  isConfirmed?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  pothole: <Construction className="w-5 h-5" />,
  graffiti: <Paintbrush className="w-5 h-5" />,
  streetlight: <Lightbulb className="w-5 h-5" />,
  sidewalk: <Footprints className="w-5 h-5" />,
  litter: <Trash2 className="w-5 h-5" />,
  other: <HelpCircle className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  pothole: "Pothole",
  graffiti: "Graffiti",
  streetlight: "Streetlight",
  sidewalk: "Sidewalk",
  litter: "Litter",
  other: "Other Issue",
};

const typeColors: Record<string, string> = {
  pothole: "bg-orange-500",
  graffiti: "bg-pink-500",
  streetlight: "bg-yellow-500",
  sidewalk: "bg-green-500",
  litter: "bg-amber-600",
  other: "bg-gray-500",
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  medium: { label: "Medium", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  high: { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export function DetectedIssueCard({
  issue,
  index,
  onConfirm,
  isConfirmed = false,
}: DetectedIssueCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(isConfirmed);

  const handleConfirm = async () => {
    if (confirmed || isLoading) return;
    setIsLoading(true);
    try {
      await onConfirm(issue);
      setConfirmed(true);
    } catch (error) {
      console.error("Error confirming issue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const severity = severityConfig[issue.severity] || severityConfig.medium;
  const confidencePercent = Math.round(issue.confidence * 100);

  return (
    <GlassCard
      className={`p-4 transition-all ${
        confirmed ? "border-emerald-500/50 bg-emerald-900/10" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Issue icon */}
        <div
          className={`w-12 h-12 rounded-xl ${typeColors[issue.type]} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}
        >
          {typeIcons[issue.type] || typeIcons.other}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-white">
                {issue.suggestedTitle}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[issue.type]}
                </Badge>
                <Badge className={`text-xs ${severity.color}`}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {severity.label}
                </Badge>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-medium text-indigo-400">
                {confidencePercent}%
              </span>
              <p className="text-xs text-slate-500">confidence</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-3">{issue.description}</p>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={confirmed || isLoading}
            variant={confirmed ? "secondary" : "gradient"}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Filing Report...
              </>
            ) : confirmed ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Report Filed
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm & Report
              </>
            )}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
