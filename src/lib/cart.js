import { create } from "zustand";

/**
 * @typedef {Object} CartItem
 * @property {string} id - Unique identifier for the item
 * @property {string} name - Name of the monitor
 * @property {string} info - Brief information about the monitor
 * @property {string} description - Detailed description
 * @property {string} category - Monitor category
 * @property {number} price - Weekly Rental Price of the item
 * @property {number} PricePerMonth - Monthly Rental Price of the item
 * @property {string} imageUrl - Image URL
 * @property {Object.<string, string>} spec - Specifications as key-value pairs
 * @property {number} quantity - Quantity of this item in cart
 */

/**
 * @typedef {Object} CartState
 * @property {CartItem[]} selectedItems - Array of items in cart
 * @property {(item: CartItem) => void} addItem - Add item to cart or increment quantity
 * @property {(itemId: string) => void} removeItem - Remove item from cart completely
 * @property {(itemId: string, quantity: number) => void} updateQuantity - Update item quantity
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<CartState>>} */
const useCart = create((set) => ({
  selectedItems: [],
  addItem: (item) =>
    set((state) => {
      const existingItem = state.selectedItems.find(i => i.id === item.id);
      if (existingItem) {
        // Increment quantity if item already exists
        return {
          selectedItems: state.selectedItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      // Add new item with quantity 1
      return {
        selectedItems: [...state.selectedItems, { ...item, quantity: 1 }],
      };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter(
        (item) => item.id !== itemId
      ),
    })),
  updateQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          selectedItems: state.selectedItems.filter(
            (item) => item.id !== itemId
          ),
        };
      }
      return {
        selectedItems: state.selectedItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };
    }),
}));

export default useCart;
