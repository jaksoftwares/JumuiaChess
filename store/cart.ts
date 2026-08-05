import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
      })),
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter((i) => i.productId !== productId) };
        }
        return {
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'jumuiya-cart-storage',
    }
  )
);
