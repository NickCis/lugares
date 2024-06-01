import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Content } from '@/components/layout';
import { Plus } from 'lucide-react';
import { AddListDialog } from './add-list-dialog';
import { ListCard } from './list-card';
import { Wrapper } from './wrapper';

export default async function App() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase
    .from('lists')
    .select('*, list_owners(user_id)')
    .eq('list_owners.user_id', user.id);
  const lists = (data || []).filter(
    ({ list_owners }) => list_owners.length > 0,
  );

  return (
    <Wrapper>
      <Content className="w-full max-w-4xl pt-6 px-2 lg:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Lists</h2>
          <div className="flex items-center space-x-2">
            <AddListDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New List
              </Button>
            </AddListDialog>
          </div>
        </div>
        <div className="flex space-y-2">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              id={list.id}
              title={list.title}
              description={list.description}
              isPrivate={list.private}
              insertedAt={list.inserted_at}
            />
          ))}
        </div>
      </Content>
    </Wrapper>
  );
}
