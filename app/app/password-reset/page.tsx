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

export default function PasswordReset({
  searchParams,
}: {
  searchParams: { message: string; type: string };
}) {
  const resetPassword = async (formData: FormData) => {
    'use server';

    const password = formData.get('password') as string;
    const passwordCheck = formData.get('password-check') as string;
    const supabase = createClient();

    if (password !== passwordCheck)
      return redirect(
        `/app/password-reset?type=error&message=${encodeURIComponent("Passwords don't match")}`,
      );

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error)
      return redirect(
        `/app/password-reset?type=error&message=${encodeURIComponent(error.message)}`,
      );

    return redirect('/app');
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
              <h1 className="text-2xl font-semibold tracking-tight">
                Reset Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your new password below
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password-check"
                  name="password-check"
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
              <SubmitButton
                formAction={resetPassword}
                pendingText="Resetting password..."
              >
                Reset password
              </SubmitButton>
            </div>
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
