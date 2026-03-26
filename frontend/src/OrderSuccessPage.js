// frontend/src/OrderSuccessPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';

function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="bg-surface-container-lowest rounded-3xl p-10 sm:p-14 text-center max-w-lg w-full shadow-xl shadow-emerald-500/5">
        {/* Animated Checkmark */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-400/40 animate-bounce-once">
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
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
          <Link
            to={`/track/${orderId}`}
            className="btn-primary"
          >
            <span className="material-symbols-outlined text-lg">local_shipping</span>
            Track Order
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
