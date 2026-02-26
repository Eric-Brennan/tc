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
  Phone,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import type { Therapist, SessionRate, AvailabilityWindow, SupervisionSession } from "../data/mockData";
import { mockSupervisionSessions } from "../data/mockData";
import { persistMockData } from "../data/devPersistence";
import { toast } from "sonner";

type SessionModality = "video" | "inPerson" | "text" | "phoneCall";

interface SupervisionBookingModalProps {
  supervisor: Therapist;
  superviseeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const DAY_START = 7 * 60;
const DAY_END = 21 * 60;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 28;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const modalityIcons: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-5 h-5" />,
  inPerson: <User className="w-5 h-5" />,
  text: <Video className="w-5 h-5" />,
  phoneCall: <Phone className="w-5 h-5" />,
};

const modalityIconsSmall: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  inPerson: <User className="w-3.5 h-3.5" />,
  text: <Video className="w-3.5 h-3.5" />,
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

export default function SupervisionBookingModal({
  supervisor,
  superviseeId,
  open,
  onOpenChange,
  onBooked,
}: SupervisionBookingModalProps) {
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

  // Only show supervision rates
  const sessionRates = (supervisor.sessionRates || []).filter(
    (r) => r.isSupervision
  );
  const windows = supervisor.availabilityWindows || [];

  // ── Week navigation ───────────────────────────────────────────

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const nowMinutes = React.useMemo(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }, []);

  const todayStr = React.useMemo(() => toDateStr(today), [today]);

  const minWeekStart = React.useMemo(() => getMonday(new Date()), []);

  const maxSlotDate = React.useMemo(() => {
    const minMax = addDays(today, 28); // Always allow at least 4 weeks ahead
    if (windows.length === 0) return minMax;
    const dates = windows.map((w) => new Date(w.date + "T12:00:00"));
    const dataMax = dates.reduce((max, d) => (d > max ? d : max), dates[0]);
    return dataMax > minMax ? dataMax : minMax;
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

  const windowsByDate = React.useMemo(() => {
    const map: Record<string, AvailabilityWindow[]> = {};
    for (const w of windows) {
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    }
    return map;
  }, [windows]);

  const availableCount = React.useMemo(() => {
    if (!selectedSessionRate) return 0;
    const cooldown = selectedSessionRate.cooldown || 0;
    let count = 0;
    for (const w of windows) {
      // Skip past dates
      const wDate = new Date(w.date + "T00:00:00");
      if (wDate < today) continue;
      if (!w.enabledRateIds.includes(selectedSessionRate.id)) continue;
      const wStart = timeToMinutes(w.startTime);
      const wEnd = timeToMinutes(w.endTime);
      const windowDuration = wEnd - wStart;
      if (windowDuration >= selectedSessionRate.duration) {
        const starts = computeStartTimes(
          wStart,
          wEnd,
          selectedSessionRate.duration,
          cooldown
        );
        // For today, only count future slots
        if (w.date === todayStr) {
          count += starts.filter((s) => s > nowMinutes).length;
        } else {
          count += starts.length;
        }
      }
    }
    return count;
  }, [selectedSessionRate, windows, today, todayStr, nowMinutes]);

  // ── Step logic ────────────────────────────────────────────────

  const jumpToFirstAvailableWeek = React.useCallback(
    (rate: SessionRate) => {
      const now = new Date();
      const todayDate = new Date(now);
      todayDate.setHours(0, 0, 0, 0);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const todayDateStr = toDateStr(todayDate);

      const futureDates = windows
        .filter((w) => {
          const d = new Date(w.date + "T00:00:00");
          if (d < todayDate) return false;
          if (!w.enabledRateIds.includes(rate.id)) return false;
          const wStart = timeToMinutes(w.startTime);
          const wEnd = timeToMinutes(w.endTime);
          const starts = computeStartTimes(wStart, wEnd, rate.duration);
          // For today, only count slots still in the future
          if (w.date === todayDateStr) {
            return starts.some((s) => s > currentMinutes);
          }
          return starts.length > 0;
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
        toast.error("Please select a supervision session type");
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
    if (!selectedSessionRate || !selectedDate || selectedStartMinutes === undefined) return;

    // Create a new supervision session
    const [year, month, day] = selectedDate.split("-").map(Number);
    const hours = Math.floor(selectedStartMinutes / 60);
    const minutes = selectedStartMinutes % 60;
    const scheduledTime = new Date(year, month - 1, day, hours, minutes);

    const newSession: SupervisionSession = {
      id: `ss-${Date.now()}`,
      supervisorId: supervisor.id,
      superviseeId: superviseeId,
      scheduledTime,
      duration: selectedSessionRate.duration,
      status: "scheduled",
      modality: selectedSessionRate.modality === "text" ? "video" : selectedSessionRate.modality as "video" | "inPerson" | "phoneCall",
      price: selectedSessionRate.price,
    };

    mockSupervisionSessions.push(newSession);
    persistMockData();

    toast.success("Supervision session booked!");
    setTimeout(() => {
      onOpenChange(false);
      setStep("sessionType");
      setSelectedDate(undefined);
      setSelectedStartMinutes(undefined);
      setSelectedSessionRate(null);
      if (onBooked) onBooked();
    }, 1200);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("sessionType");
    setSelectedDate(undefined);
    setSelectedStartMinutes(undefined);
    setSelectedSessionRate(null);
  };

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
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Book Supervision with {supervisor.name}
          </DialogTitle>
          <DialogDescription>
            {step === "sessionType" && "Choose a supervision session type"}
            {step === "datetime" && "Click on an available time slot to book"}
            {step === "confirm" && "Confirm your supervision booking"}
          </DialogDescription>
        </DialogHeader>

        {/* ── Step 1: Session Type Selection ─────────────────────── */}
        {step === "sessionType" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {sessionRates.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  This supervisor hasn't set up supervision session rates yet.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* ── Step 2: Week View Calendar ─────────────────────────── */}
        {step === "datetime" && selectedSessionRate && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Selected session type banner */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/50 border-b shrink-0">
              <div className="text-primary">
                {modalityIconsSmall[selectedSessionRate.modality]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">
                  {selectedSessionRate.title}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {selectedSessionRate.duration} min
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  &middot; £{selectedSessionRate.price}
                </span>
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
                <div className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700" />
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
                      // Only show windows that have the supervision rate enabled
                      if (!win.enabledRateIds.includes(selectedSessionRate.id)) continue;
                      const wStart = timeToMinutes(win.startTime);
                      const wEnd = timeToMinutes(win.endTime);
                      const starts = computeStartTimes(
                        wStart,
                        wEnd,
                        selectedSessionRate.duration,
                        cooldown
                      );
                      for (const s of starts) {
                        // For today, skip slots that are already in the past
                        if (isToday && s <= nowMinutes) continue;
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
                                : "bg-emerald-50 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/70 hover:border-emerald-400 dark:hover:border-emerald-600 text-foreground"
                            }`}
                            style={{ top, height }}
                          >
                            <span
                              className={`text-[10px] ${
                                isSelected ? "" : "text-foreground/80 dark:text-emerald-100"
                              }`}
                            >
                              {minutesToTime12(startMin)}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isSelected
                                  ? "text-white/70"
                                  : "text-muted-foreground dark:text-emerald-200/70"
                              }`}
                            >
                              – {minutesToTime12(endMin)}
                            </span>
                          </button>
                        );
                      })}

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
                      src={supervisor.avatar}
                      alt={supervisor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-lg">
                        {supervisor.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {supervisor.credentials}
                      </p>
                      <Badge variant="secondary" className="mt-1 gap-1 text-xs">
                        <Shield className="w-3 h-3" />
                        Supervisor
                      </Badge>
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

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-2xl font-bold">
                        £{selectedSessionRate.price}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to complete payment after confirming
                  this supervision booking.
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
                Confirm & Pay
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}