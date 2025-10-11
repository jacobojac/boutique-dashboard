import { TypeProduct } from "@/types/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  nom: string;
  prix: number;
  prixReduit?: number;
  image: string;
  slug: string;
  addedAt: Date;
  collections?: string[];
}

interface WishlistState {
  items: WishlistItem[];
  hasHydrated: boolean;
  addItem: (product: TypeProduct) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getItemsCount: () => number;
  setHasHydrated: (state: boolean) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      
      addItem: (product: TypeProduct) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);
        
        if (!existingItem) {
          const newItem: WishlistItem = {
            productId: product.id,
            nom: product.nom,
            prix: product.prix,
            prixReduit: product.prixReduit && product.prixReduit > 0 ? product.prixReduit : undefined,
            image: product.images[0] || "/images/placeholder.jpg",
            slug: product.slug,
            addedAt: new Date(),
            collections: product.collections?.map(pc => pc.collection.nom) || [],
          };
          
          set({ items: [newItem, ...items] });
        }
      },
      
      removeItem: (productId: string) => {
        set(state => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },
      
      isInWishlist: (productId: string) => {
        const { items } = get();
        return items.some(item => item.productId === productId);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
      
      getItemsCount: () => {
        const { items } = get();
        return items.length;
      },
      
      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: "wishlist-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);