import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Video, Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  mockVideoSessions,
  mockTherapists,
  type VideoSession,
} from "../data/mockData";

interface UpcomingSessionBannerProps {
  clientId: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

function formatSessionTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function UpcomingSessionBanner({ clientId }: UpcomingSessionBannerProps) {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  // Tick every second for live countdown
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Find the soonest upcoming session for this client within 30 minutes
  const THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
  const OVERRUN_MS = 10 * 60 * 1000; // still show up to 10 min after start

  const upcomingSessions = mockVideoSessions
    .filter((s: VideoSession) => {
      if (s.clientId !== clientId) return false;
      if (s.status !== "scheduled") return false;
      const diff = s.scheduledTime.getTime() - now.getTime();
      // Show if within 30 min before start or up to 10 min after start (session in progress)
      return diff <= THRESHOLD_MS && diff > -OVERRUN_MS;
    })
    .sort(
      (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
    );

  const session = upcomingSessions[0];
  if (!session) return null;

  const therapist = mockTherapists.find((t) => t.id === session.therapistId);
  const msUntil = session.scheduledTime.getTime() - now.getTime();
  const isStartingSoon = msUntil <= 5 * 60 * 1000; // 5 min or less
  const hasStarted = msUntil <= 0;
  const isVideo = session.modality === "video" || !session.modality;

  const handleJoin = () => {
    navigate(`/video-session/${session.id}`);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 mb-6 transition-all ${
        hasStarted
          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
          : isStartingSoon
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
          : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
      }`}
    >
      {/* Pulse dot for urgency */}
      {isStartingSoon && (
        <span className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                hasStarted ? "bg-green-400" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                hasStarted ? "bg-green-500" : "bg-amber-500"
              }`}
            />
          </span>
        </span>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Icon */}
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            hasStarted
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : isStartingSoon
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          }`}
        >
          <Video className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {hasStarted
              ? "Your session has started"
              : isStartingSoon
              ? "Your session is starting soon"
              : "Upcoming session"}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
            {therapist && (
              <span className="text-sm text-muted-foreground">
                with {therapist.name}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatSessionTime(session.scheduledTime)} · {session.duration} min
            </span>
          </div>

          {/* Countdown */}
          {!hasStarted && (
            <p
              className={`text-xs mt-1 font-medium tabular-nums ${
                isStartingSoon
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              Starts in {formatCountdown(msUntil)}
            </p>
          )}
        </div>

        {/* Join button */}
        {isVideo && (
          <Button
            onClick={handleJoin}
            className={`shrink-0 gap-2 ${
              hasStarted
                ? "bg-green-600 hover:bg-green-700 text-white"
                : isStartingSoon
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : ""
            }`}
            size="sm"
          >
            {hasStarted ? "Join Now" : "Join Session"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
