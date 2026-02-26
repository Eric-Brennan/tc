export interface AvailabilityWindow {
  date: string; // YYYY-MM-DD format
  startTime: string; // "HH:MM" e.g. "09:00"
  endTime: string; // "HH:MM" e.g. "12:00"
  enabledRateIds: string[]; // which session types can be booked in this window
  maxOccupancy?: number; // max booked time in MINUTES; when total booked duration exceeds this, extra bookings become "request only"
}
