import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import type { JournalEntry } from "../data/mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar as CalendarIcon,
  BookOpen,
  Brain,
  Battery,
  Moon,
  Heart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

// ---- helpers ----------------------------------------------------------------

function getRatingColor(rating: number): string {
  return "text-foreground";
}

function getMoodBg(rating: number): string {
  if (rating >= 8) return "bg-green-500";
  if (rating >= 6) return "bg-blue-500";
  if (rating >= 4) return "bg-yellow-500";
  if (rating >= 2) return "bg-orange-500";
  return "bg-red-500";
}

// ---- Full journal entry card ------------------------------------------------

function JournalEntryFull({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <CardTitle className="text-base">
                {format(entry.date, "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                {format(entry.createdAt, "h:mm a")}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Ratings row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Mood</p>
              <p
                className={`text-lg font-bold ${getRatingColor(
                  entry.moodRating
                )}`}
              >
                {entry.moodRating}/10
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Physical</p>
              <p
                className={`text-lg font-bold ${getRatingColor(
                  entry.physicalRating
                )}`}
              >
                {entry.physicalRating}/10
              </p>
            </div>
          </div>
        </div>

        {/* Quick stat badges */}
        <div className="flex flex-wrap gap-2">
          {entry.sleepHours != null && (
            <Badge variant="outline" className="gap-1">
              <Moon className="w-3 h-3" />
              {entry.sleepHours}h sleep
            </Badge>
          )}
          {entry.sleepQuality && (
            <Badge variant="outline" className="gap-1 capitalize">
              <Moon className="w-3 h-3" />
              {entry.sleepQuality}
            </Badge>
          )}
          {entry.anxietyLevel != null && (
            <Badge variant="outline" className="gap-1">
              <Brain className="w-3 h-3" />
              Anxiety: {entry.anxietyLevel}/10
            </Badge>
          )}
          {entry.stressLevel != null && (
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              Stress: {entry.stressLevel}/10
            </Badge>
          )}
        </div>

        {/* Gratitude */}
        {entry.gratitude && entry.gratitude.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              Grateful for:
            </p>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {entry.gratitude.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Challenges */}
        {entry.challenges && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Challenges:
            </p>
            <p className="text-sm">{entry.challenges}</p>
          </div>
        )}

        {/* Thoughts / Reflections */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Reflections:
          </p>
          <p className="text-sm whitespace-pre-wrap">{entry.thoughts}</p>
        </div>

        {/* Activities */}
        {entry.activities && entry.activities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.activities.map((activity, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {activity}
              </Badge>
            ))}
          </div>
        )}

        {/* Goals */}
        {entry.goals && entry.goals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Goals:
            </p>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {entry.goals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Overview mini-card -----------------------------------------------------

function JournalOverviewCard({
  entry,
  isSelected,
  onClick,
}: {
  entry: JournalEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <p className="text-xs font-medium truncate">
        {format(entry.date, "EEE, MMM d")}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${getMoodBg(
            entry.moodRating
          )}`}
        />
        <span
          className={`text-sm font-bold ${getRatingColor(entry.moodRating)}`}
        >
          {entry.moodRating}
        </span>
        <span className="text-[10px] text-muted-foreground">/10</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
        {entry.thoughts}
      </p>
    </button>
  );
}

// ---- Main component ---------------------------------------------------------

interface BackpackJournalTabProps {
  journalEntries: JournalEntry[];
  isMobile: boolean;
}

export default function BackpackJournalTab({
  journalEntries,
  isMobile,
}: BackpackJournalTabProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [journalSubTab, setJournalSubTab] = React.useState<string>("entries");

  // Last 4 for overview
  const overviewEntries = journalEntries.slice(0, 4);

  // Dates that have entries (for calendar modifiers)
  const entryDates = React.useMemo(
    () => journalEntries.map((e) => e.date),
    [journalEntries]
  );

  // Map date -> entry for fast calendar lookup
  const dateToEntry = React.useMemo(() => {
    const map = new Map<string, number>();
    journalEntries.forEach((entry, idx) => {
      map.set(format(entry.date, "yyyy-MM-dd"), idx);
    });
    return map;
  }, [journalEntries]);

  const selectedEntry = journalEntries[selectedIndex] ?? null;

  const handleCalendarDayClick = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const idx = dateToEntry.get(key);
    if (idx !== undefined) {
      setSelectedIndex(idx);
    }
  };

  // Calendar custom day content to show mood dots
  const calendarModifiers = React.useMemo(
    () => ({
      hasEntry: entryDates,
    }),
    [entryDates]
  );

  const calendarModifiersStyles = React.useMemo(
    () => ({
      hasEntry: {
        fontWeight: 700 as const,
      },
    }),
    []
  );

  // Trend chart data — entries in chronological order
  const trendData = React.useMemo(() => {
    return [...journalEntries]
      .reverse()
      .map((entry) => ({
        date: format(entry.date, "MMM d"),
        fullDate: format(entry.date, "MMMM d, yyyy"),
        mood: entry.moodRating,
        physical: entry.physicalRating,
        ...(entry.anxietyLevel != null ? { anxiety: entry.anxietyLevel } : {}),
        ...(entry.stressLevel != null ? { stress: entry.stressLevel } : {}),
      }));
  }, [journalEntries]);

  // Summary stats for the trend tab
  const trendStats = React.useMemo(() => {
    if (journalEntries.length === 0) return null;
    const moods = journalEntries.map((e) => e.moodRating);
    const physicals = journalEntries.map((e) => e.physicalRating);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    const avgPhysical = physicals.reduce((a, b) => a + b, 0) / physicals.length;
    const highestMood = Math.max(...moods);
    const lowestMood = Math.min(...moods);
    // Trend direction: compare last 3 vs first 3
    const recent = moods.slice(0, Math.min(3, moods.length));
    const older = moods.slice(-Math.min(3, moods.length));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const trendDirection =
      recentAvg > olderAvg + 0.5
        ? "improving"
        : recentAvg < olderAvg - 0.5
        ? "declining"
        : "stable";
    return {
      avgMood: avgMood.toFixed(1),
      avgPhysical: avgPhysical.toFixed(1),
      highestMood,
      lowestMood,
      totalEntries: journalEntries.length,
      trendDirection,
    };
  }, [journalEntries]);

  if (journalEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No shared journal entries yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Entries marked as private by the client won't appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs
      value={journalSubTab}
      onValueChange={setJournalSubTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 max-w-sm">
        <TabsTrigger value="entries" className="gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Entries
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="trends" className="gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Trends
        </TabsTrigger>
      </TabsList>

      {/* ==================== ENTRIES SUB-TAB ==================== */}
      <TabsContent value="entries" className="mt-4 space-y-4">
        {/* Overview row: last 4 */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Recent entries</p>
          <div
            className={`grid gap-2 ${
              isMobile ? "grid-cols-2" : "grid-cols-4"
            }`}
          >
            {overviewEntries.map((entry, idx) => (
              <JournalOverviewCard
                key={entry.id}
                entry={entry}
                isSelected={selectedIndex === idx}
                onClick={() => setSelectedIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* Navigation + full entry */}
        {selectedEntry && (
          <div className="space-y-3">
            {/* Prev / Next buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={selectedIndex >= journalEntries.length - 1}
                onClick={() => setSelectedIndex((i) => i + 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Older
              </Button>
              <span className="text-xs text-muted-foreground">
                {selectedIndex + 1} of {journalEntries.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={selectedIndex <= 0}
                onClick={() => setSelectedIndex((i) => i - 1)}
              >
                Newer
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <JournalEntryFull entry={selectedEntry} />
          </div>
        )}
      </TabsContent>

      {/* ==================== CALENDAR SUB-TAB ==================== */}
      <TabsContent value="calendar" className="mt-4 space-y-4">
        <Card>
          <CardContent className={isMobile ? "p-2" : "p-4"}>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedEntry?.date}
                onSelect={(day) => day && handleCalendarDayClick(day)}
                modifiers={calendarModifiers}
                modifiersStyles={calendarModifiersStyles}
                className="rounded-md"
                components={{
                  DayContent: ({ date }) => {
                    const key = format(date, "yyyy-MM-dd");
                    const entryIdx = dateToEntry.get(key);
                    const hasEntry = entryIdx !== undefined;
                    const entryItem = hasEntry
                      ? journalEntries[entryIdx]
                      : null;

                    return (
                      <div className="relative flex flex-col items-center">
                        <span>{date.getDate()}</span>
                        {hasEntry && entryItem && (
                          <div
                            className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${getMoodBg(
                              entryItem.moodRating
                            )}`}
                          />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                8-10
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                6-7
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                4-5
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                2-3
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                1
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Show selected entry preview below calendar */}
        {selectedEntry && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selected: {format(selectedEntry.date, "MMMM d, yyyy")}
            </p>
            <JournalEntryFull entry={selectedEntry} />
          </div>
        )}
      </TabsContent>

      {/* ==================== TRENDS SUB-TAB ==================== */}
      <TabsContent value="trends" className="mt-4 space-y-4">
        {/* Summary stats row */}
        {trendStats && (
          <div
            className={`grid gap-3 ${
              isMobile ? "grid-cols-2" : "grid-cols-4"
            }`}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Mood</p>
                <p
                  className={`text-2xl font-bold ${getRatingColor(
                    parseFloat(trendStats.avgMood)
                  )}`}
                >
                  {trendStats.avgMood}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Physical</p>
                <p
                  className={`text-2xl font-bold ${getRatingColor(
                    parseFloat(trendStats.avgPhysical)
                  )}`}
                >
                  {trendStats.avgPhysical}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Mood Range</p>
                <p className="text-2xl font-bold text-foreground">
                  {trendStats.lowestMood}-{trendStats.highestMood}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Trend</p>
                <p
                  className={`text-lg font-bold capitalize ${
                    trendStats.trendDirection === "improving"
                      ? "text-green-500"
                      : trendStats.trendDirection === "declining"
                      ? "text-red-500"
                      : "text-blue-500"
                  }`}
                >
                  {trendStats.trendDirection === "improving"
                    ? "↑ Improving"
                    : trendStats.trendDirection === "declining"
                    ? "↓ Declining"
                    : "→ Stable"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main line chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Mood &amp; Physical Trends
            </CardTitle>
            <CardDescription>
              Tracking ratings across {trendStats?.totalEntries ?? 0} journal
              entries
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={isMobile ? "h-[260px]" : "h-[340px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e2e2",
                      background: "#ffffff",
                      color: "#1a1a1a",
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                      padding: "10px 14px",
                    }}
                    labelStyle={{
                      fontWeight: 600,
                      marginBottom: "4px",
                      color: "#1a1a1a",
                    }}
                    itemStyle={{
                      padding: "2px 0",
                      color: "#444",
                    }}
                    cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]?.payload?.fullDate) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#8b5cf6" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="physical"
                    name="Physical"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#06b6d4" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="anxiety"
                    name="Anxiety"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#f59e0b" }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    name="Stress"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#ef4444" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}