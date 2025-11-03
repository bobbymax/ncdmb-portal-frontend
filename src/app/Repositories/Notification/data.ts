export interface NotificationResponseData {
  id: string;
  type: string;
  data: {
    resource_type: string;
    resource_id: number;
    action: string;
    actor_id: number;
    resource_data: Record<string, any>;
    metadata: Record<string, any>;
    url: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

