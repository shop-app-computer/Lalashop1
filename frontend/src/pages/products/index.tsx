import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/layout/Header";
import MainSidebar from "@/components/layout/MainSidebar";
import { Product } from "@/types";
import { apiClient } from "@/services/apiClient";

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient("/products");
        if (response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
        setError(null);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError("Connection Error: " + err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      
      <MainSidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-16">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">All Products</h1>
            <p className="text-sm text-gray-400 font-bold">{Array.isArray(products) ? products.length : 0} Products Found</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 font-bold">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.isArray(products) && products.map((product) => (
                <Link 
                  key={product._id} 
                  href={`/product/${product._id}`}
                  className="block text-inherit hover:no-underline group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      <img 
                        src={Array.isArray(product.image) ? product.image[0] : (product.image || "/placeholder.png")} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px]">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 mb-4 flex-1">
                        {product.description || "No description available."}
                      </p>
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-primary">฿</span>
                          <span className="text-lg font-bold text-primary">
                            {(product.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && (!Array.isArray(products) || products.length === 0) && (
            <div className="text-center py-20 text-gray-500 font-bold">
              No products available at the moment.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
