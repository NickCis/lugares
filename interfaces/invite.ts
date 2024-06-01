import { List } from '@/interfaces/list';

export interface Invite {
  list_id: string | number;
  email: string;
}

export interface InviteWithList extends Invite {
  lists: List;
}
