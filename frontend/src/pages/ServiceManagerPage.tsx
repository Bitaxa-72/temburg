import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Lock, Minus, Plus, Scissors, ShieldCheck, Sparkles, UserRound, Waves } from 'lucide-react';
import { getApiUrl, type WPService, type WPServicesResponse } from '@/api/wordpress';
import { getServiceReservedHours } from '@/utils/serviceBooking';

type ServiceSection = 'massage' | 'spa' | 'steaming';
type BookingSource = 'site' | 'manual';

interface ServiceOption {
  id: string;
  section: ServiceSection;
  name: string;
  durationHours: number;
  price: number;
}

interface MasterShift {
  id: string;
  date: string;
  section: ServiceSection;
  name: string;
  startHour: number;
  endHour: number;
}

interface ServiceBooking {
  id: string;
  manualId?: number;
  date: string;
  section: ServiceSection;
  startHour: number;
  hours: number;
  serviceName: string;
  customerName: string;
  phone: string;
  source: BookingSource;
  orderNumber?: string;
  note?: string;
}

interface ManualBookingDraft {
  serviceId: string;
  customerName: string;
  phone: string;
  note: string;
}

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const shiftHourOptions = Array.from({ length: 16 }, (_, index) => index + 8);
const serviceBookingsRefreshMs = 30000;
const serviceBookingsTimeoutMs = 25000;
const managerSessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const managerSessionKey = 'termburg-service-manager-session';
const moscowApiOrigin = 'https://termburg.ru';

const sections: Array<{ id: ServiceSection; label: string; icon: typeof Scissors }> = [
  { id: 'massage', label: 'Массаж', icon: Scissors },
  { id: 'spa', label: 'SPA', icon: Sparkles },
  { id: 'steaming', label: 'Парения', icon: Waves },
];

interface ServiceSlotsResponse {
  workingHours?: {
    startHour?: number;
    endHour?: number;
  };
  slots?: Array<{
    hour?: number;
    bookingCount?: number;
    bookings?: Array<{
      id?: number | string;
      orderId?: number | string;
      orderNumber?: number | string;
      serviceName?: string;
      label?: string;
      customerName?: string;
      phone?: string;
      source?: BookingSource;
      manualId?: number | string;
      note?: string;
      startHour?: number;
      hours?: number;
    }>;
  }>;
}

interface ServiceManagerWeekDay {
  date?: string;
  shifts?: Array<{
    id?: number | string;
    name?: string;
    startHour?: number;
    endHour?: number;
  }>;
  slots?: ServiceSlotsResponse['slots'];
}

interface ServiceManagerWeekResponse {
  workingHours?: {
    startHour?: number;
    endHour?: number;
  };
  days?: ServiceManagerWeekDay[];
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date);
}

function formatWeekRange(dates: Date[]) {
  return `${formatDateShort(dates[0])} - ${formatDateShort(dates[6])}`;
}

function getMonday(date: Date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() - (day === 0 ? 6 : day - 1));
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatRussianPhoneInput(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }
  if (!digits.startsWith('7')) {
    digits = `7${digits}`;
  }
  digits = digits.slice(0, 11);

  const local = digits.slice(1);
  const area = local.slice(0, 3);
  const first = local.slice(3, 6);
  const second = local.slice(6, 8);
  const third = local.slice(8, 10);

  let formatted = '+7';
  if (area) formatted += ` (${area}`;
  if (area.length === 3) formatted += ')';
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;

  return formatted;
}

function getStoredManagerSession() {
  try {
    const raw = localStorage.getItem(managerSessionKey);
    if (!raw) return { authorized: false, token: '' };

    const data = JSON.parse(raw) as { token?: string; expiresAt?: number };
    if (!data.token || !data.expiresAt || Date.now() > data.expiresAt) {
      localStorage.removeItem(managerSessionKey);
      return { authorized: false, token: '' };
    }

    return { authorized: true, token: data.token };
  } catch {
    localStorage.removeItem(managerSessionKey);
    return { authorized: false, token: '' };
  }
}

function saveManagerSession(token: string) {
  localStorage.setItem(managerSessionKey, JSON.stringify({
    token,
    expiresAt: Date.now() + managerSessionTtlMs,
  }));
}

function apiUrlVariants(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return [url];
  }

  const absolutePath = url.startsWith('/') ? url : `/${url}`;
  return [url, `${moscowApiOrigin}${absolutePath}`];
}

function bookingOverlaps(hour: number, hours: number, booking: ServiceBooking) {
  return hour < booking.startHour + booking.hours && booking.startHour < hour + hours;
}

function seedMasterShifts(weekStart: Date): MasterShift[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = formatDateKey(addDays(weekStart, index));
    return [
      { id: makeId(`master-${index}-massage-1`), date, section: 'massage' as ServiceSection, name: 'По умолчанию', startHour: 9, endHour: 23 },
      { id: makeId(`master-${index}-spa-1`), date, section: 'spa' as ServiceSection, name: 'По умолчанию', startHour: 9, endHour: 23 },
      { id: makeId(`master-${index}-steam-1`), date, section: 'steaming' as ServiceSection, name: 'По умолчанию', startHour: 9, endHour: 23 },
    ];
  }).flat();
}

function serviceCategoryToSection(category: string): ServiceSection | null {
  if (category === 'massage') return 'massage';
  if (category === 'spa') return 'spa';
  if (category === 'steam') return 'steaming';
  return null;
}

function normalizeWpServices(data: WPServicesResponse | null): ServiceOption[] {
  if (!data) return [];

  return Object.entries(data).flatMap(([category, group]) => {
    const section = serviceCategoryToSection(category);
    if (!section || !Array.isArray(group?.items)) return [];

    return group.items
      .filter((service): service is WPService => Boolean(service?.name))
      .map((service) => ({
        id: String(service.slug || service.id || service.name),
        section,
        name: service.name,
        durationHours: getServiceReservedHours(service.duration || ''),
        price: Number(service.price) || 0,
      }));
  });
}

function fetchServiceSlots(url: string, token = '', init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), serviceBookingsTimeoutMs);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  const cleanToken = token.trim();

  if (cleanToken !== '') {
    headers['X-Termburg-Manager-Token'] = cleanToken;
  }

  const urls = apiUrlVariants(url);
  const request = (index: number): Promise<Response> => fetch(urls[index], {
    ...init,
    headers,
    signal: controller.signal,
  }).then((response) => {
    if (response.ok || index >= urls.length - 1) {
      return response;
    }
    return request(index + 1);
  }).catch((error) => {
    if (index >= urls.length - 1) {
      throw error;
    }
    return request(index + 1);
  });

  return request(0).finally(() => window.clearTimeout(timer));
}

function parseServiceSlotBookings(date: string, section: ServiceSection, data: ServiceSlotsResponse): ServiceBooking[] {
  const bookings: ServiceBooking[] = [];

  (data.slots || []).forEach((slot) => {
    const hour = Number(slot.hour);
    if (!Number.isFinite(hour)) return;

    const detailedBookings = Array.isArray(slot.bookings) ? slot.bookings : [];
    if (detailedBookings.length > 0) {
      detailedBookings.forEach((booking, index) => {
        const source = booking.source === 'manual' ? 'manual' : 'site';
        bookings.push({
          id: `${source}-${date}-${hour}-${booking.id || booking.orderId || booking.manualId || index}`,
          manualId: booking.manualId ? Number(booking.manualId) : undefined,
          date,
          section,
          startHour: Number(booking.startHour) || hour,
          hours: Math.max(1, Number(booking.hours) || 1),
          serviceName: String(booking.serviceName || booking.label || 'Запись с сайта'),
          customerName: String(booking.customerName || 'Клиент с сайта'),
          phone: String(booking.phone || ''),
          source,
          orderNumber: booking.orderNumber ? String(booking.orderNumber) : undefined,
          note: booking.note ? String(booking.note) : undefined,
        });
      });
      return;
    }

    const count = Math.max(0, Number(slot.bookingCount) || 0);
    for (let index = 0; index < count; index += 1) {
      bookings.push({
        id: `site-${date}-${hour}-${index}`,
        date,
        section,
        startHour: hour,
        hours: 1,
        serviceName: 'Запись с сайта',
        customerName: 'Занято на сайте',
        phone: '',
        source: 'site',
      });
    }
  });

  return bookings;
}

function normalizeWeekShifts(date: string, section: ServiceSection, shifts: ServiceManagerWeekDay['shifts']): MasterShift[] {
  if (!Array.isArray(shifts)) return [];

  return shifts
    .map((shift, index) => ({
      id: String(shift.id || `shift-${date}-${section}-${index}`),
      date,
      section,
      name: String(shift.name || ''),
      startHour: Number(shift.startHour),
      endHour: Number(shift.endHour),
    }))
    .filter((shift) => shift.name.trim() !== '' && Number.isFinite(shift.startHour) && Number.isFinite(shift.endHour) && shift.endHour > shift.startHour);
}

export default function ServiceManagerPage() {
  const initialWeek = useMemo(() => getMonday(new Date()), []);
  const [storedSession] = useState(() => getStoredManagerSession());
  const [authorized, setAuthorized] = useState(storedSession.authorized);
  const [token, setToken] = useState(storedSession.token);
  const [tokenError, setTokenError] = useState('');
  const [weekStart, setWeekStart] = useState(initialWeek);
  const [activeSection, setActiveSection] = useState<ServiceSection>('massage');
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [masterShifts, setMasterShifts] = useState<MasterShift[]>(() => seedMasterShifts(initialWeek));
  const [siteBookings, setSiteBookings] = useState<ServiceBooking[]>([]);
  const [manualBookings, setManualBookings] = useState<ServiceBooking[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [serviceOptionsError, setServiceOptionsError] = useState('');
  const [bookingsError, setBookingsError] = useState('');
  const [serviceStartHour, setServiceStartHour] = useState(9);
  const [serviceEndHour, setServiceEndHour] = useState(23);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterStart, setNewMasterStart] = useState(10);
  const [newMasterEnd, setNewMasterEnd] = useState(22);
  const [bookingTarget, setBookingTarget] = useState<{ date: string; hour: number } | null>(null);
  const [manualDraft, setManualDraft] = useState<ManualBookingDraft>({
    serviceId: 'massage-classic-60',
    customerName: '',
    phone: '',
    note: '',
  });
  const [manualError, setManualError] = useState('');
  const [savingError, setSavingError] = useState('');

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );
  const serviceHours = useMemo(
    () => Array.from({ length: Math.max(0, serviceEndHour - serviceStartHour) }, (_, index) => serviceStartHour + index),
    [serviceStartHour, serviceEndHour]
  );
  const bookings = useMemo(
    () => [...siteBookings, ...manualBookings],
    [siteBookings, manualBookings]
  );
  const sectionServices = serviceOptions.filter((service) => service.section === activeSection);
  const activeSectionLabel = sections.find((section) => section.id === activeSection)?.label ?? '';
  const selectedDayShifts = masterShifts.filter((shift) => shift.date === selectedDate && shift.section === activeSection);

  useEffect(() => {
    let cancelled = false;

    fetchServiceSlots(getApiUrl('/services-list'))
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('services'))))
      .then((data: WPServicesResponse) => {
        if (cancelled) return;
        const options = normalizeWpServices(data);
        setServiceOptions(options);
        setServiceOptionsError('');
      })
      .catch(() => {
        if (!cancelled) {
          setServiceOptions([]);
          setServiceOptionsError('Не удалось загрузить услуги из админки');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const firstService = serviceOptions.find((service) => service.section === activeSection);
    setManualDraft((draft) => (
      firstService && draft.serviceId !== firstService.id
        ? { ...draft, serviceId: firstService.id }
        : draft
    ));
  }, [activeSection, serviceOptions]);

  useEffect(() => {
    let cancelled = false;

    const applyWorkingHours = (data: { workingHours?: { startHour?: number; endHour?: number } }) => {
      const startHour = Number(data.workingHours?.startHour);
      const endHour = Number(data.workingHours?.endHour);
      if (Number.isFinite(startHour) && Number.isFinite(endHour) && endHour > startHour) {
        setServiceStartHour(startHour);
        setServiceEndHour(endHour);
      }
    };

    const loadBookingsByDay = () => {
      weekDates.forEach((date) => {
        const key = formatDateKey(date);
        const params = new URLSearchParams({
          date: key,
          hours: '1',
          section: activeSection,
        });

        fetchServiceSlots(getApiUrl(`/checkout/service-slots?${params.toString()}`), token)
          .then((response) => (response.ok ? response.json() : Promise.reject(new Error('slots'))))
          .then((data: ServiceSlotsResponse) => {
            if (cancelled) return;
            applyWorkingHours(data);

            const loadedBookings = parseServiceSlotBookings(key, activeSection, data);
            setSiteBookings((items) => [
              ...items.filter((booking) => booking.date !== key || booking.section !== activeSection),
              ...loadedBookings,
            ]);
            setBookingsError('');
          })
          .catch(() => {
            if (!cancelled) {
              setBookingsError('');
            }
          });
      });
    };

    const loadBookings = () => {
      const params = new URLSearchParams({
        from: formatDateKey(weekStart),
        section: activeSection,
      });

      fetchServiceSlots(getApiUrl(`/service-manager/week?${params.toString()}`), token)
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('week'))))
        .then((data: ServiceManagerWeekResponse) => {
          if (cancelled) return;
          applyWorkingHours(data);

          const loadedDates = new Set<string>();
          const loadedBookings: ServiceBooking[] = [];

          const loadedShifts: MasterShift[] = [];

          (data.days || []).forEach((day) => {
            const key = typeof day.date === 'string' ? day.date : '';
            if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
            loadedDates.add(key);
            loadedShifts.push(...normalizeWeekShifts(key, activeSection, day.shifts || []));
            loadedBookings.push(...parseServiceSlotBookings(key, activeSection, { slots: day.slots || [] }));
          });

          if (loadedDates.size === 0) {
            loadBookingsByDay();
            return;
          }

          setMasterShifts((items) => [
            ...items.filter((shift) => !loadedDates.has(shift.date) || shift.section !== activeSection),
            ...loadedShifts,
          ]);
          setSiteBookings((items) => [
            ...items.filter((booking) => !loadedDates.has(booking.date) || booking.section !== activeSection),
            ...loadedBookings.filter((booking) => booking.source === 'site'),
          ]);
          setManualBookings((items) => [
            ...items.filter((booking) => !loadedDates.has(booking.date) || booking.section !== activeSection),
            ...loadedBookings.filter((booking) => booking.source === 'manual'),
          ]);
          setBookingsError('');
        })
        .catch(() => {
          if (!cancelled) {
            loadBookingsByDay();
          }
        });
    };

    loadBookings();
    const timer = window.setInterval(loadBookings, serviceBookingsRefreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeSection, token, weekDates, weekStart]);

  const getCapacity = (date: string, hour: number) => masterShifts.filter((shift) => (
    shift.date === date
    && shift.section === activeSection
    && shift.startHour <= hour
    && shift.endHour > hour
  )).length;

  const getHourBookings = (date: string, hour: number) => bookings.filter((booking) => (
    booking.date === date
    && booking.section === activeSection
    && bookingOverlaps(hour, 1, booking)
  ));

  const canPlaceBooking = (date: string, hour: number, hours: number) => {
    for (let offset = 0; offset < hours; offset += 1) {
      const currentHour = hour + offset;
      const capacity = getCapacity(date, currentHour);
      const used = getHourBookings(date, currentHour).length;
      if (capacity <= 0 || used >= capacity) {
        return false;
      }
    }
    return true;
  };

  const saveDayShifts = (date: string, section: ServiceSection, shifts: MasterShift[]) => {
    fetchServiceSlots(getApiUrl('/service-manager/shifts'), token, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        section,
        shifts: shifts.map((shift) => ({
          name: shift.name,
          startHour: shift.startHour,
          endHour: shift.endHour,
        })),
      }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((data) => Promise.reject(data))))
      .then((data: { shifts?: MasterShift[] }) => {
        const savedShifts = data.shifts;
        if (Array.isArray(savedShifts)) {
          setMasterShifts((items) => [
            ...items.filter((shift) => shift.date !== date || shift.section !== section),
            ...savedShifts.map((shift) => ({
              ...shift,
              id: String(shift.id),
              date,
              section,
            })),
          ]);
        }
        setSavingError('');
      })
      .catch((error) => {
        setSavingError(error?.error || 'Не удалось сохранить мастеров');
      });
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (token.trim().length < 4) {
      setTokenError('Введите рабочий токен доступа');
      return;
    }
    fetchServiceSlots(getApiUrl('/service-manager/auth'), token, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('auth'))))
      .then(() => {
        saveManagerSession(token.trim());
        sessionStorage.removeItem('termburg-service-manager');
        sessionStorage.removeItem('termburg-service-manager-token');
        setAuthorized(true);
        setTokenError('');
      })
      .catch(() => {
        setTokenError('Неверный токен доступа');
      });
  };

  const handleWeekMove = (days: number) => {
    const nextWeek = addDays(weekStart, days);
    setWeekStart(nextWeek);
    setSelectedDate(formatDateKey(nextWeek));
  };

  const handleCurrentWeek = () => {
    setWeekStart(initialWeek);
    setSelectedDate(formatDateKey(new Date()));
  };

  const handleSectionChange = (section: ServiceSection) => {
    setActiveSection(section);
    const firstService = serviceOptions.find((service) => service.section === section);
    if (firstService) {
      setManualDraft((draft) => ({ ...draft, serviceId: firstService.id }));
    }
  };

  const addMaster = () => {
    const name = newMasterName.trim();
    if (!name || newMasterEnd <= newMasterStart) {
      return;
    }
    const newShift = {
        id: makeId('master'),
        date: selectedDate,
        section: activeSection,
        name,
        startHour: newMasterStart,
        endHour: newMasterEnd,
    };
    const nextDayShifts = [...selectedDayShifts, newShift];
    setMasterShifts((items) => [
      ...items.filter((shift) => shift.date !== selectedDate || shift.section !== activeSection),
      ...nextDayShifts,
    ]);
    saveDayShifts(selectedDate, activeSection, nextDayShifts);
    setNewMasterName('');
  };

  const updateShift = (id: string, patch: Partial<MasterShift>) => {
    const nextDayShifts = selectedDayShifts.map((shift) => (
      shift.id === id ? { ...shift, ...patch } : shift
    ));
    setMasterShifts((items) => [
      ...items.filter((shift) => shift.date !== selectedDate || shift.section !== activeSection),
      ...nextDayShifts,
    ]);
    saveDayShifts(selectedDate, activeSection, nextDayShifts);
  };

  const removeShift = (id: string) => {
    const nextDayShifts = selectedDayShifts.filter((shift) => shift.id !== id);
    setMasterShifts((items) => [
      ...items.filter((shift) => shift.date !== selectedDate || shift.section !== activeSection),
      ...nextDayShifts,
    ]);
    saveDayShifts(selectedDate, activeSection, nextDayShifts);
  };

  const openManualBooking = (date: string, hour: number) => {
    const firstService = sectionServices[0];
    setBookingTarget({ date, hour });
    setManualDraft({
      serviceId: firstService?.id ?? '',
      customerName: '',
      phone: '',
      note: '',
    });
    setManualError('');
  };

  const closeManualBooking = () => {
    setBookingTarget(null);
    setManualError('');
  };

  const addManualBooking = (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingTarget) return;
    const service = serviceOptions.find((item) => item.id === manualDraft.serviceId);
    if (!service) {
      setManualError('Выберите услугу');
      return;
    }
    if (!manualDraft.customerName.trim() || !manualDraft.phone.trim()) {
      setManualError('Укажите имя и телефон клиента');
      return;
    }
    if (!canPlaceBooking(bookingTarget.date, bookingTarget.hour, service.durationHours)) {
      setManualError('На это время уже нет свободного места по мастерам');
      return;
    }
    fetchServiceSlots(getApiUrl('/service-manager/manual-bookings'), token, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: bookingTarget.date,
        section: activeSection,
        startHour: bookingTarget.hour,
        hours: service.durationHours,
        serviceName: service.name,
        customerName: manualDraft.customerName.trim(),
        phone: manualDraft.phone.trim(),
        note: manualDraft.note.trim(),
      }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((data) => Promise.reject(data))))
      .then((data: { booking?: ServiceBooking }) => {
        const booking = data.booking;
        if (booking) {
          setManualBookings((items) => [
            ...items,
            {
              id: String(booking.id),
              manualId: booking.manualId,
              date: booking.date,
              startHour: booking.startHour,
              hours: booking.hours,
              serviceName: booking.serviceName,
              customerName: booking.customerName,
              phone: booking.phone,
              orderNumber: booking.orderNumber,
              note: booking.note,
              section: activeSection,
              source: 'manual',
            },
          ]);
        }
        closeManualBooking();
      })
      .catch((error) => {
        setManualError(error?.error || 'Не удалось сохранить ручную запись');
      });
  };

  const removeManualBooking = (booking: ServiceBooking) => {
    if (!booking.manualId) return;

    fetchServiceSlots(getApiUrl(`/service-manager/manual-bookings/${booking.manualId}`), token, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => (response.ok ? response.json() : response.json().then((data) => Promise.reject(data))))
      .then(() => {
        setManualBookings((items) => items.filter((item) => item.id !== booking.id));
        setSavingError('');
      })
      .catch((error) => {
        setSavingError(error?.error || 'Не удалось отменить ручную запись');
      });
  };

  if (!authorized) {
    return (
      <>
        <Helmet>
          <title>Расписание услуг | Термбург</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <main className="service-manager service-manager--login">
          <form className="service-manager__login" onSubmit={handleLogin}>
            <div className="service-manager__login-icon">
              <Lock size={28} />
            </div>
            <p className="service-manager__eyebrow">Термбург</p>
            <h1 className="service-manager__login-title">Расписание услуг</h1>
            <p className="service-manager__login-text">Вход для менеджера. Введите токен, чтобы открыть рабочую сетку записей.</p>
            <label className="service-manager__field">
              <span className="service-manager__field-label">Токен доступа</span>
              <input
                className="service-manager__input"
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            {tokenError && <p className="service-manager__error">{tokenError}</p>}
            <button className="service-manager__button service-manager__button--primary" type="submit">Открыть расписание</button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Расписание услуг | Термбург</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="service-manager">
        <header className="service-manager__top">
          <div>
            <h1 className="service-manager__title">Расписание услуг</h1>
          </div>
          <div className="service-manager__week-control">
            <button className="service-manager__icon-button" type="button" onClick={() => handleWeekMove(-7)} aria-label="Предыдущая неделя">
              <ChevronLeft size={20} />
            </button>
            <button className="service-manager__week-button" type="button" onClick={handleCurrentWeek}>
              <CalendarDays size={18} />
              <span>{formatWeekRange(weekDates)}</span>
            </button>
            <button className="service-manager__icon-button" type="button" onClick={() => handleWeekMove(7)} aria-label="Следующая неделя">
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        <section className="service-manager__controls" aria-label="Настройки расписания">
          <div className="service-manager__control-card">
            <div className="service-manager__section-tabs">
              {sections.map((section) => {
                const Icon = section.icon;
                const active = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    className={`service-manager__section-tab${active ? ' service-manager__section-tab--active' : ''}`}
                    type="button"
                    onClick={() => handleSectionChange(section.id)}
                  >
                    <Icon size={19} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="service-manager__control-card">
            <div className="service-manager__day-tabs">
              {weekDates.map((date, index) => {
                const key = formatDateKey(date);
                const active = key === selectedDate;
                return (
                  <button
                    key={key}
                    className={`service-manager__day-tab${active ? ' service-manager__day-tab--active' : ''}`}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                  >
                    <span>{dayLabels[index]}</span>
                    <strong>{date.getDate()}</strong>
                  </button>
                );
              })}
            </div>
            <div className="service-manager__hours-note">
              Часы записи допуслуг: {formatHour(serviceStartHour)}-{formatHour(serviceEndHour)}
            </div>
          </div>

            <div className="service-manager__panel service-manager__panel--masters">
              <div className="service-manager__panel-head">
                <div>
                  <h2 className="service-manager__panel-title">Мастера</h2>
                  <p className="service-manager__panel-note">{activeSectionLabel}</p>
                </div>
                <span className="service-manager__badge">{selectedDayShifts.length}</span>
              </div>

              <div className="service-manager__master-list">
                {selectedDayShifts.length === 0 && (
                  <p className="service-manager__empty">Нет мастеров, запись через сайт будет закрыта.</p>
                )}
                {selectedDayShifts.map((shift) => (
                  <div className="service-manager__master" key={shift.id}>
                    <div className="service-manager__master-name">
                      <UserRound size={17} />
                      <input
                        className="service-manager__plain-input"
                        value={shift.name}
                        onChange={(event) => updateShift(shift.id, { name: event.target.value })}
                      />
                    </div>
                    <div className="service-manager__master-time">
                      <select
                        className="service-manager__select"
                        value={shift.startHour}
                        onChange={(event) => updateShift(shift.id, { startHour: Number(event.target.value) })}
                      >
                        {shiftHourOptions.slice(0, -1).map((hour) => (
                          <option key={hour} value={hour}>{formatHour(hour)}</option>
                        ))}
                      </select>
                      <span>-</span>
                      <select
                        className="service-manager__select"
                        value={shift.endHour}
                        onChange={(event) => updateShift(shift.id, { endHour: Number(event.target.value) })}
                      >
                        {shiftHourOptions.slice(1).map((hour) => (
                          <option key={hour} value={hour}>{formatHour(hour)}</option>
                        ))}
                      </select>
                      <button className="service-manager__small-button" type="button" onClick={() => removeShift(shift.id)} aria-label="Удалить мастера">
                        <Minus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="service-manager__master-add">
              <input
                className="service-manager__input"
                value={newMasterName}
                onChange={(event) => setNewMasterName(event.target.value)}
              />
                <div className="service-manager__master-time">
                  <select className="service-manager__select" value={newMasterStart} onChange={(event) => setNewMasterStart(Number(event.target.value))}>
                    {shiftHourOptions.slice(0, -1).map((hour) => (
                      <option key={hour} value={hour}>{formatHour(hour)}</option>
                    ))}
                  </select>
                  <select className="service-manager__select" value={newMasterEnd} onChange={(event) => setNewMasterEnd(Number(event.target.value))}>
                    {shiftHourOptions.slice(1).map((hour) => (
                      <option key={hour} value={hour}>{formatHour(hour)}</option>
                    ))}
                  </select>
                </div>
                <button className="service-manager__button service-manager__button--primary" type="button" onClick={addMaster}>
                  <Plus size={17} />
                  <span>Добавить мастера</span>
                </button>
              </div>
              {(serviceOptionsError || bookingsError || savingError) && (
                <div className="service-manager__panel-message">
                  {serviceOptionsError && <span>{serviceOptionsError}</span>}
                  {bookingsError && <span>{bookingsError}</span>}
                  {savingError && <span>{savingError}</span>}
                </div>
              )}
            </div>
        </section>

        <section className="service-manager__body">
          <section className="service-manager__board" aria-label="Недельное расписание">
            <div className="service-manager__board-scroll">
              <div className="service-manager__grid">
                <div className="service-manager__grid-corner">Время</div>
                {weekDates.map((date, index) => {
                  const key = formatDateKey(date);
                  return (
                    <button
                      className={`service-manager__grid-day${key === selectedDate ? ' service-manager__grid-day--active' : ''}`}
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                    >
                      <span>{dayLabels[index]}</span>
                      <strong>{formatDateShort(date)}</strong>
                    </button>
                  );
                })}

                {serviceHours.map((hour) => {
                  const rowHasBookings = weekDates.some((date) => getHourBookings(formatDateKey(date), hour).length > 0);
                  return (
                    <div className={`service-manager__grid-row${rowHasBookings ? ' service-manager__grid-row--filled' : ''}`} key={hour}>
                      <div className="service-manager__grid-hour">
                        <Clock size={15} />
                        <span>{formatHour(hour)}</span>
                      </div>
                      {weekDates.map((date) => {
                        const key = formatDateKey(date);
                        const cellBookings = getHourBookings(key, hour);
                        const capacity = getCapacity(key, hour);
                        const free = Math.max(0, capacity - cellBookings.length);
                        const disabled = capacity === 0 || free === 0;
                        const state = capacity === 0 ? 'closed' : free === 0 ? 'full' : cellBookings.length > 0 ? 'partial' : 'free';
                        return (
                          <div className={`service-manager__slot service-manager__slot--${state}`} key={`${key}-${hour}`}>
                            <div className="service-manager__slot-head">
                              <span>{cellBookings.length}/{capacity}</span>
                              <button
                                className="service-manager__slot-add"
                                type="button"
                                disabled={disabled}
                                onClick={() => openManualBooking(key, hour)}
                                aria-label="Добавить запись"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="service-manager__slot-content">
                              {capacity === 0 && <span className="service-manager__slot-empty">Нет мастера</span>}
                              {capacity > 0 && cellBookings.length === 0 && <span className="service-manager__slot-empty">Свободно</span>}
                              {cellBookings.map((booking) => (
                                <div className={`service-manager__booking service-manager__booking--${booking.source}`} key={booking.id}>
                                  <strong>{booking.customerName}</strong>
                                  <span>{booking.serviceName}</span>
                                  <small>{booking.phone}</small>
                                  {booking.orderNumber && <em>#{booking.orderNumber}</em>}
                                  {booking.note && <small>{booking.note}</small>}
                                  {booking.source === 'manual' && (
                                    <button
                                      className="service-manager__booking-remove"
                                      type="button"
                                      onClick={() => removeManualBooking(booking)}
                                    >
                                      Отменить
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </section>

        {bookingTarget && (
          <div className="service-manager__modal" role="dialog" aria-modal="true">
            <form className="service-manager__modal-card" onSubmit={addManualBooking} autoComplete="off">
              <div className="service-manager__modal-head">
                <div>
                  <p className="service-manager__eyebrow">Ручная запись</p>
                  <h2 className="service-manager__modal-title">{formatDateShort(new Date(bookingTarget.date))}, {formatHour(bookingTarget.hour)}</h2>
                </div>
                <button className="service-manager__icon-button" type="button" onClick={closeManualBooking} aria-label="Закрыть">
                  <Minus size={20} />
                </button>
              </div>

              <label className="service-manager__field">
                <span className="service-manager__field-label">Услуга</span>
                <select
                  className="service-manager__input"
                  value={manualDraft.serviceId}
                  disabled={sectionServices.length === 0}
                  onChange={(event) => setManualDraft((draft) => ({ ...draft, serviceId: event.target.value }))}
                >
                  {sectionServices.length === 0 ? (
                    <option value="">Услуги не загружены</option>
                  ) : sectionServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.durationHours} ч · {service.price.toLocaleString('ru-RU')} ₽
                    </option>
                  ))}
                </select>
              </label>
              <label className="service-manager__field">
                <span className="service-manager__field-label">Клиент</span>
                <input
                  className="service-manager__input"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}
                  value={manualDraft.customerName}
                  onChange={(event) => setManualDraft((draft) => ({ ...draft, customerName: event.target.value }))}
                />
              </label>
              <label className="service-manager__field">
                <span className="service-manager__field-label">Телефон</span>
                <input
                  className="service-manager__input"
                  inputMode="tel"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}
                  value={manualDraft.phone}
                  onChange={(event) => setManualDraft((draft) => ({ ...draft, phone: formatRussianPhoneInput(event.target.value) }))}
                />
              </label>
              <label className="service-manager__field">
                <span className="service-manager__field-label">Комментарий</span>
                <textarea
                  className="service-manager__textarea"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}
                  value={manualDraft.note}
                  onChange={(event) => setManualDraft((draft) => ({ ...draft, note: event.target.value }))}
                />
              </label>
              {manualError && <p className="service-manager__error">{manualError}</p>}
              <button className="service-manager__button service-manager__button--primary" type="submit">
                <ShieldCheck size={18} />
                <span>Записать клиента</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
