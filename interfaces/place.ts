export interface Place {
  id: string | number;
  title: string;
  description: string;
  tags: string[];
  urls: string[];
  list_id: string | number;
  inserted_at: string;
  location?: string;
}
