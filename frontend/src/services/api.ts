const API_BASE_URL = '/wp-json/termburg/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiError {
  code: string;
  message: string;
}

// Error messages in Russian
const errorMessages: Record<string, string> = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_UNAVAILABLE: 'Сервер временно недоступен. Попробуйте позже.',
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  USER_EXISTS: 'Пользователь с таким email уже существует',
  VALIDATION_ERROR: 'Проверьте правильность заполнения формы',
  UNAUTHORIZED: 'Необходимо авторизоваться',
  FORBIDDEN: 'Недостаточно прав доступа',
  NOT_FOUND: 'Ресурс не найден',
};

function getErrorMessage(error: unknown, response?: Response): string {
  // Handle API error response
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError;
    // Check if we have a Russian translation
    if (apiError.code && errorMessages[apiError.code]) {
      return errorMessages[apiError.code];
    }
    // Return the message as is
    return apiError.message;
  }

  // Handle HTTP status codes
  if (response) {
    switch (response.status) {
      case 400: return 'Некорректный запрос';
      case 401: return errorMessages.UNAUTHORIZED;
      case 403: return errorMessages.FORBIDDEN;
      case 404: return errorMessages.NOT_FOUND;
      case 409: return errorMessages.USER_EXISTS;
      case 422: return errorMessages.VALIDATION_ERROR;
      case 500: return 'Внутренняя ошибка сервера';
      case 502:
      case 503:
      case 504: return errorMessages.SERVER_UNAVAILABLE;
    }
  }

  return 'Произошла ошибка';
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('termburg_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network error (no internet, CORS, server down)
    console.error('Network error:', err);
    throw new Error(errorMessages.NETWORK_ERROR);
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(getErrorMessage(null, response));
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response));
  }

  // Support both {success, data} wrapper and direct response
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

// Auth API
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  orderId?: string;
  orderKey?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/auth/login', data),

  getProfile: () =>
    api.get<User>('/auth/profile'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.patch<User>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/change-password', data),
};

// Booking types
export type ServiceType = 'MASSAGE' | 'SPA' | 'SAUNA' | 'HAMMAM' | 'PACKAGE' | 'EVENT';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Booking {
  id: string;
  userId: string;
  serviceType: ServiceType;
  serviceName: string;
  date: string;
  time: string;
  guests: number;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payment?: Payment;
}

export interface CreateBookingData {
  serviceType: ServiceType;
  serviceName: string;
  date: string;
  time: string;
  guests?: number;
  duration?: number;
  totalPrice: number;
  notes?: string;
}

export interface BookingsListResponse {
  bookings: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bookingsApi = {
  create: (data: CreateBookingData) =>
    api.post<Booking>('/bookings', data),

  list: (params?: { page?: number; limit?: number; status?: BookingStatus }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return api.get<BookingsListResponse>(`/bookings${query ? `?${query}` : ''}`);
  },

  get: (id: string) =>
    api.get<Booking>(`/bookings/${id}`),

  cancel: (id: string) =>
    api.post<Booking>(`/bookings/${id}/cancel`, {}),
};

// Payment types
export type PaymentStatus = 'PENDING' | 'WAITING_FOR_CAPTURE' | 'SUCCEEDED' | 'CANCELED' | 'REFUNDED';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentUrl?: string;
  yookassaId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface CreatePaymentData {
  amount: number;
  description: string;
  bookingId: string;
  returnUrl?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentUrl: string;
  createdAt: string;
}

export const paymentsApi = {
  create: (data: CreatePaymentData) =>
    api.post<PaymentResponse>('/payments', data),

  getStatus: (id: string) =>
    api.get<Payment>(`/payments/${id}`),
};
