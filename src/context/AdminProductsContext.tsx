"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Product } from "@/types";
import { fetchProducts } from "@/lib/api/products";

interface AdminProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const AdminProductsContext = createContext<AdminProductsContextType | undefined>(
  undefined
);

export function AdminProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch((err: unknown) => {
        // Surface the most descriptive message available
        let msg = "Failed to load products.";
        if (err instanceof Error) {
          msg = err.message;
        } else if (
          err &&
          typeof err === "object" &&
          "response" in err
        ) {
          const axiosErr = err as {
            response?: { data?: { message?: string }; status?: number };
            message?: string;
          };
          msg =
            axiosErr.response?.data?.message ||
            axiosErr.message ||
            `Server error (${axiosErr.response?.status ?? "unknown"})`;
        }
        console.error("[AdminProductsContext] fetchProducts error:", err);
        setError(msg);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProduct = (p: Product) =>
    setProducts((prev) => [p, ...prev]);

  const updateProduct = (p: Product) =>
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x.id !== id));

  const getProduct = (id: string) => products.find((x) => x.id === id);

  return (
    <AdminProductsContext.Provider
      value={{
        products,
        loading,
        error,
        reload: load,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
      }}
    >
      {children}
    </AdminProductsContext.Provider>
  );
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductsContext);
  if (!ctx)
    throw new Error("useAdminProducts must be used within AdminProductsProvider");
  return ctx;
}
