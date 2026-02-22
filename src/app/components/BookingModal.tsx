import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  Video,
  User,
  MessageSquare,
  Phone,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
  CreditCard,
  Gift,
} from "lucide-react";
import type { Therapist, SessionRate, AvailabilityWindow, ClientCourseBooking } from "../data/mockData";
import type { ProBonoToken } from "../data/mockData";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

type SessionModality = "video" | "inPerson" | "text" | "phoneCall";

interface BookingModalProps {
  therapist: Therapist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Active course bookings for the current client with this therapist */
  clientCourseBookings?: ClientCourseBooking[];
  /** Available pro bono tokens for the current client with this therapist */
  proBonoTokens?: ProBonoToken[];
}

// ─── Constants ──────────────────────────────────────────────────

const DAY_START = 7 * 60; // 07:00
const DAY_END = 21 * 60; // 21:00
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 28;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const modalityIcons: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-5 h-5" />,
  inPerson: <User className="w-5 h-5" />,
  text: <MessageSquare className="w-5 h-5" />,
  phoneCall: <Phone className="w-5 h-5" />,
};

const modalityIconsSmall: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  inPerson: <User className="w-3.5 h-3.5" />,
  text: <MessageSquare className="w-3.5 h-3.5" />,
  phoneCall: <Phone className="w-3.5 h-3.5" />,
};

// ─── Helpers ────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatTime12(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

function minutesToTime12(minutes: number): string {
  return formatTime12(fmtMinutes(minutes));
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Compute valid start times for a session within a window.
 * Sessions < 60 min: on-the-hour starts only (60-min step).
 * Sessions >= 60 min: back-to-back slots (step = session duration + cooldown).
 */
function computeStartTimes(
  windowStartMin: number,
  windowEndMin: number,
  sessionDurationMinutes: number,
  cooldownMinutes: number = 0
): number[] {
  const effectiveBlock = sessionDurationMinutes + cooldownMinutes;
  const step = sessionDurationMinutes < 60 ? 60 : effectiveBlock;
  const firstStart =
    step === 60
      ? windowStartMin % 60 === 0
        ? windowStartMin
        : windowStartMin + (60 - (windowStartMin % 60))
      : windowStartMin;
  const starts: number[] = [];
  for (
    let t = firstStart;
    t + sessionDurationMinutes <= windowEndMin;
    t += step
  ) {
    starts.push(t);
  }
  return starts;
}

// ─── Component ──────────────────────────────────────────────────

export default function BookingModal({
  therapist,
  open,
  onOpenChange,
  clientCourseBookings = [],
  proBonoTokens = [],
}: BookingModalProps) {
  const [selectedSessionRate, setSelectedSessionRate] =
    React.useState<SessionRate | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>();
  const [selectedStartMinutes, setSelectedStartMinutes] = React.useState<
    number | undefined
  >();
  const [step, setStep] = React.useState<
    "sessionType" | "datetime" | "confirm"
  >("sessionType");
  const [weekStart, setWeekStart] = React.useState(() =>
    getMonday(new Date())
  );
  // "standard" = pay-per-session, "prepaid" = use a course credit, "probono" = use a pro bono token
  const [bookingMode, setBookingMode] = React.useState<"standard" | "prepaid" | "probono">("standard");

  const sessionRates = therapist.sessionRates || [];
  const windows = therapist.availabilityWindows || [];

  // ── Pro bono helpers ─────────────────────────────────────────
  // Group available tokens by sessionRateId → count
  const proBonoByRateId = React.useMemo(() => {
    const map: Record<string, ProBonoToken[]> = {};
    for (const t of proBonoTokens) {
      if (!map[t.sessionRateId]) map[t.sessionRateId] = [];
      map[t.sessionRateId].push(t);
    }
    return map;
  }, [proBonoTokens]);

  const totalProBonoTokens = proBonoTokens.length;
  const hasProBonoTokens = totalProBonoTokens > 0;

  // The pro bono token(s) for the selected rate — only in probono mode
  const activeProBonoForRate = React.useMemo(() => {
    if (bookingMode !== "probono" || !selectedSessionRate) return null;
    const tokens = proBonoByRateId[selectedSessionRate.id];
    return tokens && tokens.length > 0 ? tokens : null;
  }, [bookingMode, selectedSessionRate, proBonoByRateId]);

  // ── Course booking helpers ────────────────────────────────────
  // Map of rateId → active course booking with remaining sessions
  const courseBookingByRateId = React.useMemo(() => {
    const map: Record<string, ClientCourseBooking> = {};
    for (const cb of clientCourseBookings) {
      if (
        cb.therapistId === therapist.id &&
        cb.status === "active" &&
        cb.sessionsUsed < cb.totalSessions
      ) {
        map[cb.sessionRateId] = cb;
      }
    }
    return map;
  }, [clientCourseBookings, therapist.id]);

  // All active course bookings for this therapist (for the prepaid tab)
  const activeCourseBookings = React.useMemo(() => {
    return clientCourseBookings.filter(
      (cb) =>
        cb.therapistId === therapist.id &&
        cb.status === "active" &&
        cb.sessionsUsed < cb.totalSessions
    );
  }, [clientCourseBookings, therapist.id]);

  // Total remaining prepaid sessions across all courses
  const totalPrepaidRemaining = React.useMemo(() => {
    return activeCourseBookings.reduce(
      (sum, cb) => sum + (cb.totalSessions - cb.sessionsUsed),
      0
    );
  }, [activeCourseBookings]);

  // Combined count for the badge (courses + pro bono)
  const totalCreditRemaining = totalPrepaidRemaining + totalProBonoTokens;
  const hasAnyCreditSessions = totalCreditRemaining > 0;

  // Derive the visual tab value from bookingMode (two tabs: "standard" | "credit")
  const activeTab = bookingMode === "standard" ? "standard" : "credit";

  // The active course for the selected rate — only in prepaid mode
  const activeCourseForRate = React.useMemo(() => {
    if (bookingMode !== "prepaid" || !selectedSessionRate) return null;
    return courseBookingByRateId[selectedSessionRate.id] ?? null;
  }, [bookingMode, selectedSessionRate, courseBookingByRateId]);

  // A convenience flag: is the current booking using ANY credit (course or pro bono)?
  const isCreditBooking = !!activeCourseForRate || !!activeProBonoForRate;

  // ── Week navigation ───────────────────────────────────────────

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minWeekStart = React.useMemo(() => getMonday(new Date()), []);

  const maxSlotDate = React.useMemo(() => {
    if (windows.length === 0) return addDays(today, 28);
    const dates = windows.map((w) => new Date(w.date + "T12:00:00"));
    return dates.reduce((max, d) => (d > max ? d : max), dates[0]);
  }, [windows, today]);

  const maxWeekStart = React.useMemo(
    () => getMonday(maxSlotDate),
    [maxSlotDate]
  );

  const canGoPrev = weekStart.getTime() > minWeekStart.getTime();
  const canGoNext = weekStart.getTime() < maxWeekStart.getTime();

  const prevWeek = () => {
    if (canGoPrev) setWeekStart((d) => addDays(d, -7));
  };
  const nextWeek = () => {
    if (canGoNext) setWeekStart((d) => addDays(d, 7));
  };
  const goToday = () => setWeekStart(getMonday(new Date()));

  const weekDates = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const timeLabels = React.useMemo(() => {
    const labels: string[] = [];
    for (let m = DAY_START; m < DAY_END; m += SLOT_MINUTES) {
      labels.push(fmtMinutes(m));
    }
    return labels;
  }, []);

  // ── Windows lookup by date ────────────────────────────────────

  const windowsByDate = React.useMemo(() => {
    const map: Record<string, AvailabilityWindow[]> = {};
    for (const w of windows) {
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    }
    return map;
  }, [windows]);

  // ── Count total available start times for selected session type ──

  const availableCount = React.useMemo(() => {
    if (!selectedSessionRate) return 0;
    const cooldown = selectedSessionRate.cooldown || 0;
    let count = 0;
    for (const w of windows) {
      const wStart = timeToMinutes(w.startTime);
      const wEnd = timeToMinutes(w.endTime);
      const windowDuration = wEnd - wStart;
      if (windowDuration >= selectedSessionRate.duration) {
        count += computeStartTimes(
          wStart,
          wEnd,
          selectedSessionRate.duration,
          cooldown
        ).length;
      }
    }
    return count;
  }, [selectedSessionRate, windows]);

  // ── Step logic ────────────────────────────────────────────────

  const jumpToFirstAvailableWeek = React.useCallback(
    (rate: SessionRate) => {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const futureDates = windows
        .filter((w) => {
          const d = new Date(w.date + "T12:00:00");
          if (d < todayDate) return false;
          const wStart = timeToMinutes(w.startTime);
          const wEnd = timeToMinutes(w.endTime);
          return computeStartTimes(wStart, wEnd, rate.duration).length > 0;
        })
        .map((w) => w.date)
        .sort();

      if (futureDates.length > 0) {
        const firstDate = new Date(futureDates[0] + "T12:00:00");
        setWeekStart(getMonday(firstDate));
      }
    },
    [windows]
  );

  const handleContinue = () => {
    if (step === "sessionType") {
      if (!selectedSessionRate) {
        toast.error("Please select a session type");
        return;
      }
      setSelectedDate(undefined);
      setSelectedStartMinutes(undefined);
      jumpToFirstAvailableWeek(selectedSessionRate);
      setStep("datetime");
    } else if (step === "datetime") {
      if (!selectedDate || selectedStartMinutes === undefined) {
        toast.error("Please select a time slot");
        return;
      }
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "datetime") {
      setStep("sessionType");
    } else if (step === "confirm") {
      setStep("datetime");
    }
  };

  const handleConfirmBooking = () => {
    if (activeCourseForRate) {
      toast.success(
        `Session booked! Using ${activeCourseForRate.courseTitle} (${activeCourseForRate.sessionsUsed + 1}/${activeCourseForRate.totalSessions} sessions used)`
      );
    } else if (activeProBonoForRate) {
      toast.success(
        `Session booked! Gifted session used for ${selectedSessionRate!.title}`
      );
    } else {
      toast.success("Booking confirmed! Redirecting to payment...");
    }
    setTimeout(() => {
      onOpenChange(false);
      setStep("sessionType");
      setSelectedDate(undefined);
      setSelectedStartMinutes(undefined);
      setSelectedSessionRate(null);
      setBookingMode("standard");
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("sessionType");
    setSelectedDate(undefined);
    setSelectedStartMinutes(undefined);
    setSelectedSessionRate(null);
    setBookingMode("standard");
  };

  // ── Render helpers ────────────────────────────────────────────

  const blockStyle = (startMinutes: number, endMinutes: number) => {
    const top = ((startMinutes - DAY_START) / SLOT_MINUTES) * SLOT_HEIGHT;
    const height =
      ((endMinutes - startMinutes) / SLOT_MINUTES) * SLOT_HEIGHT;
    return { top, height: Math.max(height, SLOT_HEIGHT) };
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`${
          step === "datetime"
            ? "max-w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] w-full max-h-[90vh]"
            : "sm:max-w-2xl max-h-[90vh]"
        } flex flex-col p-0 gap-0`}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Book a Session with {therapist.name}</DialogTitle>
          <DialogDescription>
            {step === "sessionType" && "Choose your preferred session type"}
            {step === "datetime" && "Click on an available time slot to book"}
            {step === "confirm" && "Confirm your booking"}
          </DialogDescription>
        </DialogHeader>

        {/* ── Step 1: Session Type Selection ─────────────────────── */}
        {step === "sessionType" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {hasAnyCreditSessions ? (
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  if (val === "standard") {
                    setBookingMode("standard");
                  } else {
                    // Default to prepaid when switching to credit tab; actual mode set on item click
                    setBookingMode("prepaid");
                  }
                  setSelectedSessionRate(null);
                }}
                className="gap-4"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="standard" className="gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Pay as you go
                  </TabsTrigger>
                  <TabsTrigger value="credit" className="gap-1.5">
                    <Package className="w-4 h-4" />
                    Your Sessions
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-emerald-200">
                      {totalCreditRemaining}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* ── Pay as you go (standard) tab ──────────────── */}
                <TabsContent value="standard">
                  <div className="grid grid-cols-1 gap-3">
                    {sessionRates.map((rate) => (
                      <button
                        key={rate.id}
                        onClick={() => setSelectedSessionRate(rate)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedSessionRate?.id === rate.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={
                                selectedSessionRate?.id === rate.id
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }
                            >
                              {modalityIcons[rate.modality]}
                            </div>
                            <div>
                              <div className="font-medium">{rate.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {rate.duration} min
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              selectedSessionRate?.id === rate.id
                                ? "default"
                                : "outline"
                            }
                            className="text-base px-3 py-1"
                          >
                            £{rate.price}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                {/* ── Your Sessions (combined prepaid + pro bono) tab ── */}
                <TabsContent value="credit">
                  <div className="space-y-3">
                    {/* Prepaid course bookings */}
                    {activeCourseBookings.map((cb) => {
                      const rate = sessionRates.find((r) => r.id === cb.sessionRateId);
                      if (!rate) return null;
                      const remaining = cb.totalSessions - cb.sessionsUsed;
                      const isSelected = selectedSessionRate?.id === rate.id && bookingMode === "prepaid";

                      return (
                        <button
                          key={cb.id}
                          onClick={() => {
                            setBookingMode("prepaid");
                            setSelectedSessionRate(rate);
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                              : "border-border hover:border-emerald-400"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Package className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-600" : "text-muted-foreground"}`} />
                                <span className="font-medium truncate">{cb.courseTitle}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2 ml-6">
                                <div className={isSelected ? "text-emerald-600" : "text-muted-foreground"}>
                                  {modalityIcons[rate.modality]}
                                </div>
                                <div>
                                  <div className="text-sm">{rate.title}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {rate.duration} min
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 ${
                                  isSelected
                                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                    : ""
                                }`}
                              >
                                {remaining} session{remaining !== 1 ? "s" : ""} left
                              </Badge>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground line-through">
                                  £{rate.price}
                                </span>
                                <span className="text-sm font-semibold text-emerald-600">
                                  £0
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 ml-6">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                              <span>{cb.sessionsUsed} of {cb.totalSessions} used</span>
                              <span>{Math.round((cb.sessionsUsed / cb.totalSessions) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${(cb.sessionsUsed / cb.totalSessions) * 100}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Gifted sessions */}
                    {sessionRates.map((rate) => {
                      const tokens = proBonoByRateId[rate.id];
                      if (!tokens || tokens.length === 0) return null;
                      const isSelected = selectedSessionRate?.id === rate.id && bookingMode === "probono";

                      return (
                        <button
                          key={`gifted-${rate.id}`}
                          onClick={() => {
                            setBookingMode("probono");
                            setSelectedSessionRate(rate);
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                              : "border-border hover:border-emerald-400"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Gift className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-600" : "text-muted-foreground"}`} />
                                <span className="font-medium truncate">Gifted Session</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2 ml-6">
                                <div className={isSelected ? "text-emerald-600" : "text-muted-foreground"}>
                                  {modalityIcons[rate.modality]}
                                </div>
                                <div>
                                  <div className="text-sm">{rate.title}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {rate.duration} min
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 ${
                                  isSelected
                                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                    : ""
                                }`}
                              >
                                {tokens.length} session{tokens.length !== 1 ? "s" : ""} left
                              </Badge>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground line-through">
                                  £{rate.price}
                                </span>
                                <span className="text-sm font-semibold text-emerald-600">
                                  £0
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* No prepaid sessions — show flat list (no tabs) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {sessionRates.map((rate) => (
                    <button
                      key={rate.id}
                      onClick={() => setSelectedSessionRate(rate)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedSessionRate?.id === rate.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              selectedSessionRate?.id === rate.id
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          >
                            {modalityIcons[rate.modality]}
                          </div>
                          <div>
                            <div className="font-medium">{rate.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {rate.duration} min
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            selectedSessionRate?.id === rate.id
                              ? "default"
                              : "outline"
                          }
                          className="text-base px-3 py-1"
                        >
                          £{rate.price}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
                {sessionRates.length === 0 && (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground">
                      This therapist hasn't set up session rates yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Week View Calendar ─────────────────────────── */}
        {step === "datetime" && selectedSessionRate && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Selected session type banner */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/50 border-b shrink-0">
              <div className={isCreditBooking ? "text-emerald-600" : "text-primary"}>
                {modalityIconsSmall[selectedSessionRate.modality]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">
                  {selectedSessionRate.title}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {selectedSessionRate.duration} min
                </span>
                {activeCourseForRate ? (
                  <span className="text-xs text-emerald-600 ml-2">
                    <Package className="w-3 h-3 inline mr-0.5" />
                    Prepaid &middot; {activeCourseForRate.courseTitle}
                  </span>
                ) : activeProBonoForRate ? (
                  <span className="text-xs text-emerald-600 ml-2">
                    <Gift className="w-3 h-3 inline mr-0.5" />
                    Gifted Session
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground ml-1">
                    &middot; £{selectedSessionRate.price}
                  </span>
                )}
                <button
                  onClick={handleBack}
                  className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer ml-2"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full ${
                    availableCount > 0 ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                />
                {availableCount} slot{availableCount !== 1 ? "s" : ""}{" "}
                available
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 px-4 py-2 border-b text-xs text-muted-foreground shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-600 border border-emerald-600" />
                <span>Selected</span>
              </div>
            </div>

            {/* Week nav */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevWeek}
                  disabled={!canGoPrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToday}
                  className="text-xs"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextWeek}
                  disabled={!canGoNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDateShort(weekDates[0])} —{" "}
                {formatDateShort(weekDates[6])}
              </span>
            </div>

            {/* Day header row */}
            <div className="flex shrink-0 border-b">
              <div className="w-14 shrink-0" />
              {weekDates.map((d, i) => {
                const isToday =
                  d.toDateString() === new Date().toDateString();
                const isPast = d < today;
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center py-2 text-sm border-l ${
                      isToday
                        ? "bg-primary/5 font-medium"
                        : isPast
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div
                      className={`text-xs ${isToday ? "text-primary" : ""}`}
                    >
                      {formatDateShort(d)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scrollable grid */}
            <div className="flex-1 overflow-y-auto select-none">
              <div className="flex relative">
                {/* Time gutter */}
                <div className="w-14 shrink-0">
                  {timeLabels.map((label, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-end pr-2 text-[10px] text-muted-foreground"
                      style={{ height: SLOT_HEIGHT }}
                    >
                      <span className="-translate-y-1.5">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDates.map((d, dayIndex) => {
                  const dateStr = toDateStr(d);
                  const isToday =
                    d.toDateString() === new Date().toDateString();
                  const isPast = d < today;
                  const dayWindows = windowsByDate[dateStr] || [];

                  const sessionSlots: number[] = [];
                  if (!isPast) {
                    const cooldown = selectedSessionRate.cooldown || 0;
                    for (const win of dayWindows) {
                      const wStart = timeToMinutes(win.startTime);
                      const wEnd = timeToMinutes(win.endTime);
                      const starts = computeStartTimes(
                        wStart,
                        wEnd,
                        selectedSessionRate.duration,
                        cooldown
                      );
                      for (const s of starts) {
                        sessionSlots.push(s);
                      }
                    }
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={`flex-1 border-l relative ${
                        isToday
                          ? "bg-primary/[0.02]"
                          : isPast
                          ? "bg-muted/20"
                          : ""
                      }`}
                    >
                      {/* Grid lines */}
                      {timeLabels.map((_, slotIdx) => (
                        <div
                          key={slotIdx}
                          className={`${
                            slotIdx % 2 === 0
                              ? "border-b border-border/50"
                              : "border-b border-dashed border-border/25"
                          }`}
                          style={{ height: SLOT_HEIGHT }}
                        />
                      ))}

                      {/* Render individual session slots */}
                      {sessionSlots.map((startMin) => {
                        const endMin =
                          startMin + selectedSessionRate.duration;
                        const { top, height } = blockStyle(
                          startMin,
                          endMin
                        );
                        const isSelected =
                          selectedDate === dateStr &&
                          selectedStartMinutes === startMin;

                        return (
                          <button
                            key={`slot-${startMin}`}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedStartMinutes(startMin);
                            }}
                            className={`absolute left-0.5 right-0.5 rounded-md border transition-all z-[2] flex items-center justify-center gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : "bg-emerald-50 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 text-foreground"
                            }`}
                            style={{ top, height }}
                          >
                            <span
                              className={`text-[10px] ${
                                isSelected ? "" : "text-foreground/80"
                              }`}
                            >
                              {minutesToTime12(startMin)}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isSelected
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              – {minutesToTime12(endMin)}
                            </span>
                          </button>
                        );
                      })}

                      {/* Past overlay */}
                      {isPast && (
                        <div className="absolute inset-0 bg-muted/10 pointer-events-none z-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected slot summary bar */}
            {selectedDate && selectedStartMinutes !== undefined && (
              <div className="px-4 py-2.5 border-t bg-primary/5 shrink-0">
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {(() => {
                      const d = new Date(selectedDate + "T12:00:00");
                      return d.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                    })()}
                  </span>
                  <span className="text-muted-foreground">at</span>
                  <span className="font-medium">
                    {minutesToTime12(selectedStartMinutes)}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-medium">
                    {minutesToTime12(
                      selectedStartMinutes + selectedSessionRate.duration
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    ({selectedSessionRate.duration} min{" "}
                    {selectedSessionRate.title})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Confirmation ───────────────────────────────── */}
        {step === "confirm" && selectedSessionRate && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={therapist.avatar}
                      alt={therapist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-lg">
                        {therapist.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {therapist.credentials}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Session Type:
                      </span>
                      <span className="font-medium">
                        {selectedSessionRate.title}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {selectedDate &&
                          new Date(
                            selectedDate + "T12:00:00"
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {selectedStartMinutes !== undefined &&
                          `${minutesToTime12(selectedStartMinutes)} – ${minutesToTime12(selectedStartMinutes + selectedSessionRate.duration)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {selectedSessionRate.duration} minutes
                      </span>
                    </div>
                  </div>

                  {/* Price section - differs for course / probono / standard */}
                  <div className="pt-4 border-t">
                    {activeCourseForRate ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Package className="w-5 h-5" />
                          <span className="font-medium">Prepaid Course Session</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 space-y-1.5">
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                            {activeCourseForRate.courseTitle}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700 dark:text-emerald-300">Sessions used:</span>
                            <span className="font-medium text-emerald-800 dark:text-emerald-200">
                              {activeCourseForRate.sessionsUsed} of {activeCourseForRate.totalSessions}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700 dark:text-emerald-300">After this booking:</span>
                            <span className="font-medium text-emerald-800 dark:text-emerald-200">
                              {activeCourseForRate.sessionsUsed + 1} of {activeCourseForRate.totalSessions}
                              {activeCourseForRate.sessionsUsed + 1 === activeCourseForRate.totalSessions && " (final session)"}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Amount due:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              £{selectedSessionRate.price}
                            </span>
                            <span className="text-2xl font-bold text-emerald-600">
                              £0
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : activeProBonoForRate ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Gift className="w-5 h-5" />
                          <span className="font-medium">Gifted Session</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 space-y-1.5">
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                            {selectedSessionRate.title}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700 dark:text-emerald-300">Sessions remaining:</span>
                            <span className="font-medium text-emerald-800 dark:text-emerald-200">
                              {activeProBonoForRate.length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700 dark:text-emerald-300">After this booking:</span>
                            <span className="font-medium text-emerald-800 dark:text-emerald-200">
                              {activeProBonoForRate.length - 1} remaining
                              {activeProBonoForRate.length === 1 && " (final session)"}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Amount due:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              £{selectedSessionRate.price}
                            </span>
                            <span className="text-2xl font-bold text-emerald-600">
                              £0
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span className="text-2xl font-bold">
                          £{selectedSessionRate.price}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className={`p-4 rounded-lg ${isCreditBooking ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-muted"}`}>
                <p className={`text-sm ${isCreditBooking ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>
                  {activeCourseForRate
                    ? "This session is covered by your prepaid course. No payment is required."
                    : activeProBonoForRate
                    ? "This is a complimentary session gifted by your therapist. No payment is required."
                    : "You will be redirected to complete payment after confirming this booking."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer buttons ─────────────────────────────────────── */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
          {step !== "confirm" ? (
            <Button
              onClick={handleContinue}
              disabled={
                (step === "sessionType" && !selectedSessionRate) ||
                (step === "datetime" &&
                  (!selectedDate || selectedStartMinutes === undefined))
              }
            >
              Continue
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleConfirmBooking} className="gap-2">
                <Check className="w-4 h-4" />
                {isCreditBooking ? "Confirm Booking" : "Confirm & Pay"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}