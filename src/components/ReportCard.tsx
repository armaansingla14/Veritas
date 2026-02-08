"use client";

import {
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader,
  Eye,
  Car,
  Volume2,
  Construction,
  Lightbulb,
  Footprints,
  Paintbrush,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Report } from "../../drizzle/schema";

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
  isSelected?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  pothole: <Construction className="w-5 h-5" />,
  noise: <Volume2 className="w-5 h-5" />,
  parking: <Car className="w-5 h-5" />,
  graffiti: <Paintbrush className="w-5 h-5" />,
  streetlight: <Lightbulb className="w-5 h-5" />,
  sidewalk: <Footprints className="w-5 h-5" />,
  other: <HelpCircle className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  pothole: "Pothole",
  noise: "Noise",
  parking: "Parking",
  graffiti: "Graffiti",
  streetlight: "Streetlight",
  sidewalk: "Sidewalk",
  other: "Other",
};

const typeColors: Record<string, string> = {
  pothole: "bg-orange-500",
  noise: "bg-purple-500",
  parking: "bg-blue-500",
  graffiti: "bg-pink-500",
  streetlight: "bg-yellow-500",
  sidewalk: "bg-green-500",
  other: "bg-gray-500",
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning"; icon: React.ReactNode }
> = {
  new: {
    label: "New",
    variant: "default",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  acknowledged: {
    label: "Acknowledged",
    variant: "secondary",
    icon: <Eye className="w-3 h-3" />,
  },
  in_progress: {
    label: "In Progress",
    variant: "warning",
    icon: <Loader className="w-3 h-3" />,
  },
  resolved: {
    label: "Resolved",
    variant: "success",
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-green-400" },
  medium: { label: "Medium", color: "text-amber-400" },
  high: { label: "High", color: "text-red-400" },
};

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function ReportCard({ report, onClick, isSelected }: ReportCardProps) {
  const status = statusConfig[report.status] || statusConfig.new;
  const severity = severityConfig[report.severity] || severityConfig.medium;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg bg-slate-800/60 border-slate-700 hover:border-slate-600 ${
        isSelected ? "ring-2 ring-primary border-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div
            className={`w-10 h-10 rounded-lg ${typeColors[report.type]} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}
          >
            {typeIcons[report.type] || typeIcons.other}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium text-sm truncate text-white">
                {report.triageTitle || `${typeLabels[report.type]} Report`}
              </h3>
              <Badge variant={status.variant} className="flex-shrink-0">
                <span className="mr-1">{status.icon}</span>
                {status.label}
              </Badge>
            </div>

            <p className="text-sm text-slate-400 line-clamp-2 mb-2">
              {report.description}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[150px]">
                  {report.address.split(",")[0]}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(report.createdAt)}
              </span>
              <span className={`font-medium ${severity.color}`}>
                {severity.label}
              </span>
            </div>
          </div>

          {/* Photo indicator */}
          {report.photoUrl && (
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
              <img
                src={report.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
