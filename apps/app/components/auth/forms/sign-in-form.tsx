'use client';

import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@deepcrawl/ui/components/ui/form';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod/v4';
import { useApiKeyAuth } from '@/components/providers/api-key-auth-provider';
import { SpinnerButton } from '@/components/spinner-button';
import { useIsHydrated } from '@/hooks/use-hydrated';
import { useOnSuccessTransition } from '@/hooks/use-success-transition';
import { authClient } from '@/lib/auth.client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authViewSegments } from '@/routes/auth';
import { getPasswordSchema, type PasswordValidation } from '@/utils';
import { LastUsedBadge } from '../last-userd-badge';
import { PasswordInput } from '../password-input';

export interface SignInFormProps {
  className?: string;
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  passwordValidation?: PasswordValidation;
}

const REMEMBER_ME_ENABLED = false;

export function SignInForm({
  className,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignInFormProps) {
  const isHydrated = useIsHydrated();
  // const { captchaRef, getCaptchaHeaders } = useCaptcha()
  const lastUsedMethod = authClient.getLastUsedLoginMethod();
  const isEmailLastUsed = lastUsedMethod === 'email';

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const { setApiKey, getSessionWithApiKey } = useApiKeyAuth();

  const formSchema = z.object({
    email: z.email(),
    password: getPasswordSchema(passwordValidation),
    rememberMe: z.boolean().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: REMEMBER_ME_ENABLED,
    },
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  async function signIn({
    email,
    password,
    rememberMe,
  }: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        const errorMessage = getAuthErrorMessage(error);

        form.resetField('password');
        toast.error(errorMessage);
        return;
      }

      if (data) {
        // Create an API key after successful sign-in for cross-domain auth
        try {
          const { data: apiKeyData, error: apiKeyError } =
            await authClient.apiKey.create({
              name: 'Dashboard Session',
              expiresIn: 60 * 60 * 24 * 30, // 30 days
              prefix: 'dc_',
            });

          if (apiKeyError) {
            console.error('Failed to create API key:', apiKeyError);
          } else if (apiKeyData?.key) {
            // Store the API key for session-based auth
            setApiKey(apiKeyData.key);

            // Also set a cookie for API routes to read
            // This works because API routes are on the same domain (vercel.app)
            document.cookie = `deepcrawl_api_key=${apiKeyData.key}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

            // Validate and get the session
            await getSessionWithApiKey();
          }
        } catch (apiKeyErr) {
          console.error('Error creating API key:', apiKeyErr);
        }

        await onSuccess();
      }
    } catch (error) {
      form.resetField('password');
      console.error('Unexpected sign-in error:', error);
      toast.error('A network error occurred. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('grid w-full gap-6', className)}
        noValidate={isHydrated}
        onSubmit={form.handleSubmit(signIn)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="group">
              <FormLabel className="flex items-center justify-between">
                Email
                {isEmailLastUsed && (
                  <LastUsedBadge className="static inline-flex group-focus-within:text-foreground" />
                )}
              </FormLabel>

              <FormControl>
                <Input
                  autoCapitalize="off"
                  autoComplete="email"
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                  spellCheck={false}
                  suppressHydrationWarning={true}
                  type="email"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>

                <Link
                  className="mr-0.5 rounded-md px-0.5 text-muted-foreground text-sm outline-none hover:text-foreground hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  href={`/${authViewSegments.forgotPassword}${isHydrated ? window.location.search : ''}`}
                >
                  Forgot password?
                </Link>
              </div>

              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  suppressHydrationWarning={true}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {REMEMBER_ME_ENABLED && (
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Remember me</FormLabel>
              </FormItem>
            )}
          />
        )}

        {/* TODO: Add captcha */}
        {/* <Captcha
          ref={captchaRef}
          action="/login/email"
        /> */}

        <SpinnerButton
          buttonState={isSubmitting ? 'loading' : 'idle'}
          className="w-full text-md"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
        >
          Login
        </SpinnerButton>
      </form>
    </Form>
  );
}
