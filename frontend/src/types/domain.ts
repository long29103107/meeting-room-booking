export type Room = { id: number; name: string; capacity: number; location: string; active: boolean };

export const BOOKING_STATUS = { CONFIRMED: 'CONFIRMED', CANCELLED: 'CANCELLED' } as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type Booking = {
  id: number;
  room: Room;
  title: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  userEmail: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type RoomDraft = { id?: number; name: string; capacity: number; location: string; active: boolean };
export type ToastKind = 'success' | 'error';
export type ToastMessage = { id: number; message: string; kind: ToastKind };
export type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
};
