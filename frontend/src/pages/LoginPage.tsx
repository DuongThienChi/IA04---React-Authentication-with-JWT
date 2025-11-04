import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { getErrorMessage } from '../utils/error';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { accessToken, isHydrating } = useAuth();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isHydrating && accessToken) {
      navigate('/', { replace: true });
    }
  }, [accessToken, isHydrating, navigate]);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/', { replace: true });
      },
    });
  };

  const formError = loginMutation.isError ? getErrorMessage(loginMutation.error) : null;

  return (
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Sign in</h1>

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
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        {formError && <div className="form-error">{formError}</div>}

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="auth-footer">
          <span>Need an account?</span>
          <Link to="/register">Create one</Link>
        </div>
      </form>
    </div>
  );
}
