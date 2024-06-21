import { createClient } from '@/lib/supabase/server';
import type { List } from '@/interfaces/list';
import type { Place } from '@/interfaces/place';

import { normalize } from '@/lib/string';
import { getTags } from '@/lib/places';

export async function get(
  listId: string,
  tagParams: string | string[],
): Promise<{
  places: Place[];
  tags: string[];
  availableTags: string[];
  filters: string[];
  list?: List;
}> {
  const supabase = createClient();
  const { data } = await supabase
    .from('lists')
    .select('*, places(*)')
    .eq('id', listId);

  const list = data?.[0];

  if (!list) return { places: [], tags: [], availableTags: [], filters: [] };

  const tags = getTags(list.places);
  let availableTags = tags;
  let places = list.places as Place[];

  let filters: string[] = [];
  if (tagParams) {
    filters = Array.isArray(tagParams) ? tagParams : [tagParams];

    places = places.filter(({ tags }) =>
      filters.every((f) => {
        const n = normalize(f);
        return tags.some((t) => normalize(t) === n);
      }),
    );
    availableTags = getTags(places);
  }

  return {
    list,
    places,
    tags,
    availableTags,
    filters,
  };
}
