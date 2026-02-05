export interface TemplateMessage {
  phoneId: string;
  sendTimeType?: "fixed_time" | "event_time" | "relative_time";
  sendOnDay: string;
  sendOnHour: string;
  messageTemplate: string;
  image?: string;
  video?: string;
}

export interface Template {
  id: string;
  titre: string;
  user: string;
  messages: TemplateMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCreateInput {
  titre: string;
  messages: TemplateMessage[];
}

export interface TemplateUpdateInput {
  titre?: string;
  messages?: TemplateMessage[];
}
