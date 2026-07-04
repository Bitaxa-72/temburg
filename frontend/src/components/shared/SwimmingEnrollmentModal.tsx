import { useState } from 'react';
import { X, Waves, Phone, CheckCircle, Calendar, Clock, User, Users } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import LegalConsents from '@/components/shared/LegalConsents';

const scheduleOptions = [
  { id: 'friday', label: 'Пятница 16:00' },
  { id: 'sunday', label: 'Воскресенье 10:00' },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

export default function SwimmingEnrollmentModal() {
  const { swimmingEnrollmentOpen, swimmingEnrollmentItem, closeModal } = useBooking();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [schedule, setSchedule] = useState(scheduleOptions[0].id);
  const [comment, setComment] = useState('');

  if (!swimmingEnrollmentOpen || !swimmingEnrollmentItem) return null;

  const handleSubmit = () => {
    // Simulate form submission
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setChildName('');
    setChildAge('');
    setParentName('');
    setPhone('');
    setSchedule(scheduleOptions[0].id);
    setComment('');
    closeModal();
  };

  const isValid = childName.trim() && childAge && parentName.trim() && phone.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-info/90 to-info p-6 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white hover:bg-black/30 transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">Запись в школу плавания</h2>
              <p className="text-white/80 text-sm">{swimmingEnrollmentItem.programName}</p>
            </div>
          </div>
        </div>

        {step === 'form' ? (
          <div className="p-6 space-y-5">
            {/* Child Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4" />
                Данные ребёнка
              </h3>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Имя ребёнка *</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Как зовут ребёнка"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-info/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Возраст *</label>
                <select
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary focus:outline-none focus:border-info/50 transition-colors"
                >
                  <option value="">Выберите возраст</option>
                  {[6, 7, 8, 9, 10, 11, 12].map((age) => (
                    <option key={age} value={age}>{age} лет</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parent Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" />
                Контактные данные родителя
              </h3>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Ваше имя *</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Имя родителя или опекуна"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-info/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Телефон *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-info/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Предпочтительное расписание
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {scheduleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSchedule(opt.id)}
                    className={`rounded-lg border py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      schedule === opt.id
                        ? 'border-info bg-info/10 text-info'
                        : 'border-border bg-surface text-text-primary hover:border-info/30'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Комментарий (необязательно)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Умеет ли ребёнок плавать, есть ли противопоказания..."
                rows={3}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-info/50 transition-colors resize-none"
              />
            </div>

            {/* Price */}
            <div className="rounded-xl bg-info/5 border border-info/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Стоимость программы</p>
                <p className="font-heading text-2xl font-bold text-info">
                  {swimmingEnrollmentItem.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <Waves className="h-10 w-10 text-info/20" />
            </div>

            <LegalConsents />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full rounded-xl px-6 py-4 text-base font-semibold transition-colors ${
                isValid
                  ? 'bg-info text-white hover:bg-info/90'
                  : 'bg-border text-text-secondary cursor-not-allowed'
              }`}
            >
              Записаться на занятия
            </button>

            <p className="text-xs text-text-secondary/70 text-center">
              Мы свяжемся с вами для подтверждения записи в течение дня
            </p>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary">Заявка отправлена!</h3>
            <p className="text-text-secondary">
              Мы свяжемся с вами в ближайшее время для подтверждения записи {childName} в группу по плаванию.
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-info px-6 py-3 text-base font-semibold text-white hover:bg-info/90 transition-colors"
              >
                Отлично!
              </button>
              <p className="text-sm text-text-secondary">
                Есть вопросы? Звоните:{' '}
                <a href="tel:+79091674746" className="text-info hover:underline font-medium">
                  +7 (909) 167-47-46
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
