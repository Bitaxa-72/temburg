import { useState, useMemo, useRef } from 'react';
import { Clock, Timer, ChevronRight, ChevronLeft, Calendar, List, X, Sparkles, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import { useBooking } from '@/context/BookingContext';
import { useSchedule } from '@/hooks/useWordPressData';
import { daysOfWeek, type ScheduleEvent } from '@/data/schedule';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { mapScheduleData } from '@/utils/scheduleData';

// Russian holidays 2024-2026
const holidays: Record<string, string> = {
  '2024-01-01': 'Новый год',
  '2024-01-07': 'Рождество',
  '2024-02-23': 'День защитника Отечества',
  '2024-03-08': 'Международный женский день',
  '2024-05-01': 'Праздник Весны и Труда',
  '2024-05-09': 'День Победы',
  '2024-06-12': 'День России',
  '2024-11-04': 'День народного единства',
  '2025-01-01': 'Новый год',
  '2025-01-07': 'Рождество',
  '2025-02-23': 'День защитника Отечества',
  '2025-03-08': 'Международный женский день',
  '2025-05-01': 'Праздник Весны и Труда',
  '2025-05-09': 'День Победы',
  '2025-06-12': 'День России',
  '2025-11-04': 'День народного единства',
  '2026-01-01': 'Новый год',
  '2026-01-07': 'Рождество',
  '2026-02-23': 'День защитника Отечества',
  '2026-03-08': 'Международный женский день',
  '2026-05-01': 'Праздник Весны и Труда',
  '2026-05-09': 'День Победы',
  '2026-06-12': 'День России',
  '2026-11-04': 'День народного единства',
};

function getHoliday(date: Date): string | null {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${year}-${month}-${day}`;
  return holidays[key] || null;
}

// Проверка санитарного дня (первый понедельник месяца)
function isSanitaryDay(date: Date): boolean {
  // Находим первый понедельник месяца
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = воскресенье

  // Вычисляем дату первого понедельника
  // Если 1-е число — понедельник (1), то firstMonday = 1
  // Если 1-е число — вторник (2), то firstMonday = 7 (через 6 дней)
  // Если 1-е число — воскресенье (0), то firstMonday = 2 (через 1 день)
  let firstMonday: number;
  if (firstDayOfWeek === 0) {
    firstMonday = 2; // воскресенье -> понедельник = +1
  } else if (firstDayOfWeek === 1) {
    firstMonday = 1; // уже понедельник
  } else {
    firstMonday = 1 + (8 - firstDayOfWeek); // дней до следующего понедельника
  }

  return date.getDate() === firstMonday && date.getDay() === 1;
}

const dayShortNames: Record<string, string> = {
  Понедельник: 'Пн',
  Вторник: 'Вт',
  Среда: 'Ср',
  Четверг: 'Чт',
  Пятница: 'Пт',
  Суббота: 'Сб',
  Воскресенье: 'Вс',
};

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function getDayNameByDate(date: Date): string {
  const jsDay = date.getDay();
  const idx = jsDay === 0 ? 6 : jsDay - 1;
  return daysOfWeek[idx];
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekDates(date: Date): Date[] {
  const monday = new Date(date);
  const weekday = monday.getDay();
  monday.setDate(monday.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

function eventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const dateKey = formatDateKey(date);
  const dayName = getDayNameByDate(date);
  return events.filter((event) => event.date ? event.date === dateKey : Array.isArray(event.day) && event.day.includes(dayName));
}

function isSanitaryScheduleEvent(event: ScheduleEvent): boolean {
  return event.type === 'closed' || Boolean(event.closed) || Boolean(event.sanitaryDay);
}

function visibleEventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  return eventsForDate(events, date).filter((event) => !isSanitaryScheduleEvent(event));
}

function getSanitaryNotice(events: ScheduleEvent[], date: Date): string | null {
  const manual = eventsForDate(events, date).find(isSanitaryScheduleEvent);
  if (manual) {
    return manual.description || manual.name || 'Санитарный день';
  }

  void isSanitaryDay(date);
  return null;
}

function EventRow({ event, showDays }: { event: ScheduleEvent; showDays?: boolean }) {
  const { openPurchase } = useBooking();
  const hasPrice = Number(event.price) > 0;
  const isPaid = event.type === 'paid' || hasPrice;
  const isSpecial = event.type === 'special' || Boolean(event.highlight);
  const canPurchase = hasPrice;

  const borderClass = isSpecial
    ? 'bg-amber-50 border border-amber-300/50 hover:border-amber-400/70'
    : canPurchase
      ? 'bg-surface border border-primary/15 hover:border-primary/30 cursor-pointer'
      : 'bg-surface border border-border/40';

  const barClass = isSpecial ? 'bg-amber-400' : isPaid ? 'bg-primary/40' : 'bg-emerald-400/40';

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 ${borderClass}`}
      onClick={() => {
        if (canPurchase) {
          openPurchase({
            name: event.name,
            price: `${event.price} \u20BD`,
            duration: event.duration,
            requiresVisitTicket: true,
            lineItems: [{
              name: event.name,
              price: Number(event.price) || 0,
              quantity: 1,
              duration: event.duration,
              kind: 'service',
            }],
          });
        }
      }}
      role={canPurchase ? 'button' : undefined}
      tabIndex={canPurchase ? 0 : undefined}
    >
      <div className="flex-shrink-0 w-16 text-center">
        <span className={`font-heading text-lg font-bold whitespace-nowrap ${isSpecial ? 'text-amber-600' : 'text-primary'}`}>{event.time}</span>
      </div>
      <div className={`w-0.5 self-stretch rounded-full ${barClass}`} />
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm ${isSpecial ? 'text-amber-800 font-bold' : 'text-text-primary'}`}>
          {isSpecial && <span className="mr-1">🌲</span>}
          {event.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {event.duration}
          </span>
          {event.instructor && <span>{event.instructor}</span>}
          {event.location && <span>{event.location}</span>}
          {showDays && (
            <span className="text-text-secondary/60">
              {event.day.length === 7
                ? 'Ежедневно'
                : event.day.map((d) => dayShortNames[d]).join(', ')}
            </span>
          )}
        </div>
        {event.description && (
          <p className="mt-2 text-xs leading-relaxed text-text-secondary line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {canPurchase ? (
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-primary">{event.price} &#8381;</span>
            <ChevronRight className="w-3.5 h-3.5 text-primary/50" />
          </div>
        ) : isPaid ? (
          <span className="inline-block rounded-full bg-border/40 text-text-secondary px-2.5 py-0.5 text-xs font-semibold">
            Скоро
          </span>
        ) : (
          <span className="inline-block rounded-full bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 text-xs font-semibold">
            Бесплатно
          </span>
        )}
      </div>
    </div>
  );
}

/* ---- Calendar ---- */

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  return { daysInMonth, startOffset };
}

interface CalendarProps {
  events: ScheduleEvent[];
  year: number;
  month: number;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function DayCell({
  date,
  isSelected,
  isToday,
  onSelect,
  events,
}: {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  onSelect: (date: Date) => void;
  events: ScheduleEvent[];
}) {
  const sanitaryNotice = getSanitaryNotice(events, date);
  const isSanitary = Boolean(sanitaryNotice);
  const dayEvents = visibleEventsForDate(events, date);
  const hasPaid = dayEvents.some((e) => e.type === 'paid');
  const hasFree = dayEvents.some((e) => e.type === 'free');
  const hasSpecial = dayEvents.some((e) => e.type === 'special');
  const holiday = getHoliday(date);

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      title={sanitaryNotice || holiday || undefined}
      className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-150 text-xs ${
        isSelected
          ? 'bg-primary text-white font-bold shadow-sm shadow-primary/20'
          : isSanitary
            ? 'bg-gradient-to-br from-orange-100 to-amber-50 text-orange-700 font-bold ring-1 ring-orange-400'
          : holiday
            ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-400'
            : isToday
              ? 'bg-primary/15 text-primary font-bold ring-1 ring-primary/30'
              : 'hover:bg-surface-warm text-text-primary'
      }`}
    >
      <span>{date.getDate()}</span>
      {isSanitary && !isSelected && <X className="w-2.5 h-2.5 text-orange-500" />}
      {!isSanitary && holiday && !isSelected && <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
      {!isSanitary && !holiday && dayEvents.length > 0 && (
        <div className="flex gap-px">
          {hasFree && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-emerald-500'}`} />}
          {hasPaid && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-primary'}`} />}
          {hasSpecial && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-amber-500'}`} />}
        </div>
      )}
    </button>
  );
}

function CalendarPanel({ events, year, month, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: CalendarProps) {
  const { daysInMonth, startOffset } = getMonthDays(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={onPrevMonth} className="rounded-lg p-1.5 hover:bg-surface-warm text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-heading text-base font-bold text-text-primary">
          {monthNames[month]} {year}
        </h3>
        <button type="button" onClick={onNextMonth} className="rounded-lg p-1.5 hover:bg-surface-warm text-text-secondary hover:text-text-primary transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-text-secondary py-1.5">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
          const date = new Date(year, month, day);
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
          return (
            <DayCell
              key={day}
              date={date}
              isSelected={!!isSelected}
              isToday={isToday}
              onSelect={onSelectDate}
              events={events}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50 text-[10px] text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Бесплатно
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Платно
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Праздник
        </span>
      </div>
    </div>
  );
}

/* ---- Full-page month calendar ---- */

function FullMonthCalendar({
  events,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: {
  events: ScheduleEvent[];
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const { daysInMonth, startOffset } = getMonthDays(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const expandedEvents = expandedDay
    ? visibleEventsForDate(events, new Date(year, month, expandedDay))
    : [];

  const handleDayClick = (day: number) => {
    const wasExpanded = expandedDay === day;
    setExpandedDay(wasExpanded ? null : day);
    if (!wasExpanded) {
      setTimeout(() => {
        scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-gradient-to-br from-white via-surface to-surface-warm rounded-3xl p-6 md:p-10 shadow-2xl shadow-primary/10 border border-primary/20 overflow-hidden">
        {/* Top decorative line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Month nav */}
        <div className="flex items-center justify-between mb-10">
          <button
            type="button"
            onClick={onPrevMonth}
            className="group relative rounded-2xl p-4 bg-gradient-to-br from-surface to-white hover:from-primary/10 hover:to-primary/5 text-text-secondary hover:text-primary transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-primary/20 hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div className="text-center">
            <div className="inline-block px-8 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl mb-2">
              <h3 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                {monthNames[month]}
              </h3>
            </div>
            <p className="text-lg text-text-secondary font-medium">{year} год</p>
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            className="group relative rounded-2xl p-4 bg-gradient-to-br from-surface to-white hover:from-primary/10 hover:to-primary/5 text-text-secondary hover:text-primary transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-primary/20 hover:scale-105"
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-3 gap-1.5">
          {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((d, i) => (
            <div
              key={d}
              className={`text-center py-4 rounded-xl font-bold text-sm ${
                i >= 5
                  ? 'bg-gradient-to-b from-primary/15 to-primary/5 text-primary'
                  : 'bg-gradient-to-b from-surface-warm to-transparent text-text-secondary'
              }`}
            >
              <span className="hidden md:inline">{d}</span>
              <span className="md:hidden">{dayShortNames[d]}</span>
            </div>
          ))}
        </div>

        {/* Cells grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`e-${i}`}
                  className="min-h-[110px] sm:min-h-[140px] rounded-2xl bg-gradient-to-br from-border/10 to-transparent border border-dashed border-border/20"
                />
              );
            }
            const date = new Date(year, month, day);
            const isToday = isCurrentMonth && today.getDate() === day;
            const dayEvts = visibleEventsForDate(events, date);
            const isExpanded = expandedDay === day;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const hasEvents = dayEvts.length > 0;
            const holiday = getHoliday(date);
            const sanitaryNotice = getSanitaryNotice(events, date);
            const isSanitary = Boolean(sanitaryNotice);

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                title={sanitaryNotice || holiday || undefined}
                className={`group relative min-h-[110px] sm:min-h-[140px] rounded-2xl p-2.5 sm:p-3 text-left flex flex-col transition-all duration-300 ${
                  isExpanded
                    ? 'bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary shadow-xl shadow-primary/20 scale-[1.03] z-10'
                    : isSanitary
                      ? 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 ring-2 ring-orange-500 shadow-lg shadow-orange-500/20 hover:scale-[1.02]'
                      : holiday
                      ? 'bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-50 ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/30 hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-500/40 animate-pulse-slow'
                      : isToday
                        ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10 ring-2 ring-primary/50 shadow-lg shadow-primary/10'
                        : isWeekend
                          ? 'bg-gradient-to-br from-primary/10 to-amber-500/5 hover:from-primary/15 hover:to-amber-500/10 hover:shadow-lg hover:scale-[1.02]'
                          : 'bg-gradient-to-br from-white to-surface hover:from-surface hover:to-surface-warm hover:shadow-lg hover:scale-[1.02]'
                } border border-border/30 hover:border-primary/30`}
              >
                {/* Sanitary day badge */}
                {isSanitary && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-bold rounded-full">
                    <X className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">Сан. день</span>
                  </div>
                )}
                {/* Holiday badge */}
                {holiday && !isSanitary && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-[8px] font-bold rounded-full shadow-lg shadow-emerald-500/50 animate-bounce-slow z-10">
                    <Sparkles className="w-3 h-3 animate-spin-slow" />
                    <span className="hidden sm:inline">Праздник</span>
                  </div>
                )}
                {/* Fireworks */}
                {holiday && !isSanitary && (
                  <div className="firework-container">
                    {/* Left fireworks */}
                    <div className="firework firework-left-1" />
                    <div className="firework firework-left-2" />
                    <div className="firework firework-left-3" />
                    {/* Right fireworks */}
                    <div className="firework firework-right-1" />
                    <div className="firework firework-right-2" />
                    <div className="firework firework-right-3" />
                  </div>
                )}
                {/* Day number badge */}
                <div className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-xl mb-2 transition-all duration-300 ${
                  holiday
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/40'
                    : isToday
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white font-bold shadow-lg shadow-primary/40 animate-pulse'
                      : isExpanded
                        ? 'bg-primary/30 text-primary font-bold'
                        : hasEvents
                          ? 'bg-surface-warm group-hover:bg-primary/10 text-text-primary font-bold'
                          : 'text-text-secondary'
                }`}>
                  {day}
                </div>

                {/* Events preview */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  {isSanitary ? (
                    <div className="text-[10px] sm:text-xs text-orange-700 font-semibold mt-auto">
                      Комплекс закрыт
                    </div>
                  ) : (
                    <>
                      {dayEvts.slice(0, 3).map((evt, idx) => {
                        const colorClass =
                          evt.type === 'special'
                            ? 'bg-gradient-to-r from-amber-200/80 to-amber-100/60 text-amber-800 border-l-[3px] border-amber-500 shadow-sm'
                            : evt.type === 'paid'
                              ? 'bg-gradient-to-r from-primary/25 to-primary/10 text-primary-dark border-l-[3px] border-primary shadow-sm'
                              : 'bg-gradient-to-r from-emerald-200/80 to-emerald-100/60 text-emerald-800 border-l-[3px] border-emerald-500 shadow-sm';
                        return (
                          <div
                            key={evt.id}
                            className={`text-[9px] sm:text-[11px] leading-tight px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg font-semibold transform transition-all duration-200 group-hover:translate-x-0.5 flex items-center ${colorClass}`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <span className="font-bold text-[8px] sm:text-[10px] whitespace-nowrap shrink-0">{evt.time}</span>
                            <span className="hidden sm:inline ml-1.5 font-medium opacity-90 truncate">
                              {evt.type === 'special' && '🌲 '}
                              {evt.name.length > 12 ? evt.name.slice(0, 12) + '…' : evt.name}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvts.length > 3 && (
                        <span className="text-[11px] text-primary font-bold mt-auto flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                          +{dayEvts.length - 3} ещё
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Hover indicator */}
                {hasEvents && !isExpanded && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Expanded day detail */}
        {expandedDay && expandedEvents.length > 0 && (
          <div ref={scheduleRef} className="mt-10 rounded-3xl bg-gradient-to-br from-white via-surface to-surface-warm border-2 border-primary/30 p-6 md:p-10 shadow-2xl shadow-primary/10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                {getSanitaryNotice(events, new Date(year, month, expandedDay)) && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-600 text-white rounded-full mb-3 mr-2">
                    <X className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Санитарный день</span>
                  </div>
                )}
                {getHoliday(new Date(year, month, expandedDay)) && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-full mb-3 mr-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{getHoliday(new Date(year, month, expandedDay))}</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">Расписание на</span>
                </div>
                <h4 className="font-heading text-3xl font-bold text-text-primary capitalize">
                  {new Date(year, month, expandedDay).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setExpandedDay(null)}
                className="rounded-2xl p-3 bg-gradient-to-br from-surface to-white hover:from-rose-50 hover:to-rose-100 text-text-secondary hover:text-rose-500 transition-all duration-300 shadow-lg hover:shadow-rose-500/20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {expandedEvents.map((event, idx) => (
                <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <EventRow event={event} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10 pt-8 border-t-2 border-gradient-to-r from-transparent via-border to-transparent">
          <span className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl">
            <span className="w-5 h-5 rounded-lg border-l-[3px] border-emerald-500 bg-gradient-to-r from-emerald-200/80 to-emerald-100/60" />
            <span className="text-sm font-semibold text-emerald-700">Бесплатно</span>
          </span>
          <span className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-xl">
            <span className="w-5 h-5 rounded-lg border-l-[3px] border-primary bg-gradient-to-r from-primary/25 to-primary/10" />
            <span className="text-sm font-semibold text-primary-dark">Платно</span>
          </span>
          <span className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl">
            <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="text-sm font-semibold text-emerald-700">Праздник</span>
          </span>
          <span className="flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-xl">
            <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </span>
            <span className="text-sm font-semibold text-orange-700">Сан. день (1-й пн)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Page ---- */

export default function SchedulePage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «schedule» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('schedule');

  const now = new Date();

  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Fetch schedule from WordPress
  const { data: wpSchedule, loading } = useSchedule();

  const scheduleEvents = useMemo(() => mapScheduleData(wpSchedule), [wpSchedule]);
  const hasScheduleEvents = scheduleEvents.length > 0;

  const selectedWeekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const dayEvents = useMemo(() => visibleEventsForDate(scheduleEvents, selectedDate), [scheduleEvents, selectedDate]);
  const selectedSanitaryNotice = useMemo(() => getSanitaryNotice(scheduleEvents, selectedDate), [scheduleEvents, selectedDate]);

  if (loading) {
    return (
      <PageLayout title="Расписание" description="Расписание мероприятий термального комплекса Термбург.">
        <PageHero
          title="Расписание"
          subtitle="Коллективные парения, аквааэробика, йога и другие мероприятия"
          backgroundImage="/images/heroes/schedule.webp"
        />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
        <Section>
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </Section>
      </PageLayout>
    );
  }

  if (!hasScheduleEvents) {
    return (
      <PageLayout title="Расписание" description="Расписание мероприятий термального комплекса Термбург.">
        <PageHero
          title="Расписание"
          subtitle="Коллективные парения, аквааэробика, йога и другие мероприятия"
          backgroundImage="/images/heroes/schedule.webp"
        />
        {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
        <Section>
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface px-6 py-12 text-center">
            <Clock className="w-10 h-10 text-primary/50 mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
              Расписание появится позже
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Мы пока готовим актуальную программу мероприятий. Как только расписание будет опубликовано, оно появится на этой странице.
            </p>
          </div>
        </Section>
      </PageLayout>
    );
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
  }

  function handleDayTab(date: Date) {
    setSelectedDate(date);
  }

  return (
    <PageLayout title="Расписание" description="Расписание мероприятий термального комплекса Термбург.">
      <PageHero
        title="Расписание"
        subtitle="Коллективные парения, аквааэробика, йога и другие мероприятия"
        backgroundImage="/images/heroes/schedule.webp"
      />

      <Section>
        {/* View mode toggle */}
        <div className="flex items-center gap-4 mb-8">
          <div className="inline-flex rounded-xl bg-surface-warm p-1 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
              Неделя
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                viewMode === 'month'
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Месяц
            </button>
          </div>
        </div>

        {/* WEEK MODE — two columns: events + calendar */}
        {viewMode === 'week' && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {selectedWeekDates.map((date) => {
                  const day = getDayNameByDate(date);
                  const isActive = formatDateKey(selectedDate) === formatDateKey(date);
                  const isCurrent = formatDateKey(now) === formatDateKey(date);
                  return (
                    <button
                      key={formatDateKey(date)}
                      type="button"
                      onClick={() => handleDayTab(date)}
                      className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : isCurrent
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-surface-warm text-text-secondary hover:text-text-primary hover:bg-surface'
                      }`}
                    >
                      {dayShortNames[day]}
                      <span className="ml-1 text-[10px] opacity-60">{date.getDate()}</span>
                      {isCurrent && !isActive && (
                        <span className="ml-1 text-[10px] opacity-60">(сегодня)</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-text-secondary mb-4">
                {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              {selectedSanitaryNotice ? (
                <div className="rounded-2xl border border-orange-300 bg-orange-50 p-6 text-orange-800">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5" />
                    <div>
                      <p className="font-heading text-lg font-bold">Санитарный день</p>
                      <p className="mt-1 text-sm">{selectedSanitaryNotice}</p>
                    </div>
                  </div>
                </div>
              ) : dayEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {dayEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Clock className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                  <p className="text-text-secondary">Нет мероприятий в этот день</p>
                </div>
              )}
            </div>

            <div className="lg:w-[320px] flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <CalendarPanel
                  events={scheduleEvents}
                  year={calYear}
                  month={calMonth}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                />
              </div>
            </div>
          </div>
        )}

        {/* MONTH MODE — full-width big calendar */}
        {viewMode === 'month' && (
          <FullMonthCalendar
            events={scheduleEvents}
            year={calYear}
            month={calMonth}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        )}
      </Section>

      {/* Bottom legend (week mode only) */}
      {viewMode === 'week' && (
        <section className="border-t border-border bg-surface-warm py-8">
          <Container>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
                Бесплатно &mdash; включено в посещение
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40" />
                Платно &mdash; нажмите для покупки
              </span>
            </div>
          </Container>
        </section>
      )}
    </PageLayout>
  );
}
