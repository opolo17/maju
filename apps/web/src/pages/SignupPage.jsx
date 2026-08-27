import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Input } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
} from '../layouts/AuthLayout.jsx';

export default function SignupPage() {
  const { signUp, user, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isConfigured) {
    return <Navigate to="/setup" replace />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signUp(email.trim(), password, displayName.trim());
      setSuccess('가입이 완료되었습니다. 이메일 확인이 필요하면 메일함을 확인해 주세요.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="회원가입" subtitle="실전 다대다 면접 훈련을 시작해 보세요.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        {success ? (
          <p className="rounded-xl border border-[#2AD175]/30 bg-[#E3F58F]/20 px-4 py-3 text-sm text-[#2A2A2A]">
            {success}
          </p>
        ) : null}

        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-[#64748B]">
            이름 (선택)
          </label>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="홍길동"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
          />
        </div>

        <AuthSubmitButton loading={loading}>계정 만들기</AuthSubmitButton>
      </form>

      <AuthFooterLink prompt="이미 계정이 있으신가요?" linkText="로그인" to="/login" />
    </AuthLayout>
  );
}
