import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from '@/components/shared/ScrollToTop';
import ScrollToTopButton from '@/components/shared/ScrollToTopButton';
import CookieConsent from '@/components/shared/CookieConsent';
import { useBooking } from '@/context/BookingContext';
import { useImagePreloader } from '@/hooks/useImage';

// Lazy load modals - they're only needed when opened
const BookingModal = lazy(() => import('@/components/shared/BookingModal'));
const PurchaseModal = lazy(() => import('@/components/shared/PurchaseModal'));
const BathDetailModal = lazy(() => import('@/components/shared/BathDetailModal'));
const WhatToBringModal = lazy(() => import('@/components/shared/WhatToBringModal'));
const ClayModal = lazy(() => import('@/components/shared/ClayModal'));
const SwimmingEnrollmentModal = lazy(() => import('@/components/shared/SwimmingEnrollmentModal'));
const SearchModal = lazy(() => import('@/components/shared/SearchModal'));

const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const PromotionsPage = lazy(() => import('@/pages/PromotionsPage'));
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const CafePage = lazy(() => import('@/pages/CafePage'));
const TermlinyPage = lazy(() => import('@/pages/TermlinyPage'));
const NewsPage = lazy(() => import('@/pages/NewsPage'));
const PartnersPage = lazy(() => import('@/pages/PartnersPage'));
const CareersPage = lazy(() => import('@/pages/CareersPage'));
const OfferPage = lazy(() => import('@/pages/OfferPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const SwimmingSchoolPage = lazy(() => import('@/pages/SwimmingSchoolPage'));
const SteamSchoolPage = lazy(() => import('@/pages/SteamSchoolPage'));
const FamilyPage = lazy(() => import('@/pages/FamilyPage'));
const RulesPage = lazy(() => import('@/pages/RulesPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const CorporatePage = lazy(() => import('@/pages/CorporatePage'));
const PoolsPage = lazy(() => import('@/pages/PoolsPage'));
const SteamRoomsPage = lazy(() => import('@/pages/SteamRoomsPage'));
const PlungePoolsPage = lazy(() => import('@/pages/PlungePoolsPage'));
const JacuzziPage = lazy(() => import('@/pages/JacuzziPage'));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  const {
    bookingOpen,
    purchaseOpen,
    bathDetailOpen,
    whatToBringOpen,
    clayModalOpen,
    swimmingEnrollmentOpen,
    searchOpen,
    openSearch,
    closeModal
  } = useBooking();

  // Preload WordPress image mapping for faster image resolution
  useImagePreloader();

  // Global keyboard shortcut for search: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <CookieConsent />

      {/* Lazy-loaded modals - only render when opened */}
      {bookingOpen && (
        <Suspense fallback={null}>
          <BookingModal />
        </Suspense>
      )}
      {purchaseOpen && (
        <Suspense fallback={null}>
          <PurchaseModal />
        </Suspense>
      )}
      {bathDetailOpen && (
        <Suspense fallback={null}>
          <BathDetailModal />
        </Suspense>
      )}
      {whatToBringOpen && (
        <Suspense fallback={null}>
          <WhatToBringModal isOpen={whatToBringOpen} onClose={closeModal} />
        </Suspense>
      )}
      {clayModalOpen && (
        <Suspense fallback={null}>
          <ClayModal isOpen={clayModalOpen} onClose={closeModal} />
        </Suspense>
      )}
      {swimmingEnrollmentOpen && (
        <Suspense fallback={null}>
          <SwimmingEnrollmentModal />
        </Suspense>
      )}
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchModal isOpen={searchOpen} onClose={closeModal} />
        </Suspense>
      )}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/pricing/calculator" element={<PricingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/swimming-school" element={<SwimmingSchoolPage />} />
          <Route path="/steam-school" element={<SteamSchoolPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/cafe" element={<CafePage />} />
          <Route path="/termliny" element={<TermlinyPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/steam-rooms" element={<SteamRoomsPage />} />
          <Route path="/jacuzzi" element={<JacuzziPage />} />
          <Route path="/plunge-pools" element={<PlungePoolsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
