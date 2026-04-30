import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BathType } from '@/data/thermalZones';

export interface CertificateMeta {
  design: string;
  occasion: string;
  amount: number;
  recipientName: string;
  recipientPhone: string;
  wish: string;
  emoji: string;
  color: string;
  code: string;
  frontImage?: string;
  backImage?: string;
}

interface PurchaseItem {
  name: string;
  price: string;
  childPrice?: string;
  certificate?: CertificateMeta;
}

interface SwimmingEnrollmentItem {
  programName: string;
  price: number;
}

interface BookingContextType {
  bookingOpen: boolean;
  purchaseOpen: boolean;
  purchaseItem: PurchaseItem | null;
  bathDetailOpen: boolean;
  selectedBath: BathType | null;
  whatToBringOpen: boolean;
  clayModalOpen: boolean;
  swimmingEnrollmentOpen: boolean;
  swimmingEnrollmentItem: SwimmingEnrollmentItem | null;
  searchOpen: boolean;
  openBooking: () => void;
  openPurchase: (item: PurchaseItem) => void;
  openBathDetail: (bath: BathType) => void;
  openWhatToBring: () => void;
  openClayModal: () => void;
  openSwimmingEnrollment: (item: SwimmingEnrollmentItem) => void;
  openSearch: () => void;
  closeBathDetail: () => void;
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<PurchaseItem | null>(null);
  const [bathDetailOpen, setBathDetailOpen] = useState(false);
  const [selectedBath, setSelectedBath] = useState<BathType | null>(null);
  const [whatToBringOpen, setWhatToBringOpen] = useState(false);
  const [clayModalOpen, setClayModalOpen] = useState(false);
  const [swimmingEnrollmentOpen, setSwimmingEnrollmentOpen] = useState(false);
  const [swimmingEnrollmentItem, setSwimmingEnrollmentItem] = useState<SwimmingEnrollmentItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const openBooking = () => {
    setPurchaseOpen(false);
    setBathDetailOpen(false);
    setBookingOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openPurchase = (item: PurchaseItem) => {
    setBookingOpen(false);
    setBathDetailOpen(false);
    setPurchaseItem(item);
    setPurchaseOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openBathDetail = (bath: BathType) => {
    setBookingOpen(false);
    setPurchaseOpen(false);
    setSelectedBath(bath);
    setBathDetailOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBathDetail = () => {
    setBathDetailOpen(false);
    setSelectedBath(null);
    document.body.style.overflow = '';
  };

  const openWhatToBring = () => {
    setWhatToBringOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openClayModal = () => {
    setClayModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openSwimmingEnrollment = (item: SwimmingEnrollmentItem) => {
    setBookingOpen(false);
    setPurchaseOpen(false);
    setBathDetailOpen(false);
    setSwimmingEnrollmentItem(item);
    setSwimmingEnrollmentOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openSearch = () => {
    setSearchOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setBookingOpen(false);
    setPurchaseOpen(false);
    setPurchaseItem(null);
    setBathDetailOpen(false);
    setSelectedBath(null);
    setWhatToBringOpen(false);
    setClayModalOpen(false);
    setSwimmingEnrollmentOpen(false);
    setSwimmingEnrollmentItem(null);
    setSearchOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <BookingContext.Provider
      value={{
        bookingOpen,
        purchaseOpen,
        purchaseItem,
        bathDetailOpen,
        selectedBath,
        whatToBringOpen,
        clayModalOpen,
        swimmingEnrollmentOpen,
        swimmingEnrollmentItem,
        searchOpen,
        openBooking,
        openPurchase,
        openBathDetail,
        openWhatToBring,
        openClayModal,
        openSwimmingEnrollment,
        openSearch,
        closeBathDetail,
        closeModal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
