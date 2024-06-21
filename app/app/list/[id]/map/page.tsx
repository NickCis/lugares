import { createClient } from '@/lib/supabase/server';
import { get } from '../data';
import { DynamicMap } from './dynamic-map';

export interface MapPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function MapPage({ params, searchParams }: MapPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const listId = params.id;
  const { filters, places } = await get(listId, searchParams.tags || []);

  return <DynamicMap listId={listId} filters={filters} places={places} />;
}
