// frontend/src/UnauthorizedPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Button from './components/ui/Button';

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] px-4 animate-fade-in">
      <span className="material-symbols-outlined text-7xl text-error/40 mb-4">lock</span>
      <span className="font-label text-error font-bold tracking-widest text-[10px] uppercase">Error 403</span>
      <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mt-3">
        Access <span className="text-error italic">denied</span>
      </h1>
      <p className="text-on-surface-variant text-base max-w-md mt-4">
        You don't have permission to view this page. If you think this is a mistake, try signing in with a different account.
      </p>
      <Button as={Link} to="/" variant="primary" iconLeft="storefront" className="mt-8">
        Back to Shops
      </Button>
    </div>
  );
}

export default UnauthorizedPage;
