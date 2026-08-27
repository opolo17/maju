import { Link } from 'react-router-dom';
import { Button, Logo, MarkerHighlight } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { user, isConfigured } = useAuth();

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <Logo className="text-3xl" />
        <p className="mt-4 text-[#64748B]">이미 로그인되어 있습니다.</p>
        <Link to="/dashboard" className="mt-6">
          <Button size="lg">대시보드로 이동</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="text-3xl" />
      <h1 className="mt-8 max-w-lg text-3xl font-bold leading-tight tracking-tight">
        이제, 압박 면접과 <MarkerHighlight>마주</MarkerHighlight>할 시간.
      </h1>
      <p className="mt-4 max-w-md text-[#64748B]">
        MAJU 다대다 면접 AI 시뮬레이터 — 실전에 가장 가까운 면접 연습.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isConfigured ? (
          <>
            <Link to="/signup">
              <Button size="lg">시작하기</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                로그인
              </Button>
            </Link>
          </>
        ) : (
          <Link to="/setup">
            <Button size="lg">환경 설정 안내</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
