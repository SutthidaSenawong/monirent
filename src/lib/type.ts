type PurchaseOrder = {
  id: number; // primary key

  // purchase details
  rentalPeriodFrom: string; // ISO date string
  rentalPeriodTo: string; // ISO date string
  fullName: string;
  email: string;
  whatsappNumber: string;
  deliveryAddress: string;
  hotelOrAccommodationName: string;
  roomNumber?: string;
  rentItems: Array<{
    id: number;
    name: string;
    imageUrl: string;
    quantity: number;
  }>;
  dailyRentRate: number;
  weeklyRentRate: number;
  totalFee: number;

  // order metadata
  status: "WAITING_FOR_DELIVERY" | "DELIVERED" | "ITEM_RETURNED" | "CANCELLED";

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  logs: Array<{
    timestamp: string; // ISO date string
    message: string;
  }>;
}

type Item = {
  id: string;
  name: string;
  info: string;
  description: string;
  category: string;
  price: number; // weekly price
  PricePerMonth: number;
  imageUrl: string;
  spec: Record<string, string>;
  quantity: number;
}