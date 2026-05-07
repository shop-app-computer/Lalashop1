"use client";
import Header from "@/components/layout/Header";
import {
   Search, ChevronLeft, Package, Truck,
   MessageSquare, ExternalLink, Calendar,
   ShoppingBag, Clock, CheckCircle2,
   XCircle, ChevronRight, Store, HelpCircle,
   Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { apiClient } from "@/services/apiClient";
import Link from "next/link";
import { motion } from "framer-motion";

interface OrderItem {
   name: string;
   qty: number;
   image: string;
   price: number;
   product: any; // Can be ID string or populated object
   description?: string;
}

interface Order {
   _id: string;
   status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
   totalPrice: number;
   createdAt: string;
   orderItems: OrderItem[];
   paymentMethod: string;
}

export default function OrdersPage() {
   const tabs = ["all", "to pay", "to ship", "to receive", "completed", "canceled"];
   
   // Map UI tabs to Backend statuses
   const statusMap: Record<string, string> = {
      "to pay": "pending",
      "to ship": "processing",
      "to receive": "shipped",
      "completed": "delivered",
      "canceled": "canceled"
   };

   // Map Backend status to UI labels
   const labelMap: Record<string, string> = {
      "pending": "To Pay",
      "processing": "To Ship",
      "shipped": "To Receive",
      "delivered": "Completed",
      "canceled": "Canceled"
   };

   const router = useRouter();
   const [orders, setOrders] = useState<Order[]>([]);
   const [selectedTab, setSelectedTab] = useState<string>("all");
   const [loading, setLoading] = useState(true);

   const loadOrders = async () => {
      setLoading(true);
      try {
         const data = await apiClient("/orders/mine");
         if (data.success) {
            setOrders(data.orders || []);
         }
      } catch (error) {
         console.error("Load Orders Error:", error);
         setOrders([]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadOrders();
   }, []);

   const filteredOrders = useMemo(() => {
      if (selectedTab === "all") return orders;
      const targetStatus = statusMap[selectedTab];
      return orders.filter((o) => o.status === targetStatus);
   }, [orders, selectedTab]);

   const getStatusColor = (status: string) => {
      switch (status) {
         case "delivered": return "text-emerald-500";
         case "canceled": return "text-rose-500";
         case "pending": return "text-[#FE2C55]";
         default: return "text-[#0077b6]";
      }
   };

   const handleDeleteOrder = async (orderId: string) => {
      if (!confirm("Are you sure you want to cancel this order?")) return;
      try {
         const res = await apiClient(`/orders/${orderId}`, { method: "DELETE" });
         if (res.success) {
            setOrders(prev => prev.filter(o => o._id !== orderId));
         }
      } catch (error) {
         console.error("Delete Order Error:", error);
         alert("Failed to delete order");
      }
   };

   return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-light text-dark font-body antialiased overflow-x-hidden">
         <Header />

         {/* Tabs */}
         <div className="bg-white border-b border-gray-border flex overflow-x-auto no-scrollbar sticky top-[52px] z-40 w-full">
            {tabs.map((tab) => (
               <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-4 text-[13px] font-bold tracking-tight whitespace-nowrap transition-all relative flex-1 text-center capitalize ${
                     selectedTab === tab ? "text-primary-hover font-black" : "text-gray-400"
                  }`}
               >
                  {tab}
                  {selectedTab === tab && (
                     <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-hover" 
                     />
                  )}
               </button>
            ))}
         </div>

         <main className="w-full pb-20">
            {loading ? (
               <div className="py-20 flex justify-center w-full">
                  <div className="w-6 h-6 border-2 border-gray-border border-t-primary-hover animate-spin rounded-full" />
               </div>
            ) : filteredOrders.length === 0 ? (
               <div className="py-32 flex flex-col items-center opacity-20 w-full text-gray-400">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="mt-4 text-[13px] font-bold tracking-widest ">no orders found</p>
               </div>
            ) : (
               <div className="space-y-4 mt-2 w-full px-0">
                  {filteredOrders.map((order) => (
                     <div key={order._id} className="bg-white border-y border-gray-border overflow-hidden shadow-sm shadow-black/[0.02]">
                        {/* Store Header */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-[#F8F8F8]">
                           <div className="flex items-center gap-2">
                              <Store size={16} strokeWidth={2.5} />
                              <span className="text-[13px] font-bold tracking-tight">Main Factory</span>
                              <ChevronRight size={14} className="text-[#BBBBBB]" />
                           </div>
                           <div className="flex items-center gap-3">
                              
                              {order.status === 'pending' && (
                                 <button 
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              )}
                           </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-gray-50">
                           {order.orderItems.map((item, idx) => {
                              const productId = typeof item.product === 'object' ? item.product._id : item.product;
                              const displayDescription = item.description || (typeof item.product === 'object' ? item.product.description : "");
                              
                              return (
                                 <div key={idx} className="p-4 flex gap-4">
                                    <Link href={`/product/${productId}`} className="w-20 h-20 bg-[#F5F5F5] flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 hover:opacity-80 transition-opacity">
                                       <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    </Link>
                                    <div className="flex-1 space-y-1 min-w-0">
                                       <Link href={`/product/${productId}`} className="hover:text-blue-600 transition-colors">
                                          <h4 className="text-[14px] font-bold leading-tight line-clamp-2 uppercase">
                                             {item.name}
                                          </h4>
                                       </Link>
                                       <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug mt-1 ">
                                          {displayDescription || "No description available"}
                                       </p>
                                       <div className="flex justify-between items-center mt-2">
                                          <p className="text-[11px] text-[#86878B] font-bold">x{item.qty}</p>
                                          <p className="text-[14px] font-black tracking-tighter">฿{item.price.toLocaleString()}</p>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>

                        {/* Order Summary & Actions */}
                        <div className="px-4 py-4 border-t border-gray-border flex flex-col sm:flex-row justify-between items-center gap-4">
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-500 font-bold tracking-wider">
                                 total {order.orderItems.reduce((acc, item) => acc + item.qty, 0)} items:
                              </span>
                              <span className="text-[20px] font-black text-primary-hover">฿{order.totalPrice.toLocaleString()}</span>
                           </div>

                           <div className="flex gap-2 w-full sm:w-auto">
                              <button className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-border text-[11px] font-bold tracking-wider  active:bg-gray-light transition-all rounded-lg text-dark">
                                 contact shop
                              </button>
                              <button 
                                 onClick={() => {
                                    if (order.status === 'pending') {
                                       router.push(`/buyproduct/transfer?orderId=${order._id}&total=${order.totalPrice}&method=${order.paymentMethod}`);
                                    } else {
                                       router.push(`/buyproduct/receipt?orderId=${order._id}`);
                                    }
                                 }}
                                 className="flex-1 sm:flex-none px-8 py-2.5 bg-dark text-white text-[11px] font-bold tracking-wider  active:opacity-80 transition-all shadow-lg shadow-dark/10 rounded-lg"
                              >
                                 {order.status === 'pending' ? 'continue payment' : 'details'}
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </main>
      </div>
   );
}