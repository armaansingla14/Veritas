"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "./ui/button";

interface FollowButtonProps {
  reportId: string;
  sessionId: string;
  initialIsSubscribed?: boolean;
  size?: "sm" | "default";
}

export function FollowButton({
  reportId,
  sessionId,
  initialIsSubscribed = false,
  size = "default",
}: FollowButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [loading, setLoading] = useState(false);

  // Fetch initial subscription status on mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}/subscribe`, {
          headers: { "x-session-id": sessionId },
        });
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchSubscriptionStatus();
  }, [reportId, sessionId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    // Optimistic update
    const newIsSubscribed = !isSubscribed;
    setIsSubscribed(newIsSubscribed);

    try {
      const response = await fetch(`/api/reports/${reportId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } else {
        // Revert on error
        setIsSubscribed(!newIsSubscribed);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      // Revert on error
      setIsSubscribed(!newIsSubscribed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={`gap-1.5 ${
        isSubscribed
          ? "bg-amber-600 hover:bg-amber-700 border-amber-600"
          : "hover:bg-amber-600/10 hover:border-amber-500/50"
      }`}
      title={isSubscribed ? "Unsubscribe from updates" : "Subscribe to updates"}
    >
      {isSubscribed ? (
        <>
          <Bell className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} fill-current`} />
          <span className={size === "sm" ? "text-xs" : "text-sm"}>Following</span>
        </>
      ) : (
        <>
          <BellOff className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          <span className={size === "sm" ? "text-xs" : "text-sm"}>Follow</span>
        </>
      )}
    </Button>
  );
}
