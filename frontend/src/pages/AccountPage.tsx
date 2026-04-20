import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserCircle,
  CreditCard,
  History,
  Star,
  Edit3,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  LogOut,
  Settings,
  Plus,
  Trash2,
  Save,
  Mail,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import { getEmployeesOfMonth, saveEmployeesOfMonth, type Employee, defaultEmployeesOfMonth } from '@/data/employees';
import { useAuth, useRequireAuth } from '@/context/AuthContext';
import { bookingsApi, type Booking, type BookingStatus } from '@/services/api';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */


function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

const tabs = [
  { id: 'profile', label: 'Профиль', icon: UserCircle },
  { id: 'bookings', label: 'Мои заказы', icon: CreditCard },
  // { id: 'bonus', label: 'Бонусы', icon: Star }, // Hidden: bonus program not yet active
  { id: 'admin', label: 'Админ', icon: Settings },
] as const;

type TabId = (typeof tabs)[number]['id'] | 'bonus';

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  CANCELLED: 'Отменён',
  COMPLETED: 'Завершён',
  NO_SHOW: 'Не явился',
};

const statusVariants: Record<BookingStatus, 'default' | 'success' | 'gold'> = {
  PENDING: 'gold',
  CONFIRMED: 'success',
  CANCELLED: 'default',
  COMPLETED: 'success',
  NO_SHOW: 'default',
};

function NewsletterSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(() => {
    const stored = localStorage.getItem('termburg_newsletter_subscribed');
    return stored ? JSON.parse(stored) : false;
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
    const stored = localStorage.getItem('termburg_newsletter_options');
    return stored ? JSON.parse(stored) : [];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const options = [
    { id: 'promotions', label: 'Акции и специальные предложения' },
    { id: 'news', label: 'Новости и события' },
    { id: 'maintenance', label: 'Информация о технических работах' },
  ];

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('termburg_newsletter_subscribed', JSON.stringify(isSubscribed));
    localStorage.setItem('termburg_newsletter_options', JSON.stringify(selectedOptions));

    setSaveMessage('Настройки сохранены');
    setTimeout(() => {
      setSaveMessage('');
      setIsSaving(false);
    }, 2000);
  };

  return (
    <div className="rounded-2xl bg-surface border border-border/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Подписка на рассылку</h3>
          <p className="text-sm text-text-secondary">Получайте информацию об акциях, скидках и новостях</p>
        </div>
      </div>

      {/* Subscribe toggle */}
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsSubscribed(!isSubscribed)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
            isSubscribed ? 'bg-primary' : 'bg-border/30'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isSubscribed ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-text-primary">
          {isSubscribed ? 'Подписка активна' : 'Подписка неактивна'}
        </span>
      </div>

      {/* Options */}
      {isSubscribed && (
        <div className="mb-5 space-y-3">
          <p className="text-sm text-text-secondary font-medium">Выберите интересующие вас новости:</p>
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => handleOptionToggle(option.id)}
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                  selectedOptions.includes(option.id)
                    ? 'bg-primary border-primary'
                    : 'border-border/50 hover:border-border'
                }`}
              >
                {selectedOptions.includes(option.id) && (
                  <Check className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <span className="text-sm text-text-primary">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Save button & Message */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          Сохранить
        </button>

        {saveMessage && (
          <div className="inline-flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}

const termlinAvatars = [
  { id: 'yaromir', name: 'Банник Яромир', image: '/images/termliny/yaromir.webp', pos: 'center 25%' },
  { id: 'valkiriya', name: 'Валькирия', image: '/images/termliny/valkiriya.webp', pos: 'center 20%' },
  { id: 'pereslav', name: 'Домовой Переслав', image: '/images/termliny/pereslav.webp', pos: 'center 8%' },
  { id: 'kazimir', name: 'Дворовой Казимир', image: '/images/termliny/kazimir.webp', pos: 'center 10%' },
  { id: 'vedagor', name: 'Кот Ведагор', image: '/images/termliny/vedagor.webp', pos: 'center 20%' },
  { id: 'milovan', name: 'Кот Милован', image: '/images/termliny/milovan.webp', pos: '25% center' },
  { id: 'lelya', name: 'Берегиня Леля', image: '/images/termliny/lelya.webp', pos: 'center 10%' },
];

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('termburg_avatar') || 'yaromir';
  });

  const currentAvatar = termlinAvatars.find(a => a.id === selectedAvatar) || termlinAvatars[0];

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem('termburg_avatar', avatarId);
    setShowAvatarPicker(false);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : '';

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name: editName, phone: editPhone });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          className="relative h-20 w-20 rounded-full overflow-hidden border-3 border-primary/30 hover:border-primary/60 transition-all flex-shrink-0 group"
          title="Выбрать аватарку"
        >
          <img src={currentAvatar.image} alt={currentAvatar.name} className="w-full h-full object-cover" style={{ objectPosition: currentAvatar.pos }} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{user?.name || 'Гость'}</h2>
          <p className="text-sm text-text-secondary">Участник с {memberSince}</p>
          <p className="text-xs text-primary/70 mt-1">Дух-хранитель: {currentAvatar.name}</p>
        </div>
      </div>

      {/* Avatar Picker */}
      {showAvatarPicker && (
        <div className="rounded-2xl bg-surface-warm border border-border/50 p-5">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Выберите духа-хранителя</h3>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {termlinAvatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleAvatarSelect(avatar.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                  selectedAvatar === avatar.id
                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20'
                    : 'border-2 border-transparent hover:bg-surface hover:border-border'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" style={{ objectPosition: avatar.pos }} />
                </div>
                <span className="text-[10px] text-text-secondary text-center leading-tight">{avatar.name.split(' ').pop()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info fields / Edit form */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Имя</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Телефон</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(formatPhone(e.target.value))}
              placeholder="+7 (___) ___-__-__"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-warm transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-surface-warm border border-border/30 p-4">
              <p className="text-xs text-text-secondary mb-1">Телефон</p>
              <p className="text-sm font-medium text-text-primary">{user?.phone || 'Не указан'}</p>
            </div>
            <div className="rounded-xl bg-surface-warm border border-border/30 p-4">
              <p className="text-xs text-text-secondary mb-1">Email</p>
              <p className="text-sm font-medium text-text-primary">{user?.email}</p>
            </div>
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Редактировать профиль
          </button>
        </>
      )}

      {/* Newsletter Subscription */}
      <NewsletterSubscription />
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('termburg_token');
      const res = await fetch('/wp-json/termburg/v1/checkout/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const orders = await res.json();
      const mapped = (Array.isArray(orders) ? orders : []).map((o: any) => ({
        id: String(o.orderId),
        userId: '',
        serviceType: 'PACKAGE' as const,
        serviceName: o.items?.[0]?.name || 'Заказ',
        date: o.dateCreated || '',
        time: '',
        guests: 1,
        duration: 0,
        totalPrice: parseFloat(o.total) || 0,
        status: (o.status === 'completed' ? 'COMPLETED' : o.status === 'processing' ? 'CONFIRMED' : o.status === 'cancelled' ? 'CANCELLED' : 'PENDING') as BookingStatus,
        createdAt: o.dateCreated || '',
        updatedAt: o.dateCreated || '',
      }));
      setBookings(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки заказов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (_bookingId: string) => {
    alert('Для отмены заказа свяжитесь с администрацией: +7 (909) 167-47-46');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadBookings}
          className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Повторить
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text-primary mb-2">Нет заказов</h3>
        <p className="text-text-secondary mb-6">У вас пока нет оформленных заказов</p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-light transition-colors"
        >
          Выбрать услугу
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={loadBookings}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Обновить
        </button>
      </div>

      {/* Bookings list */}
      {bookings.map((booking) => {
        const bookingDate = new Date(booking.date);
        const isPast = bookingDate < new Date();
        const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

        return (
          <div
            key={booking.id}
            className={`rounded-2xl border p-5 transition-colors ${
              booking.status === 'CANCELLED' || isPast
                ? 'bg-surface-warm/50 border-border/30 opacity-70'
                : 'bg-surface border-primary/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text-primary">{booking.serviceName}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Calendar className="h-4 w-4" />
                    {bookingDate.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="h-4 w-4" />
                    {booking.time}
                  </div>
                </div>
              </div>
              <Badge variant={statusVariants[booking.status]}>
                {statusLabels[booking.status]}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-primary">
                  {booking.totalPrice.toLocaleString('ru-RU')} ₽
                </span>
                {booking.guests > 1 && (
                  <span className="text-sm text-text-secondary">
                    {booking.guests} {booking.guests > 4 ? 'гостей' : 'гостя'}
                  </span>
                )}
              </div>

              {canCancel && !isPast && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Отменить
                </button>
              )}

              {booking.payment && (
                <div className="flex items-center gap-1.5 text-sm">
                  {booking.payment.status === 'SUCCEEDED' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-success">Оплачено</span>
                    </>
                  ) : booking.payment.status === 'PENDING' ? (
                    <>
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600">Ожидает оплаты</span>
                    </>
                  ) : booking.payment.status === 'CANCELED' ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-500">Отменён</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Link
        to="/pricing"
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-colors"
      >
        <Plus className="h-4 w-4" />
        Оформить новый заказ
      </Link>
    </div>
  );
}

function BonusTab() {
  // TODO: Connect to real bonus API
  const bonusPoints = 0;
  const level = 'Новичок';
  const nextLevel = 'Серебряный';
  const progress = 0;

  return (
    <div className="space-y-6">
      {/* Points balance */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 text-center">
        <Award className="h-10 w-10 text-primary mx-auto mb-3" />
        <p className="text-sm text-text-secondary mb-1">Ваши бонусные баллы</p>
        <p className="text-4xl font-bold text-primary">
          {bonusPoints.toLocaleString('ru-RU')}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          1 балл = 1 ₽ при оплате услуг
        </p>
      </div>

      {/* Level progress */}
      <div className="rounded-2xl bg-surface border border-border/30 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-text-secondary">Текущий уровень</p>
            <p className="text-lg font-bold text-text-primary">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Следующий уровень</p>
            <p className="text-lg font-bold text-primary">{nextLevel}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 rounded-full bg-surface-warm overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-2 text-center">
          {progress}% до уровня «{nextLevel}»
        </p>
      </div>

      {/* How to earn */}
      <div className="rounded-2xl bg-surface-warm border border-border/30 p-6">
        <h3 className="font-bold text-text-primary mb-3">Как получить баллы</h3>
        <ul className="space-y-2.5 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong className="text-text-primary">5%</strong> от стоимости каждого посещения</span>
          </li>
          <li className="flex items-start gap-2">
            <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong className="text-text-primary">500 баллов</strong> за покупку абонемента</span>
          </li>
          <li className="flex items-start gap-2">
            <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong className="text-text-primary">200 баллов</strong> за день рождения</span>
          </li>
          <li className="flex items-start gap-2">
            <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong className="text-text-primary">100 баллов</strong> за приглашённого друга</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function AdminTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: '',
    description: '',
    quote: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEmployees(getEmployeesOfMonth());
  }, []);

  const handleAdd = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...formData,
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    saveEmployeesOfMonth(updated);
    setFormData({ name: '', role: '', description: '', quote: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      role: emp.role,
      description: emp.description,
      quote: emp.quote,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = employees.map((emp) =>
      emp.id === editingId ? { ...emp, ...formData } : emp
    );
    setEmployees(updated);
    saveEmployeesOfMonth(updated);
    setEditingId(null);
    setFormData({ name: '', role: '', description: '', quote: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = employees.filter((emp) => emp.id !== id);
    setEmployees(updated);
    saveEmployeesOfMonth(updated);
  };

  const handleReset = () => {
    setEmployees(defaultEmployeesOfMonth);
    saveEmployeesOfMonth(defaultEmployeesOfMonth);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', role: '', description: '', quote: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Сотрудники месяца</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-text-secondary hover:text-primary transition-colors"
        >
          Сбросить к начальным
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">
          <Save className="h-4 w-4" />
          Изменения сохранены
        </div>
      )}

      {/* Employee list */}
      <div className="space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="rounded-xl bg-surface border border-border/30 p-4"
          >
            {editingId === emp.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Имя сотрудника"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Должность"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="За что награда"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-warm transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-text-primary">{emp.name}</h3>
                  <p className="text-sm text-primary">{emp.role}</p>
                  <p className="text-xs text-text-secondary mt-1">{emp.description}</p>
                  <p className="text-xs text-text-secondary italic mt-1">«{emp.quote}»</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(emp)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-surface-warm hover:text-primary transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(emp.id)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new employee form */}
      {!editingId && (
        <div className="rounded-xl bg-surface-warm border border-border/30 p-4 space-y-3">
          <h3 className="font-medium text-text-primary flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Добавить сотрудника
          </h3>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Имя сотрудника"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Должность"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Описание"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={formData.quote}
            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
            placeholder="За что награда"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!formData.name || !formData.role}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «account» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('account');

  const { isLoading } = useRequireAuth();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for payment success
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setActiveTab('bookings');
      // Clean up URL
      navigate('/account', { replace: true });
    }
  }, [searchParams, navigate]);

  // Filter tabs based on user role
  const visibleTabs = tabs.filter((tab) => {
    if (tab.id === 'admin') {
      return user?.role === 'ADMIN';
    }
    return true;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'bookings': return <BookingsTab />;
      case 'bonus': return <BonusTab />;
      case 'admin': return <AdminTab />;
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Личный кабинет" description="Управление заказами, историей посещений и бонусной программой Термбурга.">
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Личный кабинет" description="Управление заказами, историей посещений и бонусной программой Термбурга.">
      {/* Compact hero */}
      <section className="relative bg-dark-surface ornament-pattern py-10 md:py-14">
        <div className="gold-separator absolute bottom-0 left-0 right-0" />
        <Container>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl text-center">
            Личный кабинет
          </h1>
        </Container>
      </section>

      <section className="bg-background section-padding">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar tabs */}
            <aside className="lg:w-60 flex-shrink-0">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:bg-surface-warm hover:text-text-primary'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {tab.label}
                    </button>
                  );
                })}

                {/* Logout */}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors mt-auto lg:mt-4"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Выйти
                </button>
              </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              {renderContent()}
            </main>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
