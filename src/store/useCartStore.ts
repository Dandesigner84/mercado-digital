import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id);
    let newItems;
    if (existing) {
      newItems = state.items.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...state.items, { ...item, quantity: 1 }];
    }
    const newTotal = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return { items: newItems, total: newTotal };
  }),
  removeItem: (id) => set((state) => {
    const newItems = state.items.filter((i) => i.id !== id);
    const newTotal = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return { items: newItems, total: newTotal };
  }),
  updateQuantity: (id, quantity) => set((state) => {
    const newItems = state.items.map((i) => 
      i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
    ).filter(i => i.quantity > 0);
    const newTotal = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return { items: newItems, total: newTotal };
  }),
  clearCart: () => set({ items: [], total: 0 }),
}));
