export interface Phone {
  id: string;
  phone: string;
  user: string;
  status: "connected" | "disconnected";
  createdAt: string;
  updatedAt: string;
}

export interface PhoneCreateInput {
  phone: string;
  status?: "connected" | "disconnected";
}

export interface PhoneUpdateInput {
  phone?: string;
  status?: "connected" | "disconnected";
}
