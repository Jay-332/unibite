
import Link from "next/link";
import Image from "next/image";
import { User, Store, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100 via-white to-emerald-100">

      <div className="max-w-4xl w-full">
        <div className="flex flex-col items-center justify-center mb-4">
          <Image src="/logo-bowl.jpg" alt="UniBites Bowl" width={120} height={120} className="object-contain rounded-2xl shadow-lg border border-green-100" />
          <h1 className="text-5xl font-bold text-green-700 mt-4">UniBites</h1>
        </div>
        <p className="text-gray-500 text-center mb-12 text-lg">
          Smart Food & Budget Planner
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-green-100">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <User size={120} className="text-green-600" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                <User size={32} />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">Student</h2>
              <p className="text-gray-500 mb-8 h-12">
                Order meals, track your budget, and get healthy food suggestions.
              </p>

              <div className="space-y-3">
                <Link
                  href="/login?role=student"
                  className="block w-full text-center bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition"
                >
                  Student Login
                </Link>
                <Link
                  href="/signup?role=student"
                  className="block w-full text-center bg-green-50 text-green-700 font-semibold py-3.5 rounded-xl hover:bg-green-100 transition"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-blue-100">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Store size={120} className="text-blue-600" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Store size={32} />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">Vendor</h2>
              <p className="text-gray-500 mb-8 h-12">
                Manage your canteen menu, orders, and earnings efficiently.
              </p>

              <div className="space-y-3">
                <Link
                  href="/login?role=vendor"
                  className="block w-full text-center bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition"
                >
                  Vendor Login
                </Link>
                <Link
                  href="/signup?role=vendor"
                  className="block w-full text-center bg-blue-50 text-blue-700 font-semibold py-3.5 rounded-xl hover:bg-blue-100 transition"
                >
                  Create Vendor Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
