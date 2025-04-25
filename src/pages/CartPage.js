// src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService';
import './CartPage.css';

const CartPage = () => {
  const {
    cartItems,
    itemCount,
    totalPrice,
    updateItemQuantity,
    removeItemFromCart,
    clearCart
  } = useCart();

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // State for delivery address form
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Handlers for quantity/remove buttons
  const handleQuantityChange = (itemId, currentQuantity, change) => {
      const newQuantity = currentQuantity + change;
      updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
      removeItemFromCart(itemId);
  };

  // Handler for address input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handler for "Proceed to Checkout" button click
  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
        alert("Please log in to proceed to checkout.");
        // Consider triggering login modal here
        return;
    }
    if (cartItems.length > 0) {
        setShowAddressForm(true);
        setOrderError(null);
    } else {
        alert("Your cart is empty.");
    }
  };

  // Handler for final order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);

    if (!address.street || !address.city || !address.state || !address.zipCode) {
        setOrderError("Please fill in all delivery address fields.");
        return;
    }

    setIsPlacingOrder(true);

    // IMPORTANT: Get restaurant ID. Assumes single restaurant cart for now.
    // This needs refinement for multi-restaurant carts.
    const restaurantId = cartItems[0]?.restaurant || null;
    if (!restaurantId) {
        console.error("Error: Restaurant ID missing from cart items.", cartItems);
        setOrderError("Cannot place order - item details missing restaurant info.");
        setIsPlacingOrder(false);
        return;
    }

    const orderData = {
        restaurant: restaurantId,
        orderItems: cartItems.map(item => ({
            menuItem: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        deliveryAddress: address,
        totalAmount: totalPrice
    };

    try {
        console.log("Placing order with data:", orderData);
        const savedOrder = await createOrder(orderData);
        console.log("Order placed successfully:", savedOrder);

        alert(`Order placed successfully! Your order ID: ${savedOrder._id}`);
        clearCart();
        // TODO: Create and navigate to an Order History page
        navigate('/my-orders'); // Redirecting (assuming this route exists)

    } catch (err) {
        console.error("Failed to place order:", err);
        setOrderError(err.message || 'Error placing order. Please try again.');
    } finally {
        setIsPlacingOrder(false);
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is currently empty.</p>
          <Link to="/" className="btn-link-shop">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Items List */ }
          <ul className="cart-item-list">
            {cartItems.map(item => (
              <li key={item._id} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{item.price.toFixed(2)} each</span>
                </div>
                <div className="item-controls">
                  <button
                    className="quantity-btn decrement-btn"
                    onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                    title="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="item-quantity">{item.quantity}</span>
                  <button
                    className="quantity-btn increment-btn"
                    onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                    title="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item._id)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
                <div className="item-subtotal">
                    {(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <hr className="cart-divider" />

          {/* Cart Summary */ }
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
              <span>{totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee:</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row total-row">
              <strong>Estimated Total:</strong>
              <strong>{totalPrice.toFixed(2)}</strong>
            </div>

            {/* Conditional Display: Address Form or Checkout Button */ }
            {!showAddressForm ? (
              <div className="cart-actions">
                  <button
                     className="clear-cart-btn"
                     onClick={clearCart}
                     disabled={!cartItems || cartItems.length === 0}
                  >
                     Clear Cart
                   </button>
                  <button
                      className="checkout-btn"
                      onClick={handleCheckoutClick}
                      disabled={!cartItems || cartItems.length === 0}
                  >
                      Proceed to Checkout
                  </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="address-form">
                  <h3>Enter Delivery Address</h3>
                  {orderError && <p className="error-message">{orderError}</p>}
                  <div className="form-group">
                      <label htmlFor="street">Street Address*</label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        required
                        disabled={isPlacingOrder}
                      />
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label htmlFor="city">City*</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            required
                            disabled={isPlacingOrder}
                           />
                      </div>
                      <div className="form-group">
                          <label htmlFor="state">State*</label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            required
                            disabled={isPlacingOrder}
                          />
                      </div>
                      <div className="form-group">
                          <label htmlFor="zipCode">Zip Code*</label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={address.zipCode}
                            onChange={handleAddressChange}
                            required
                            disabled={isPlacingOrder}
                          />
                      </div>
                  </div>
                  <div className="form-actions">
                     <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="cancel-btn"
                        disabled={isPlacingOrder}
                      >
                         Back to Cart
                     </button>
                     <button
                        type="submit"
                        className="submit-btn place-order-btn"
                        disabled={isPlacingOrder}
                      >
                         {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                     </button>
                  </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;