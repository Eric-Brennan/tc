import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Minus,
  Video,
  User,
  MessageSquare,
  Phone,
  GripVertical,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { SessionRate } from "../data/mockData";

// ─── Types ──────────────────────────────────────────────────────

interface TimeSlot {
  id: string;
  date: string; // ISO date "YYYY-MM-DD"
  startMinutes: number; // minutes from midnight
  endMinutes: number;
  enabledRateIds: string[]; // which session types can be booked here
}

interface AvailabilityCalendarProps {
  sessionRates: SessionRate[];
  trigger?: React.ReactNode;
}

// ─── Constants ──────────────────────────────────────────────────

const DAY_START = 7 * 60;
const DAY_END = 21 * 60;
const SLOT_HEIGHT = 28;
const SLOT_MINUTES = 30;
const DEFAULT_SLOT_DURATION = 120; // 2 hours default
const MIN_SLOT_DURATION = 30;
const AVAILABILITY_DAYS = 28; // 4 weeks of availability from today

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const RATE_COLORS = [
  { bg: "bg-blue-500", light: "bg-blue-100 text-blue-800", dot: "bg-blue-500", border: "border-blue-500" },
  { bg: "bg-emerald-500", light: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-500" },
  { bg: "bg-violet-500", light: "bg-violet-100 text-violet-800", dot: "bg-violet-500", border: "border-violet-500" },
  { bg: "bg-amber-500", light: "bg-amber-100 text-amber-800", dot: "bg-amber-500", border: "border-amber-500" },
  { bg: "bg-rose-500", light: "bg-rose-100 text-rose-800", dot: "bg-rose-500", border: "border-rose-500" },
  { bg: "bg-cyan-500", light: "bg-cyan-100 text-cyan-800", dot: "bg-cyan-500", border: "border-cyan-500" },
  { bg: "bg-pink-500", light: "bg-pink-100 text-pink-800", dot: "bg-pink-500", border: "border-pink-500" },
  { bg: "bg-teal-500", light: "bg-teal-100 text-teal-800", dot: "bg-teal-500", border: "border-teal-500" },
];

type SessionModality = "video" | "inPerson" | "text" | "phoneCall";

const modalityIcons: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  inPerson: <User className="w-3.5 h-3.5" />,
  text: <MessageSquare className="w-3.5 h-3.5" />,
  phoneCall: <Phone className="w-3.5 h-3.5" />,
};

const modalityIconsTiny: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-2.5 h-2.5" />,
  inPerson: <User className="w-2.5 h-2.5" />,
  text: <MessageSquare className="w-2.5 h-2.5" />,
  phoneCall: <Phone className="w-2.5 h-2.5" />,
};

const modalityLabels: Record<SessionModality, string> = {
  video: "Video",
  inPerson: "In-Person",
  text: "Messaging",
  phoneCall: "Phone",
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

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function snapTo30(minutes: number): number {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateToDayIndex(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const jsDay = d.getDay(); // 0=Sun…6=Sat
  return jsDay === 0 ? 6 : jsDay - 1; // 0=Mon…6=Sun
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

function makeId(): string {
  return `ts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** How many non-overlapping sessions of `duration` fit in a window */
function fitCount(windowMinutes: number, sessionDuration: number): number {
  if (sessionDuration <= 0) return 0;
  return Math.floor(windowMinutes / sessionDuration);
}

// ─── Seed data ──────────────────────────────────────────────────

function buildInitialSlots(rates: SessionRate[]): TimeSlot[] {
  if (rates.length === 0) return [];
  const allIds = rates.map((r) => r.id);
  const mon = getMonday(new Date());
  const slots: TimeSlot[] = [];

  // Generate 4 weeks of availability
  for (let week = 0; week < 4; week++) {
    const weekOffset = week * 7;

    // Monday: morning + afternoon (all weeks)
    slots.push({
      id: makeId(),
      date: toDateStr(addDays(mon, weekOffset)),
      startMinutes: 9 * 60,
      endMinutes: 12 * 60,
      enabledRateIds: [...allIds],
    });
    slots.push({
      id: makeId(),
      date: toDateStr(addDays(mon, weekOffset)),
      startMinutes: 13 * 60,
      endMinutes: 16 * 60,
      enabledRateIds: allIds.slice(0, 3),
    });

    // Wednesday: morning + afternoon (all weeks)
    slots.push({
      id: makeId(),
      date: toDateStr(addDays(mon, weekOffset + 2)),
      startMinutes: 10 * 60,
      endMinutes: 13 * 60,
      enabledRateIds: [...allIds],
    });
    slots.push({
      id: makeId(),
      date: toDateStr(addDays(mon, weekOffset + 2)),
      startMinutes: 14 * 60,
      endMinutes: 17 * 60,
      enabledRateIds: allIds.slice(0, 2),
    });

    // Friday: morning only (all weeks)
    slots.push({
      id: makeId(),
      date: toDateStr(addDays(mon, weekOffset + 4)),
      startMinutes: 9 * 60,
      endMinutes: 12 * 60,
      enabledRateIds: [...allIds],
    });

    // Tuesday: afternoon (weeks 1 & 3 only)
    if (week === 0 || week === 2) {
      slots.push({
        id: makeId(),
        date: toDateStr(addDays(mon, weekOffset + 1)),
        startMinutes: 14 * 60,
        endMinutes: 17 * 60,
        enabledRateIds: allIds.slice(0, 2),
      });
    }

    // Thursday: morning (weeks 2 & 4 only)
    if (week === 1 || week === 3) {
      slots.push({
        id: makeId(),
        date: toDateStr(addDays(mon, weekOffset + 3)),
        startMinutes: 9 * 60,
        endMinutes: 12 * 60,
        enabledRateIds: [...allIds],
      });
    }
  }

  return slots;
}

// ─── Component ──────────────────────────────────────────────────

export default function AvailabilityCalendar({
  sessionRates,
  trigger,
}: AvailabilityCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>(() =>
    buildInitialSlots(sessionRates)
  );

  // Active slot being edited
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  // Remove confirmation state: null = buttons, 'single' | 'series' = confirming
  const [confirmRemove, setConfirmRemove] = useState<"single" | "series" | null>(null);

  // Drag-to-create state
  const [dragState, setDragState] = useState<{
    dayIndex: number;
    startMinutes: number;
    currentMinutes: number;
  } | null>(null);
  const isDragging = useRef(false);

  // Hover preview
  const [hoverSlot, setHoverSlot] = useState<{
    dayIndex: number;
    minutes: number;
  } | null>(null);

  const rateColorIndex = useMemo(() => {
    const map: Record<string, number> = {};
    sessionRates.forEach((r, i) => {
      map[r.id] = i % RATE_COLORS.length;
    });
    return map;
  }, [sessionRates]);

  const activeSlot = useMemo(
    () => slots.find((s) => s.id === activeSlotId) ?? null,
    [activeSlotId, slots]
  );

  // ── Week navigation ───────────────────────────────────────────

  const minWeekStart = useMemo(() => getMonday(new Date()), []);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const maxDate = useMemo(() => addDays(today, AVAILABILITY_DAYS - 1), [today]);
  const maxWeekStart = useMemo(() => getMonday(maxDate), [maxDate]);

  const canGoPrev = weekStart.getTime() > minWeekStart.getTime();
  const canGoNext = weekStart.getTime() < maxWeekStart.getTime();

  const prevWeek = () => { if (canGoPrev) setWeekStart((d) => addDays(d, -7)); };
  const nextWeek = () => { if (canGoNext) setWeekStart((d) => addDays(d, 7)); };
  const goToday = () => setWeekStart(getMonday(new Date()));

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    for (let m = DAY_START; m < DAY_END; m += SLOT_MINUTES) {
      labels.push(fmt(m));
    }
    return labels;
  }, []);

  // ── Overlap check ─────────────────────────────────────────────

  const hasOverlap = useCallback(
    (date: string, startMin: number, endMin: number, excludeId?: string) => {
      return slots.some((s) => {
        if (s.date !== date) return false;
        if (excludeId && s.id === excludeId) return false;
        return startMin < s.endMinutes && endMin > s.startMinutes;
      });
    },
    [slots]
  );

  // ── Slots for a date ──────────────────────────────────────────

  const slotsForDate = useCallback(
    (date: string) => slots.filter((s) => s.date === date),
    [slots]
  );

  // ── Mouse → minutes helper ───────────────────────────────────

  const yToMinutes = useCallback(
    (y: number) => {
      const rawSlot = Math.floor(y / SLOT_HEIGHT);
      const rawMinutes = DAY_START + rawSlot * SLOT_MINUTES;
      return Math.max(DAY_START, Math.min(snapTo30(rawMinutes), DAY_END));
    },
    []
  );

  // ── Drag-to-create handlers ───────────────────────────────────

  const handleMouseDown = useCallback(
    (dayIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
      // Don't start drag if clicking on an existing slot block
      if ((e.target as HTMLElement).closest("[data-slot-block]")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const minutes = yToMinutes(y);
      isDragging.current = true;
      setDragState({ dayIndex, startMinutes: minutes, currentMinutes: minutes + SLOT_MINUTES });
    },
    [yToMinutes]
  );

  const handleMouseMove = useCallback(
    (dayIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const minutes = yToMinutes(y);

      if (isDragging.current && dragState && dragState.dayIndex === dayIndex) {
        // Extend drag — ensure at least one slot of height
        const endM = Math.max(dragState.startMinutes + SLOT_MINUTES, minutes + SLOT_MINUTES);
        setDragState((prev) =>
          prev ? { ...prev, currentMinutes: Math.min(endM, DAY_END) } : prev
        );
      } else if (!isDragging.current) {
        setHoverSlot({ dayIndex, minutes });
      }
    },
    [dragState, yToMinutes]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || !dragState) {
      isDragging.current = false;
      setDragState(null);
      return;
    }
    isDragging.current = false;

    const date = toDateStr(weekDates[dragState.dayIndex]);
    if (parseDate(date) > maxDate) {
      toast.error("Cannot add availability more than 4 weeks ahead");
      setDragState(null);
      return;
    }
    const startM = Math.min(dragState.startMinutes, dragState.currentMinutes);
    const endM = Math.max(dragState.startMinutes, dragState.currentMinutes);
    const duration = endM - startM;

    if (duration < MIN_SLOT_DURATION) {
      const defaultEnd = Math.min(startM + DEFAULT_SLOT_DURATION, DAY_END);
      if (hasOverlap(date, startM, defaultEnd)) {
        toast.error("Overlaps with an existing availability window");
        setDragState(null);
        return;
      }
      const newSlot: TimeSlot = {
        id: makeId(),
        date,
        startMinutes: startM,
        endMinutes: defaultEnd,
        enabledRateIds: sessionRates.map((r) => r.id),
      };
      setSlots((prev) => [...prev, newSlot]);
      setActiveSlotId(newSlot.id);
    } else {
      if (hasOverlap(date, startM, endM)) {
        toast.error("Overlaps with an existing availability window");
        setDragState(null);
        return;
      }
      const newSlot: TimeSlot = {
        id: makeId(),
        date,
        startMinutes: startM,
        endMinutes: endM,
        enabledRateIds: sessionRates.map((r) => r.id),
      };
      setSlots((prev) => [...prev, newSlot]);
      setActiveSlotId(newSlot.id);
    }
    setDragState(null);
  }, [dragState, hasOverlap, sessionRates, weekDates, maxDate]);

  const handleMouseLeave = useCallback(() => {
    setHoverSlot(null);
    if (isDragging.current) {
      // Finish the drag if user leaves the column
      handleMouseUp();
    }
  }, [handleMouseUp]);

  // ── Slot editing ──────────────────────────────────────────────

  const nudgeStart = (direction: number) => {
    if (!activeSlot) return;
    const newStart = activeSlot.startMinutes + direction * SLOT_MINUTES;
    if (newStart < DAY_START) return;
    if (newStart >= activeSlot.endMinutes - MIN_SLOT_DURATION) return;
    if (hasOverlap(activeSlot.date, newStart, activeSlot.endMinutes, activeSlot.id)) {
      toast.error("Would overlap another window");
      return;
    }
    setSlots((prev) =>
      prev.map((s) => (s.id === activeSlot.id ? { ...s, startMinutes: newStart } : s))
    );
  };

  const nudgeEnd = (direction: number) => {
    if (!activeSlot) return;
    const newEnd = activeSlot.endMinutes + direction * SLOT_MINUTES;
    if (newEnd > DAY_END) return;
    if (newEnd <= activeSlot.startMinutes + MIN_SLOT_DURATION) return;
    if (hasOverlap(activeSlot.date, activeSlot.startMinutes, newEnd, activeSlot.id)) {
      toast.error("Would overlap another window");
      return;
    }
    setSlots((prev) =>
      prev.map((s) => (s.id === activeSlot.id ? { ...s, endMinutes: newEnd } : s))
    );
  };

  const toggleRate = (rateId: string) => {
    if (!activeSlot) return;
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== activeSlot.id) return s;
        const has = s.enabledRateIds.includes(rateId);
        return {
          ...s,
          enabledRateIds: has
            ? s.enabledRateIds.filter((id) => id !== rateId)
            : [...s.enabledRateIds, rateId],
        };
      })
    );
  };

  const deleteSlot = () => {
    if (!activeSlot) return;
    setSlots((prev) => prev.filter((s) => s.id !== activeSlot.id));
    setActiveSlotId(null);
    toast.success("Availability window removed");
  };

  const deleteSlotSeries = () => {
    if (!activeSlot) return;
    const activeDayIdx = dateToDayIndex(activeSlot.date);
    const matching = slots.filter(
      (s) =>
        dateToDayIndex(s.date) === activeDayIdx &&
        s.startMinutes === activeSlot.startMinutes &&
        s.endMinutes === activeSlot.endMinutes
    );
    const dateLabels = matching
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => `${DAY_LABELS[dateToDayIndex(s.date)]} ${formatDate(parseDate(s.date))}`)
      .join(", ");
    const matchIds = new Set(matching.map((s) => s.id));
    setSlots((prev) => prev.filter((s) => !matchIds.has(s.id)));
    setActiveSlotId(null);
    toast.success(
      `Removed ${matching.length} ${DAY_LABELS[activeDayIdx]} window${matching.length !== 1 ? "s" : ""} (${dateLabels})`
    );
  };

  const copySlotToDay = (targetDayOfWeek: number) => {
    if (!activeSlot) return;

    // Collect all dates for this day-of-week within the availability window
    const targetDates: string[] = [];
    for (let week = 0; week < 5; week++) {
      const d = addDays(minWeekStart, week * 7 + targetDayOfWeek);
      if (d > maxDate) break;
      const dateStr = toDateStr(d);
      if (dateStr === activeSlot.date) continue; // skip the source slot's own date
      targetDates.push(dateStr);
    }

    const newSlots: TimeSlot[] = [];
    let skippedOverlaps = 0;
    let skippedExisting = 0;

    for (const date of targetDates) {
      const alreadyExists = slots.some(
        (s) =>
          s.date === date &&
          s.startMinutes === activeSlot.startMinutes &&
          s.endMinutes === activeSlot.endMinutes
      );
      if (alreadyExists) {
        skippedExisting++;
        continue;
      }
      if (hasOverlap(date, activeSlot.startMinutes, activeSlot.endMinutes)) {
        skippedOverlaps++;
        continue;
      }
      newSlots.push({
        id: makeId(),
        date,
        startMinutes: activeSlot.startMinutes,
        endMinutes: activeSlot.endMinutes,
        enabledRateIds: [...activeSlot.enabledRateIds],
      });
    }

    if (newSlots.length === 0) {
      if (skippedExisting === targetDates.length) {
        toast.info(`Already exists on all ${DAY_LABELS[targetDayOfWeek]}s`);
      } else if (skippedOverlaps > 0) {
        toast.error(`All remaining ${DAY_LABELS[targetDayOfWeek]}s have overlapping windows`);
      }
      return;
    }

    setSlots((prev) => [...prev, ...newSlots]);
    let msg = `Copied to ${newSlots.length} ${DAY_LABELS[targetDayOfWeek]}${newSlots.length !== 1 ? "s" : ""}`;
    if (skippedOverlaps > 0) {
      msg += ` (${skippedOverlaps} skipped — overlaps)`;
    }
    toast.success(msg);
  };

  const handleSave = () => {
    toast.success("Availability saved successfully!");
    setIsOpen(false);
  };

  // ── Capacity calculator ───────────────────────────────────────

  const getCapacityLines = useCallback(
    (slot: TimeSlot) => {
      const windowLen = slot.endMinutes - slot.startMinutes;
      const lines: { rate: SessionRate; count: number; colorIdx: number }[] = [];
      for (const rateId of slot.enabledRateIds) {
        const rate = sessionRates.find((r) => r.id === rateId);
        if (!rate) continue;
        const count = fitCount(windowLen, rate.duration);
        if (count > 0) {
          lines.push({ rate, count, colorIdx: rateColorIndex[rateId] ?? 0 });
        }
      }
      return lines;
    },
    [sessionRates, rateColorIndex]
  );

  // ── Render helpers ────────────────────────────────────────────

  const blockStyle = (startMinutes: number, endMinutes: number) => {
    const top = ((startMinutes - DAY_START) / SLOT_MINUTES) * SLOT_HEIGHT;
    const height = ((endMinutes - startMinutes) / SLOT_MINUTES) * SLOT_HEIGHT;
    return { top, height: Math.max(height, SLOT_HEIGHT) };
  };

  // ── Drag preview dimensions ───────────────────────────────────

  const dragPreview = useMemo(() => {
    if (!dragState) return null;
    const startM = Math.min(dragState.startMinutes, dragState.currentMinutes);
    const endM = Math.max(dragState.startMinutes, dragState.currentMinutes);
    return { dayIndex: dragState.dayIndex, startMinutes: startM, endMinutes: endM };
  }, [dragState]);

  // Stats
  const totalSlots = slots.length;
  const totalHours = slots.reduce((acc, s) => acc + (s.endMinutes - s.startMinutes), 0) / 60;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2 w-full">
              <CalendarDays className="w-4 h-4" />
              Set Availability
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] w-full max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>Set Availability</DialogTitle>
            <DialogDescription>
              Click and drag on the calendar to create availability windows,
              then choose which session types clients can book in each window.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* ── Session Types Reference Sidebar ──────────────── */}
            <div className="w-56 border-r p-4 space-y-3 overflow-y-auto shrink-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Session Types
              </p>

              {sessionRates.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No session rates configured yet.
                </p>
              ) : (
                sessionRates.map((rate) => {
                  const colors = RATE_COLORS[rateColorIndex[rate.id] ?? 0];
                  return (
                    <div
                      key={rate.id}
                      className="p-2.5 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        <span className="text-sm truncate">{rate.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pl-[18px]">
                        <span className="flex items-center gap-1">
                          {modalityIcons[rate.modality]}
                          {modalityLabels[rate.modality]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rate.duration}m
                        </span>
                        <span>£{rate.price}</span>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="pt-3 border-t space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  How it works
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag on the calendar to create an availability window. Then
                  toggle which session types clients can book during that time.
                </p>
                <p className="text-xs text-muted-foreground">
                  A 3-hour window with 50-min sessions enabled fits up to 3
                  bookings; with 90-min sessions it fits 2. A client booking a
                  90-min session will automatically block the adjacent 50-min
                  slots.
                </p>
              </div>
            </div>

            {/* ── Calendar Area ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Week nav */}
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevWeek} disabled={!canGoPrev}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToday} className="text-xs">
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextWeek} disabled={!canGoNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
                </span>
              </div>

              {/* Day header row */}
              <div className="flex shrink-0 border-b">
                <div className="w-16 shrink-0" />
                {weekDates.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={i}
                      className={`flex-1 text-center py-2 text-sm border-l ${
                        isToday ? "bg-primary/5 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <div>{DAY_LABELS[i]}</div>
                      <div className={`text-xs ${isToday ? "text-primary" : ""}`}>
                        {formatDate(d)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable grid */}
              <div
                className="flex-1 overflow-y-auto select-none"
                onMouseUp={handleMouseUp}
              >
                <div className="flex relative">
                  {/* Time gutter */}
                  <div className="w-16 shrink-0">
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
                  {weekDates.map((_, dayIndex) => {
                    const colDate = toDateStr(weekDates[dayIndex]);
                    const daySlots = slotsForDate(colDate);
                    const isToday =
                      weekDates[dayIndex].toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={dayIndex}
                        className={`flex-1 border-l relative cursor-crosshair ${
                          isToday ? "bg-primary/[0.02]" : ""
                        }`}
                        onMouseDown={(e) => handleMouseDown(dayIndex, e)}
                        onMouseMove={(e) => handleMouseMove(dayIndex, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* 30-min grid lines */}
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

                        {/* Existing availability windows */}
                        {daySlots.map((slot) => {
                          const { top, height } = blockStyle(
                            slot.startMinutes,
                            slot.endMinutes
                          );
                          const enabledRates = sessionRates.filter((r) =>
                            slot.enabledRateIds.includes(r.id)
                          );
                          const isActive = activeSlotId === slot.id;
                          const capacityLines = getCapacityLines(slot);
                          const windowHours = (slot.endMinutes - slot.startMinutes) / 60;

                          return (
                            <div
                              key={slot.id}
                              data-slot-block
                              className={`absolute left-1 right-1 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                                isActive
                                  ? "border-primary ring-2 ring-primary/20 bg-blue-50"
                                  : "border-primary/30 bg-blue-50 hover:border-primary/50 hover:bg-blue-100"
                              } z-[2]`}
                              style={{ top, height }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlotId(slot.id);
                              }}
                            >
                              {/* Top color stripe showing enabled modalities */}
                              {enabledRates.length > 0 && (
                                <div className="flex h-1.5 shrink-0">
                                  {enabledRates.map((r) => (
                                    <div
                                      key={r.id}
                                      className={`flex-1 ${RATE_COLORS[rateColorIndex[r.id] ?? 0].dot}`}
                                    />
                                  ))}
                                </div>
                              )}

                              <div className="px-2 py-1 space-y-0.5">
                                {/* Time range */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-foreground/80">
                                    {fmt(slot.startMinutes)}–{fmt(slot.endMinutes)}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">
                                    {windowHours}h
                                  </span>
                                </div>

                                {/* Capacity info */}
                                {height > 45 && capacityLines.length > 0 && (
                                  <div className="space-y-px mt-0.5">
                                    {capacityLines
                                      .slice(0, height > 80 ? 4 : height > 60 ? 2 : 1)
                                      .map(({ rate, count, colorIdx }) => (
                                        <div
                                          key={rate.id}
                                          className="flex items-center gap-1 text-[9px] text-muted-foreground"
                                        >
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${RATE_COLORS[colorIdx].dot}`}
                                          />
                                          <span className="truncate">
                                            {count}× {rate.duration}m {modalityLabels[rate.modality]}
                                          </span>
                                        </div>
                                      ))}
                                    {capacityLines.length > (height > 80 ? 4 : height > 60 ? 2 : 1) && (
                                      <span className="text-[8px] text-muted-foreground">
                                        +{capacityLines.length - (height > 80 ? 4 : height > 60 ? 2 : 1)} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Modality icons row */}
                                {height > 35 && enabledRates.length > 0 && (
                                  <div className="flex items-center gap-1 pt-0.5">
                                    {enabledRates.slice(0, 5).map((r) => (
                                      <span
                                        key={r.id}
                                        className="text-muted-foreground"
                                        title={`${r.title} (${r.duration}m)`}
                                      >
                                        {modalityIconsTiny[r.modality]}
                                      </span>
                                    ))}
                                    {enabledRates.length > 5 && (
                                      <span className="text-[8px] text-muted-foreground">
                                        +{enabledRates.length - 5}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Resize handle at bottom */}
                              <div className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center opacity-0 hover:opacity-60 transition-opacity">
                                <GripVertical className="w-3 h-3 text-muted-foreground rotate-90" />
                              </div>
                            </div>
                          );
                        })}

                        {/* Drag-to-create preview */}
                        {dragPreview && dragPreview.dayIndex === dayIndex && (
                          <div
                            className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 z-20 pointer-events-none"
                            style={blockStyle(
                              dragPreview.startMinutes,
                              dragPreview.endMinutes
                            )}
                          >
                            <div className="px-2 py-1 text-[10px] text-primary">
                              {fmt(dragPreview.startMinutes)}–{fmt(dragPreview.endMinutes)}
                              <span className="text-primary/60 ml-1">
                                ({((dragPreview.endMinutes - dragPreview.startMinutes) / 60).toFixed(1)}h)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Hover line indicator (when not dragging) */}
                        {hoverSlot &&
                          hoverSlot.dayIndex === dayIndex &&
                          !dragState && (
                            <div
                              className="absolute left-0 right-0 h-px bg-primary/30 pointer-events-none z-[1]"
                              style={{
                                top:
                                  ((hoverSlot.minutes - DAY_START) / SLOT_MINUTES) *
                                  SLOT_HEIGHT,
                              }}
                            />
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t shrink-0 bg-background">
                <p className="text-xs text-muted-foreground">
                  {totalSlots} window{totalSlots !== 1 ? "s" : ""} &middot;{" "}
                  {totalHours.toFixed(1)} hours total
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Availability</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Slot Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!activeSlotId}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSlotId(null);
            setConfirmRemove(null);
          }
        }}
      >
        <DialogContent className="max-w-lg sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0" aria-describedby={undefined}>
          {activeSlot &&
            (() => {
              const windowLen = activeSlot.endMinutes - activeSlot.startMinutes;
              const capacityLines = getCapacityLines(activeSlot);

              return (
                <>
                  {/* ── Fixed header: day + time controls ── */}
                  <div className="px-5 pt-5 pb-3 border-b shrink-0 space-y-3">
                    <DialogHeader className="p-0">
                      <DialogTitle className="flex items-center justify-between pr-8">
                        <span>Edit Availability Window</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          {DAY_LABELS[dateToDayIndex(activeSlot.date)]},{" "}
                          {formatDate(parseDate(activeSlot.date))}
                        </span>
                      </DialogTitle>
                    </DialogHeader>

                    {/* Compact inline time controls */}
                    <div className="flex items-center gap-3 justify-center bg-muted/30 rounded-lg py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudgeStart(-1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-lg font-mono tabular-nums min-w-[52px] text-center">
                          {fmt(activeSlot.startMinutes)}
                        </span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudgeStart(1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground text-xs">—</span>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudgeEnd(-1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-lg font-mono tabular-nums min-w-[52px] text-center">
                          {fmt(activeSlot.endMinutes)}
                        </span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudgeEnd(1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({(windowLen / 60).toFixed(1)}h)
                      </span>
                    </div>
                  </div>

                  {/* ── Scrollable middle: session toggles ── */}
                  <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Available Session Types
                    </p>
                    <div className="space-y-1">
                      {sessionRates.map((rate) => {
                        const colors = RATE_COLORS[rateColorIndex[rate.id] ?? 0];
                        const isEnabled = activeSlot.enabledRateIds.includes(rate.id);
                        const count = fitCount(windowLen, rate.duration);

                        return (
                          <button
                            key={rate.id}
                            onClick={() => toggleRate(rate.id)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all text-left ${
                              isEnabled
                                ? `${colors.border} bg-white`
                                : "border-transparent bg-muted/30 opacity-50 hover:opacity-70"
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                                isEnabled
                                  ? `${colors.dot} border-transparent`
                                  : "border-2 border-muted-foreground/30"
                              }`}
                            >
                              {isEnabled && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            {/* Info */}
                            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                              {modalityIconsTiny[rate.modality]}
                            </span>
                            <span className="text-sm truncate flex-1 min-w-0">{rate.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{rate.duration}m</span>
                            <span className="text-xs text-muted-foreground shrink-0">£{rate.price}</span>

                            {/* Capacity */}
                            {isEnabled && count > 0 && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                {count}×
                              </span>
                            )}
                            {isEnabled && count === 0 && (
                              <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">
                                too long
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Compact capacity summary */}
                    {capacityLines.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-blue-700">
                          <span className="text-blue-800 font-medium shrink-0">Capacity:</span>
                          {capacityLines.map(({ rate, count, colorIdx }) => (
                            <span key={rate.id} className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${RATE_COLORS[colorIdx].dot}`} />
                              {count}× {rate.duration}m
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-blue-600 mt-1">
                          Longer sessions automatically block overlapping shorter slots.
                        </p>
                      </div>
                    )}

                    {activeSlot.enabledRateIds.length === 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        No session types enabled — clients can't book this window yet.
                      </div>
                    )}

                    {/* Copy to other days (across all weeks) */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Copy className="w-3 h-3" />
                        Copy to all weeks
                      </p>
                      <div className="flex gap-1.5">
                        {(() => {
                          const activeDayIdx = dateToDayIndex(activeSlot.date);

                          return DAY_LABELS.map((label, dayIdx) => {
                            // Gather all dates for this day-of-week in the availability window
                            const allDatesForDay: string[] = [];
                            for (let week = 0; week < 5; week++) {
                              const d = addDays(minWeekStart, week * 7 + dayIdx);
                              if (d > maxDate) break;
                              allDatesForDay.push(toDateStr(d));
                            }

                            // Count how many already have the exact same slot (excluding source)
                            const existingCount = allDatesForDay.filter(
                              (date) =>
                                date !== activeSlot.date &&
                                slots.some(
                                  (s) =>
                                    s.date === date &&
                                    s.startMinutes === activeSlot.startMinutes &&
                                    s.endMinutes === activeSlot.endMinutes
                                )
                            ).length;

                            // Count source slot itself (if same day-of-week)
                            const sourceOnThisDay = dayIdx === activeDayIdx ? 1 : 0;
                            const totalCovered = existingCount + sourceOnThisDay;
                            const allCovered = totalCovered >= allDatesForDay.length;

                            // Count how many would overlap (among uncovered dates)
                            const overlapCount = allDatesForDay.filter(
                              (date) =>
                                date !== activeSlot.date &&
                                !slots.some(
                                  (s) =>
                                    s.date === date &&
                                    s.startMinutes === activeSlot.startMinutes &&
                                    s.endMinutes === activeSlot.endMinutes
                                ) &&
                                hasOverlap(date, activeSlot.startMinutes, activeSlot.endMinutes)
                            ).length;

                            const availableCount = allDatesForDay.length - totalCovered - overlapCount;
                            const noneAvailable = availableCount <= 0 && !allCovered;

                            return (
                              <button
                                key={dayIdx}
                                disabled={allCovered}
                                onClick={() => copySlotToDay(dayIdx)}
                                title={
                                  allCovered
                                    ? dayIdx === activeDayIdx
                                      ? `All ${label}s covered`
                                      : `Already on all ${label}s`
                                    : noneAvailable
                                    ? `All remaining ${label}s have overlaps`
                                    : `Copy to ${availableCount} ${label}${availableCount !== 1 ? "s" : ""}`
                                }
                                className={`flex-1 py-1.5 rounded-md text-xs transition-all ${
                                  allCovered
                                    ? dayIdx === activeDayIdx
                                      ? "bg-primary/10 text-primary border border-primary/30 cursor-default"
                                      : "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                    : noneAvailable
                                    ? "bg-muted/30 text-muted-foreground/40 border border-transparent cursor-not-allowed line-through"
                                    : "bg-muted/40 text-foreground border border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
                                }`}
                              >
                                {label}
                                {!allCovered && availableCount > 0 && (
                                  <span className="text-[9px] opacity-60 ml-0.5">+{availableCount}</span>
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* ── Fixed footer: actions ── */}
                  {(() => {
                    const activeDayIdx = dateToDayIndex(activeSlot.date);
                    const seriesSlots = slots.filter(
                      (s) =>
                        s.id !== activeSlot.id &&
                        dateToDayIndex(s.date) === activeDayIdx &&
                        s.startMinutes === activeSlot.startMinutes &&
                        s.endMinutes === activeSlot.endMinutes
                    );
                    const seriesCount = seriesSlots.length + 1;
                    const seriesDates = [activeSlot, ...seriesSlots]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((s) => formatDate(parseDate(s.date)))
                      .join(", ");

                    return (
                      <div className="px-5 py-3 border-t shrink-0 bg-background space-y-2">
                        {confirmRemove ? (
                          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                            <p className="text-sm text-destructive flex-1">
                              {confirmRemove === "single"
                                ? `Remove this ${DAY_LABELS[activeDayIdx]} ${formatDate(parseDate(activeSlot.date))} window?`
                                : `Remove all ${seriesCount} ${DAY_LABELS[activeDayIdx]} windows (${seriesDates})?`}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmRemove(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirmRemove === "single") {
                                  deleteSlot();
                                } else {
                                  deleteSlotSeries();
                                }
                                setConfirmRemove(null);
                              }}
                            >
                              Confirm
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setConfirmRemove("single")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </Button>
                            {seriesCount > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                                onClick={() => setConfirmRemove("series")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove Series ({seriesCount})
                              </Button>
                            )}
                            <div className="flex-1" />
                            <Button
                              onClick={() => {
                                setActiveSlotId(null);
                                setConfirmRemove(null);
                                toast.success("Window updated");
                              }}
                            >
                              Done
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}