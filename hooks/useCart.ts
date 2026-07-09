// Cart feature removed — stub for backward compatibility
export function useCart() {
  return {
    cart: { items: [], itemCount: 0 },
    items: [] as never[],
    itemCount: 0,
    addItem: () => {},
    removeItem: () => {},
    clearCart: () => {},
    isInCart: () => false,
    mounted: true,
  };
}
