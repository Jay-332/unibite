"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, MapPin, Clock, Package } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) fetch(`/api/orders/${orderId}`).then((r) => r.json()).then((d) => setOrder(d.order));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 text-sm mb-6">Your order has been successfully placed and is being prepared.</p>

        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-left mb-6">
          <div className="flex items-center gap-3">
            <Package size={16} className="text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="text-sm font-bold text-gray-800">#{orderId?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          {order?.canteen && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Pickup from</p>
                <p className="text-sm font-bold text-gray-800">{order.canteen.name}</p>
              </div>
            </div>
          )}
          {order?.pickupTime && (
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Estimated Pickup</p>
                <p className="text-sm font-bold text-gray-800">{new Date(order.pickupTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link href={`/orders/${orderId}`} className="block w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl hover:bg-orange-600 transition">
            Track Order
          </Link>
          <Link href="/canteens" className="block w-full border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition">
            Order More Food
          </Link>
        </div>
      </div>
    </div>
  );
}
