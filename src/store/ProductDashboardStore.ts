import { Collection, TypeProduct } from "@/types/product";
import { create } from "zustand";

type ProductStoreType = {
  product: TypeProduct | null;
  setProduct: (newProduct: TypeProduct) => void;
  collection: Collection | null;
  setCollection: (newCollection: Collection) => void;
};

export const useProductDashboardStore = create<ProductStoreType>((set) => ({
  product: null,
  setProduct: (newProduct: TypeProduct) => set({ product: newProduct }),
  collection: null,
  setCollection: (newCollection: Collection) =>
    set({ collection: newCollection }),
}));
