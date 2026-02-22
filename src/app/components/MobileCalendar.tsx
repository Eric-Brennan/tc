import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileCalendarEvent {
  id: string;
  start: Date;
  averageMood: number;
}

interface MobileCalendarProps {
  events: MobileCalendarEvent[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function MobileCalendar({ events, onDateSelect, selectedDate }: MobileCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-500';
    if (mood >= 6) return 'bg-blue-500';
    if (mood >= 4) return 'bg-yellow-500';
    if (mood >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    const todayEvents = getEventsForDay(today);
    if (todayEvents.length > 0) {
      onDateSelect(today);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button
          onClick={handlePrevMonth}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-base font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleToday}
            className="text-xs text-blue-600 font-medium hover:text-blue-700 active:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold text-gray-500 uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={index}
              onClick={() => hasEvents && onDateSelect(day)}
              disabled={!hasEvents}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg
                transition-all duration-200 min-h-[50px]
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${isToday && !isSelected ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-200' : ''}
                ${isSelected ? 'bg-blue-600 text-white font-semibold shadow-lg scale-105' : ''}
                ${hasEvents && !isSelected && !isToday ? 'font-semibold bg-gray-100' : ''}
                ${hasEvents && !isSelected && !isToday ? 'hover:bg-gray-200 active:bg-gray-300' : ''}
                ${!hasEvents ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="text-sm">
                {format(day, 'd')}
              </span>
              
              {/* Event Indicator Dots */}
              {hasEvents && !isSelected && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`w-1.5 h-1.5 rounded-full ${getMoodColor(event.averageMood)}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs font-semibold text-gray-600 mb-2">Mood Levels</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Great (8-10)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Good (6-7)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Okay (4-5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Low (2-3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Poor (0-1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
