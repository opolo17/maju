import { Link } from 'react-router-dom';
import { Button, Logo } from '@maju/ui';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <Logo className="text-2xl" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-[#64748B]">{subtitle}</p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}

export function AuthFooterLink({ prompt, linkText, to }) {
  return (
    <p className="mt-6 text-center text-sm text-[#64748B]">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-[#2A2A2A] underline-offset-2 hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

export function AuthError({ message }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  );
}

export function AuthSubmitButton({ loading, children }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={loading}>
      {loading ? '처리 중…' : children}
    </Button>
  );
}
