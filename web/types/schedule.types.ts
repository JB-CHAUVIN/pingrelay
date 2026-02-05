export interface VariableEntry {
  key: string;
  value: string;
}

export interface Schedule {
  id: string;
  groupName: string;
  messageTemplateId: string;
  eventDate: string;
  variables: VariableEntry[];
  user: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleCreateInput {
  groupName: string;
  messageTemplateId: string;
  eventDate: string;
  variables?: VariableEntry[];
}

export interface ScheduleUpdateInput {
  groupName?: string;
  messageTemplateId?: string;
  eventDate?: string;
  variables?: VariableEntry[];
  status?: "pending" | "running" | "completed" | "failed";
}
