import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { useSchedule } from '@/hooks/useWordPressData';
import { mapScheduleData } from '@/utils/scheduleData';

function getCurrentDayName(): string {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[new Date().getDay()];
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSanitaryScheduleEvent(event: { type?: string; closed?: boolean; sanitaryDay?: boolean }): boolean {
  return event.type === 'closed' || Boolean(event.closed) || Boolean(event.sanitaryDay);
}

const SchedulePreviewSection = memo(function SchedulePreviewSection() {
  const { openPurchase } = useBooking();
  const navigate = useNavigate();
  const { data: wpSchedule, loading } = useSchedule();
  const scheduleEvents = mapScheduleData(wpSchedule);
  const todayName = getCurrentDayName();
  const today = formatDateKey(new Date());
  const todayEvents = scheduleEvents.filter((e) => e.date ? e.date === today : Array.isArray(e.day) && e.day.includes(todayName));
  const sanitaryEvent = todayEvents.find(isSanitaryScheduleEvent);
  const previewEvents = todayEvents.filter((event) => !isSanitaryScheduleEvent(event));

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-full">
      <h3 className="font-heading text-2xl font-bold text-white mb-4">
        Расписание на сегодня
      </h3>
      <div className="space-y-2.5 flex-1">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Загружаем расписание...
          </div>
        ) : sanitaryEvent ? (
          <div className="rounded-xl border border-orange-400/40 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-100">
            <p className="font-bold">Санитарный день</p>
            <p className="mt-1 text-orange-100/80">{sanitaryEvent.description || sanitaryEvent.name}</p>
          </div>
        ) : previewEvents.length > 0 ? previewEvents.map((event) => {
          const hasPrice = Number(event.price) > 0;
          const isPaid = event.type === 'paid' || hasPrice;
          const isSpecial = event.type === 'special' || Boolean(event.highlight);
          const canPurchase = hasPrice;
          return (
            <div
              key={event.id}
              className={`flex items-center gap-3 rounded-xl p-3 sm:p-4 transition-all cursor-pointer overflow-hidden ${
                isSpecial
                  ? 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10'
              }`}
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
                } else {
                  navigate('/schedule');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="min-w-[52px] text-center border-r-2 border-primary/40 pr-3">
                <span className={`font-heading text-lg font-bold ${isSpecial ? 'text-amber-400' : 'text-primary'}`}>
                  {event.time}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm truncate ${isSpecial ? 'text-amber-300' : 'text-white'}`}>
                  {isSpecial && '🌲 '}
                  {event.name}
                </h4>
                <p className="text-xs text-white/50">{event.duration}</p>
              </div>
              {canPurchase ? (
                <span className="flex items-center gap-1 text-sm font-bold text-primary flex-shrink-0">
                  {event.price} &#8381;
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </span>
              ) : isPaid ? (
                <span className="text-xs text-white/40 font-medium flex-shrink-0">
                  Скоро
                </span>
              ) : (
                <span className="text-xs text-emerald-400 font-medium flex-shrink-0">
                  Бесплатно
                </span>
              )}
            </div>
          );
        }) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">
            Расписание появится позже. Мы готовим актуальную программу мероприятий и опубликуем ее здесь.
          </div>
        )}
      </div>

      <div className="mt-5 text-center">
        <Link
          to="/schedule"
          className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors"
        >
          Полное расписание
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
});

export default SchedulePreviewSection;
