import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import { getErrorMessage } from '../utils/error';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .max(120, 'Display name must be 120 characters or fewer')
      .optional(),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirmation must match password'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { accessToken, isHydrating } = useAuth();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!isHydrating && accessToken) {
      navigate('/', { replace: true });
    }
  }, [accessToken, isHydrating, navigate]);

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
        displayName: data.displayName?.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate('/', { replace: true });
        },
      },
    );
  };

  const formError = registerMutation.isError
    ? getErrorMessage(registerMutation.error)
    : null;

  return (
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Create account</h1>

        <label htmlFor="displayName">Display name</label>
        <input id="displayName" type="text" autoComplete="name" {...register('displayName')} />
        {errors.displayName && <p className="field-error">{errors.displayName.message}</p>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="field-error">{errors.confirmPassword.message}</p>
        )}

        {formError && <div className="form-error">{formError}</div>}

        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating…' : 'Sign up'}
        </button>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
