import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SubmitButton } from '@/components/submit-button';
import { LandPlot, AlertCircle, Info } from 'lucide-react';

import { Wrapper, Header, Logo, Content } from '@/components/layout';

function AlertMessage({ type, message }: { type?: string; message: string }) {
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : Info;
  return (
    <Alert variant={isError ? 'destructive' : undefined}>
      <Icon className="h-4 w-4" />
      {isError ? <AlertTitle>Error</AlertTitle> : null}
      {message.split('|').map((str) => (
        <AlertDescription key={str}>{str}</AlertDescription>
      ))}
    </Alert>
  );
}

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; type?: string };
}) {
  const signIn = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect('/login?type=error&message=Could not authenticate user');
    }

    return redirect('/app');
  };

  const signUp = async (formData: FormData) => {
    'use server';

    const origin = headers().get('origin');
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('error', error);
      return redirect(
        `/login?type=error&message=Could not register user.|${encodeURIComponent(error.message)}`,
      );
    }

    return redirect('/login?message=Check email to continue sign in process');
  };

  const resetPassword = async (formData: FormData) => {
    'use server';
    const origin = headers().get('origin');
    const email = formData.get('email') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?event=password-reset`,
    });

    if (error) {
      return redirect(
        `/login?type=error&message=Could not reset password.|${encodeURIComponent(error.message)}`,
      );
    }

    return redirect('/login?message=Check email to continue the process');
  };

  return (
    <Wrapper>
      <Header>
        <Logo />
      </Header>
      <Content className="flex flex-col px-8 sm:max-w-md justify-center gap-2">
        <form className="-mt-14">
          <div className="flex-1 flex w-full flex-col justify-center space-y-6">
            <div className="flex flex-col w-full space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Enter your details below to sign in
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  required
                />
              </div>
              {searchParams?.message && (
                <AlertMessage
                  message={searchParams?.message}
                  type={searchParams?.type}
                />
              )}
              <SubmitButton formAction={signIn} pendingText="Signing In...">
                Sign In
              </SubmitButton>
              <div className="text-right">
                <SubmitButton
                  variant="link"
                  formAction={resetPassword}
                  pendingText="Reseting..."
                  className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
                  formNoValidate
                >
                  Forgot password?
                </SubmitButton>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or create new account
                </span>
              </div>
            </div>
            <SubmitButton
              variant="outline"
              type="button"
              formAction={signUp}
              pendingText="Signing Up..."
            >
              Sign Up
            </SubmitButton>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </Content>
    </Wrapper>
  );
}
