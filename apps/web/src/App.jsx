export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 tracking-tight">
      <p className="mb-2 text-sm font-semibold text-[#64748B]">MAJU Service</p>
      <h1 className="text-center text-2xl font-bold text-[#2A2A2A]">
        실제 서비스 웹은 이 폴더에서 개발합니다
      </h1>
      <p className="mt-4 text-center text-sm text-[#64748B]">
        Waitlist 랜딩 페이지는{' '}
        <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5 text-[#2A2A2A]">
          apps/landing
        </code>
        에 있습니다.
      </p>
    </div>
  );
}
