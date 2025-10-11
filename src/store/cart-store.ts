import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  nom: string;
  prix: number;
  prixReduit?: number;
  quantite: number;
  image: string;
  taille?: string;
  couleur?: string;
  variantId?: string;
  maxQuantity?: number; // Stock disponible pour cette variante/produit
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantite: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      
      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => 
              item.productId === newItem.productId && 
              item.taille === newItem.taille && 
              item.couleur === newItem.couleur
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantite += newItem.quantite;
            return { 
              items: updatedItems, 
              isOpen: true // Open cart when item is added
            };
          } else {
            // Add new item
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            return { 
              items: [...state.items, { ...newItem, id }], 
              isOpen: true // Open cart when item is added
            };
          }
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantite) => {
        if (quantite <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              // Limiter la quantité au stock disponible
              const maxQty = item.maxQuantity || Infinity;
              const finalQuantity = Math.min(quantite, maxQty);
              return { ...item, quantite: finalQuantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.prixReduit && item.prixReduit > 0 ? item.prixReduit : item.prix;
          return total + (price * item.quantite);
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantite, 0);
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);