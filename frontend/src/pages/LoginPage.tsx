import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Container from '@/components/ui/Container';
import { useAuth } from '@/context/AuthContext';
import LegalConsents from '@/components/shared/LegalConsents';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

type Mode = 'login' | 'register';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

export default function LoginPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «login» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('login');

  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = emailTouched && email && !emailPattern.test(email) ? 'Введите корректный email' : '';
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneError = phoneTouched && phone && phoneDigits.length > 1 && phoneDigits.length < 11 ? 'Введите корректный номер телефона' : '';

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/account');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        // Validate email format before sending
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          setError('Введите корректный email');
          setIsSubmitting(false);
          return;
        }
        await login({ email, password });
      } else {
        if (!name.trim()) {
          setError('Введите имя');
          setIsSubmitting(false);
          return;
        }
        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          setError('Введите корректный email');
          setIsSubmitting(false);
          return;
        }
        // Validate phone if provided
        if (phone) {
          const phoneDigits = phone.replace(/\D/g, '');
          if (phoneDigits.length < 11) {
            setError('Введите корректный номер телефона');
            setIsSubmitting(false);
            return;
          }
        }
        if (password.length < 8) {
          setError('Пароль должен быть не менее 8 символов');
          setIsSubmitting(false);
          return;
        }
        await register({ email, password, name, phone: phone || undefined });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      if (mode === 'login') {
        setError('Неверный email или пароль. Нет аккаунта? Зарегистрируйтесь');
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
  };

  if (authLoading) {
    return (
      <PageLayout title="Вход" description="Авторизация в личном кабинете Термбурга.">
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Вход" description="Авторизация в личном кабинете Термбурга.">
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden py-12">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/images/heroes/login.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
        </div>

        <Container className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <img src="/images/termliny-symbol.svg" alt="" className="h-8 w-8 opacity-70" />
              <span className="font-heading text-2xl font-bold tracking-[0.2em] text-primary">
                ТЕРМБУРГ
              </span>
            </Link>
            <h1 className="font-heading text-2xl font-bold text-white">
              {mode === 'login' ? 'Вход в личный кабинет' : 'Регистрация'}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {mode === 'login'
                ? 'Управляйте абонементами и бонусами'
                : 'Создайте аккаунт для доступа к бонусам'}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-dark-surface/90 backdrop-blur-sm border border-dark-border p-6 sm:p-8">
            {/* Mode switcher */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {mode === 'login' && error.includes('Зарегистрируйтесь') ? (
                  <>
                    Неверный email или пароль. Нет аккаунта?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="underline text-primary hover:text-primary-light transition-colors"
                    >
                      Зарегистрируйтесь
                    </button>
                  </>
                ) : (
                  error
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Имя</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше имя"
                      required={mode === 'register'}
                      className="w-full rounded-xl bg-white/5 border border-dark-border pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="email@example.com"
                    required
                    className={`w-full rounded-xl bg-white/5 border pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-colors ${
                      emailError ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30' : 'border-dark-border focus:border-primary/50 focus:ring-primary/30'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-400">{emailError}</p>
                )}
              </div>

              {/* Phone (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Телефон <span className="text-white/30">(необязательно)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/30" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder="+7 (___) ___-__-__"
                      className={`w-full rounded-xl bg-white/5 border pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-colors ${
                        phoneError ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30' : 'border-dark-border focus:border-primary/50 focus:ring-primary/30'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-xs text-red-400">{phoneError}</p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Минимум 8 символов' : 'Введите пароль'}
                    required
                    minLength={mode === 'register' ? 8 : undefined}
                    className="w-full rounded-xl bg-white/5 border border-dark-border pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && <LegalConsents tone="dark" />}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-white/30">
            Продолжая, вы соглашаетесь с&nbsp;
            <Link to="/offer" className="text-white/50 underline hover:text-white/70">
              условиями использования
            </Link>
            {' '}и&nbsp;
            <Link to="/privacy" className="text-white/50 underline hover:text-white/70">
              политикой конфиденциальности
            </Link>
          </p>
        </Container>
      </section>
    </PageLayout>
  );
}
