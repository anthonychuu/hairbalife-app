// src/utils/cartUtils.js

/**
 * Adds an item to the cart.
 * If the product already exists, increases its quantity.
 */
export const addItemToCart = (cartItems, product) => {
  const existing = cartItems.find((i) => i.id === product.id);

  if (existing) {
    return cartItems.map((i) =>
      i.id === product.id
        ? {
            ...i,
            quantity: i.quantity + 1,
            total: (i.quantity + 1) * i.price,
          }
        : i
    );
  }

  return [...cartItems, { ...product, quantity: 1, total: product.price }];
};

/**
 * Updates an item's quantity directly.
 * If quantity becomes 0, removes the item from the cart.
 */
export const updateQuantity = (cartItems, productId, nextQty) => {
  if (nextQty <= 0) {
    return cartItems.filter((i) => i.id !== productId);
  }

  return cartItems.map((i) =>
    i.id === productId
      ? { ...i, quantity: nextQty, total: nextQty * i.price }
      : i
  );
};

/**
 * Removes an item completely from the cart.
 */
export const removeItem = (cartItems, productId) =>
  cartItems.filter((i) => i.id !== productId);

/**
 * Calculates the total cart price and quantity.
 */
export const calculateTotals = (cartItems) => {
  const total = cartItems.reduce((sum, i) => sum + i.total, 0);
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  return { total, totalQty };
};
