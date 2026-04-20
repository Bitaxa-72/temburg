import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BookingProvider, useBooking } from '@/context/BookingContext';
import type { ReactNode } from 'react';
import type { BathType } from '@/data/thermalZones';

describe('useBooking', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BookingProvider>{children}</BookingProvider>
  );

  it('throws error when used outside BookingProvider', () => {
    expect(() => {
      renderHook(() => useBooking());
    }).toThrow('useBooking must be used within BookingProvider');
  });

  it('initializes with closed modals', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    expect(result.current.bookingOpen).toBe(false);
    expect(result.current.purchaseOpen).toBe(false);
    expect(result.current.bathDetailOpen).toBe(false);
    expect(result.current.purchaseItem).toBe(null);
    expect(result.current.selectedBath).toBe(null);
  });

  it('opens booking modal', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.openBooking();
    });

    expect(result.current.bookingOpen).toBe(true);
    expect(result.current.purchaseOpen).toBe(false);
    expect(result.current.bathDetailOpen).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens purchase modal with item', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    const purchaseItem = {
      name: 'Test Item',
      price: '1000',
      childPrice: '500',
    };

    act(() => {
      result.current.openPurchase(purchaseItem);
    });

    expect(result.current.purchaseOpen).toBe(true);
    expect(result.current.purchaseItem).toEqual(purchaseItem);
    expect(result.current.bookingOpen).toBe(false);
    expect(result.current.bathDetailOpen).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens bath detail modal with bath', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    const bathMock: BathType = {
      id: 1,
      name: 'Test Bath',
      temperature: '80-90°C',
      description: 'Test description',
      features: ['Feature 1', 'Feature 2'],
      tips: ['Tip 1', 'Tip 2'],
      image: '/test.jpg',
    };

    act(() => {
      result.current.openBathDetail(bathMock as BathType);
    });

    expect(result.current.bathDetailOpen).toBe(true);
    expect(result.current.selectedBath).toEqual(bathMock);
    expect(result.current.bookingOpen).toBe(false);
    expect(result.current.purchaseOpen).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes bath detail modal', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    const bathMock: BathType = {
      id: 1,
      name: 'Test Bath',
      temperature: '80-90°C',
      description: 'Test description',
      features: ['Feature 1'],
      tips: ['Tip 1'],
      image: '/test.jpg',
    };

    act(() => {
      result.current.openBathDetail(bathMock as BathType);
    });

    expect(result.current.bathDetailOpen).toBe(true);

    act(() => {
      result.current.closeBathDetail();
    });

    expect(result.current.bathDetailOpen).toBe(false);
    expect(result.current.selectedBath).toBe(null);
    expect(document.body.style.overflow).toBe('');
  });

  it('closes all modals', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    const purchaseItem = {
      name: 'Test Item',
      price: '1000',
    };

    act(() => {
      result.current.openPurchase(purchaseItem);
    });

    expect(result.current.purchaseOpen).toBe(true);
    expect(result.current.purchaseItem).toEqual(purchaseItem);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.bookingOpen).toBe(false);
    expect(result.current.purchaseOpen).toBe(false);
    expect(result.current.bathDetailOpen).toBe(false);
    expect(result.current.purchaseItem).toBe(null);
    expect(result.current.selectedBath).toBe(null);
    expect(document.body.style.overflow).toBe('');
  });

  it('opens swimming enrollment modal with item', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    const enrollmentItem = {
      programName: 'Advanced Swimming',
      price: 5000,
    };

    act(() => {
      result.current.openSwimmingEnrollment(enrollmentItem);
    });

    expect(result.current.swimmingEnrollmentOpen).toBe(true);
    expect(result.current.swimmingEnrollmentItem).toEqual(enrollmentItem);
    expect(result.current.bookingOpen).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens what to bring modal', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.openWhatToBring();
    });

    expect(result.current.whatToBringOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens clay modal', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.openClayModal();
    });

    expect(result.current.clayModalOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens search modal', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });

    act(() => {
      result.current.openSearch();
    });

    expect(result.current.searchOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
