import DeployButton from '../components/DeployButton';
import { createClient } from '@/lib/supabase/server';
import ConnectSupabaseSteps from '@/components/tutorial/ConnectSupabaseSteps';
import SignUpUserSteps from '@/components/tutorial/SignUpUserSteps';
import MainHeader from '@/components/Header';
import { AuthButton } from './auth-button';

import { Wrapper, Header, Logo, Content } from '@/components/layout';

export default async function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <Wrapper>
      <Header>
        <Logo />
        {isSupabaseConnected && <AuthButton />}
      </Header>
      <Content className="flex-1 w-full flex flex-col gap-20 items-center pt-20">
        <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
          <MainHeader />
          <main className="flex-1 flex flex-col gap-6">
            <h2 className="font-bold text-4xl mb-4">Next steps</h2>
            {isSupabaseConnected ? (
              <SignUpUserSteps />
            ) : (
              <ConnectSupabaseSteps />
            )}
          </main>
        </div>

        <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
          <p>
            Powered by{' '}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </Content>
    </Wrapper>
  );
}
