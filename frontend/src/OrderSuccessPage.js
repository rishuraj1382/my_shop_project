// frontend/src/OrderSuccessPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from './components/ui/Button';

function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="bg-surface-container-lowest rounded-3xl p-10 sm:p-14 text-center max-w-lg w-full shadow-xl shadow-success/10">
        {/* Animated Checkmark */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-success-container animate-ping opacity-30" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-success shadow-lg shadow-success/30 animate-bounce-once">
            <span className="material-symbols-outlined text-on-success text-5xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
              check
            </span>
          </div>
        </div>

        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
          Order Placed!
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">
          Your order has been placed successfully. You can track its status using the order ID below.
        </p>

        {/* Order ID */}
        <div className="mt-6 bg-surface-container-high rounded-2xl px-6 py-4 inline-block">
          <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Order ID</span>
          <p className="font-mono text-on-surface font-bold text-sm select-all break-all">{orderId}</p>
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button as={Link} to={`/track/${orderId}`} variant="primary" iconLeft="local_shipping">
            Track Order
          </Button>
          <Button as={Link} to="/" variant="secondary" iconLeft="storefront">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
