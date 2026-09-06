// frontend/src/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Button from './components/ui/Button';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] px-4 animate-fade-in">
      <span className="material-symbols-outlined text-7xl text-primary/40 mb-4">wrong_location</span>
      <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Error 404</span>
      <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mt-3">
        Page not <span className="text-primary italic">found</span>
      </h1>
      <p className="text-on-surface-variant text-base max-w-md mt-4">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/" variant="primary" iconLeft="storefront" className="mt-8">
        Back to Shops
      </Button>
    </div>
  );
}

export default NotFoundPage;
