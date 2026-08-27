import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
} from '../layouts/AuthLayout.jsx';

export default function LoginPage() {
  const { signInWithPassword, user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isConfigured) {
    return <Navigate to="/setup" replace />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithPassword(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message ?? '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="로그인" subtitle="MAJU 면접 시뮬레이터에 오신 것을 환영합니다.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#64748B]">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#64748B]">
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <AuthSubmitButton loading={loading}>로그인</AuthSubmitButton>
      </form>

      <AuthFooterLink prompt="계정이 없으신가요?" linkText="회원가입" to="/signup" />
    </AuthLayout>
  );
}
