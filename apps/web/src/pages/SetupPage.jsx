import { Link } from 'react-router-dom';
import { Button, Logo } from '@maju/ui';

export default function SetupPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <Logo className="text-2xl" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Supabase 연결 필요</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
        로컬 개발을 위해 Supabase 프로젝트를 만들고 환경 변수를 설정해 주세요.
      </p>

      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-[#2A2A2A]">
        <li>
          <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5">.env.example</code>을{' '}
          <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5">apps/web/.env.local</code>로 복사
        </li>
        <li>Supabase URL · anon key 입력</li>
        <li>
          <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5">supabase/migrations/</code> SQL
          실행
        </li>
        <li>개발 서버 재시작</li>
      </ol>

      <p className="mt-6 text-sm text-[#64748B]">
        자세한 내용은{' '}
        <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5">supabase/README.md</code>를
        참고하세요.
      </p>

      <Link to="/" className="mt-8 inline-block">
        <Button variant="secondary">홈으로</Button>
      </Link>
    </div>
  );
}
