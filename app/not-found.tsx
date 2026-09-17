import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] text-[#181B25] p-6 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-extrabold text-[#0D52FF]">404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
        <p className="text-sm text-[#525866]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#0D52FF] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#0B44D8] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
