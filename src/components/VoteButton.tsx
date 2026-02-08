"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";

interface VoteButtonProps {
  reportId: string;
  sessionId: string;
  initialVoteCount?: number;
  initialHasVoted?: boolean;
  size?: "sm" | "default";
  showCount?: boolean;
}

export function VoteButton({
  reportId,
  sessionId,
  initialVoteCount = 0,
  initialHasVoted = false,
  size = "default",
  showCount = true,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [loading, setLoading] = useState(false);

  // Fetch initial vote status on mount
  useEffect(() => {
    const fetchVoteStatus = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}/vote`, {
          headers: { "x-session-id": sessionId },
        });
        if (response.ok) {
          const data = await response.json();
          setVoteCount(data.voteCount);
          setHasVoted(data.hasVoted);
        }
      } catch (error) {
        console.error("Error fetching vote status:", error);
      }
    };

    fetchVoteStatus();
  }, [reportId, sessionId]);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    // Optimistic update
    const newHasVoted = !hasVoted;
    const newVoteCount = hasVoted ? voteCount - 1 : voteCount + 1;
    setHasVoted(newHasVoted);
    setVoteCount(newVoteCount);

    try {
      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setVoteCount(data.voteCount);
        setHasVoted(data.hasVoted);
      } else {
        // Revert on error
        setHasVoted(!newHasVoted);
        setVoteCount(hasVoted ? voteCount : voteCount);
      }
    } catch (error) {
      console.error("Error voting:", error);
      // Revert on error
      setHasVoted(!newHasVoted);
      setVoteCount(hasVoted ? voteCount : voteCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size={size}
      onClick={handleVote}
      disabled={loading}
      className={`gap-1.5 ${
        hasVoted
          ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
          : "hover:bg-indigo-600/10 hover:border-indigo-500/50"
      }`}
    >
      <ThumbsUp
        className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} ${
          hasVoted ? "fill-current" : ""
        }`}
      />
      {showCount && (
        <span className={size === "sm" ? "text-xs" : "text-sm"}>
          {voteCount}
        </span>
      )}
    </Button>
  );
}
