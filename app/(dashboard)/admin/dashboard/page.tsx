"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  ClipboardList, 
  Utensils, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Loader2,
  AlertCircle,
  MoreVertical
} from "lucide-react";

interface OrderItem {
  id: string;
  menuItem: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-200",
  READY: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      
      // Optimistic update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeOrders = orders.filter(o => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completedToday = orders.filter(o => o.status === "COMPLETED").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Canteen Manager</h1>
          <p className="text-gray-500 mt-1">Manage live orders and menu availability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">{activeOrders.length} Active Orders</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{completedToday} Completed Today</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Orders Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Incoming Orders
            </h2>
            <button 
              onClick={fetchOrders}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-500">No active orders right now.</p>
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">Order #{order.id.slice(-4).toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.user.name} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === "PENDING" && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "PREPARING")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          Confirm & Prepare
                        </button>
                      )}
                      {order.status === "PREPARING" && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "READY")}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                        >
                          Mark as Ready
                        </button>
                      )}
                      {order.status === "READY" && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                        >
                          Complete Pickup
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 bg-gray-50/50">
                    <ul className="space-y-2">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            <span className="font-bold text-gray-900">{item.quantity}x</span> {item.menuItem.name}
                          </span>
                          <span className="font-medium text-gray-600">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Total Amount</span>
                      <span className="text-lg font-black text-gray-900">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Management Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-blue-600" />
              Menu Control
            </h3>
            <p className="text-sm text-gray-500 mb-6">Quickly toggle availability of popular items or manage your full menu.</p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                Manage All Menu Items
              </button>
              <button className="w-full py-3 bg-blue-50 border border-blue-100 rounded-xl font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                Add New Item
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5" />
              Canteen Settings
            </h3>
            <p className="text-indigo-100 text-sm mb-6">Update your opening hours, location or closing status.</p>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
              <span className="font-medium">Canteen Open</span>
              <div className="w-10 h-6 bg-green-400 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
