import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-gray-50 text-center p-6">
      <div className="text-8xl font-black text-gray-200">404</div>
      <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      <Link href="/dashboard" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
        Go to Dashboard
      </Link>
    </div>
  );
}
