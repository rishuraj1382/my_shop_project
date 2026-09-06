// frontend/src/SuperAdminOverview.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import StatCard from './components/ui/StatCard';
import Skeleton from './components/ui/Skeleton';
import { API_URL } from './config';

function SuperAdminOverview() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAuthHeader } = useAuth();
  const toast = useToast();

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/overview`, getAuthHeader());
      setStats(res.data);
    } catch (error) {
      toast({ message: 'Failed to load overview.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader, toast]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: 'group', bg: 'bg-primary/10', color: 'text-primary', iconColor: 'text-primary' },
    { label: 'Customers', value: stats.totalCustomers, icon: 'person', bg: 'bg-info-container', color: 'text-on-info-container', iconColor: 'text-on-info-container' },
    { label: 'Shopkeepers', value: stats.totalShopkeepers, icon: 'storefront', bg: 'bg-secondary-container', color: 'text-on-secondary-container', iconColor: 'text-on-secondary-container' },
    { label: 'Total Shops', value: stats.totalShops, icon: 'store', bg: 'bg-primary/10', color: 'text-primary', iconColor: 'text-primary' },
    { label: 'Open Shops', value: stats.openShops, icon: 'check_circle', bg: 'bg-success-container', color: 'text-on-success-container', iconColor: 'text-on-success-container' },
    { label: 'Closed Shops', value: stats.closedShops, icon: 'cancel', bg: 'bg-error-container', color: 'text-on-error-container', iconColor: 'text-on-error-container' },
    { label: 'Total Products', value: stats.totalProducts, icon: 'inventory_2', bg: 'bg-info-container', color: 'text-on-info-container', iconColor: 'text-on-info-container' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'receipt_long', bg: 'bg-tertiary-container', color: 'text-on-tertiary-container', iconColor: 'text-on-tertiary-container' },
    { label: 'Orders Today', value: stats.ordersToday, icon: 'today', bg: 'bg-info-container', color: 'text-on-info-container', iconColor: 'text-on-info-container' },
    { label: 'Delivered Orders', value: stats.completedOrders, icon: 'done_all', bg: 'bg-success-container', color: 'text-on-success-container', iconColor: 'text-on-success-container' },
    { label: 'Cancelled Orders', value: stats.cancelledOrders, icon: 'cancel', bg: 'bg-error-container', color: 'text-on-error-container', iconColor: 'text-on-error-container' },
    { label: 'Platform Sales', value: `₹${(stats.totalPlatformSales || 0).toFixed(2)}`, icon: 'account_balance_wallet', bg: 'bg-success-container', color: 'text-on-success-container', iconColor: 'text-on-success-container' },
    { label: 'New Users Today', value: stats.newUsersToday, icon: 'person_add', bg: 'bg-tertiary-container', color: 'text-on-tertiary-container', iconColor: 'text-on-tertiary-container' },
  ] : [];

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Super Admin</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Platform Overview</h1>
        <p className="text-on-surface-variant mt-2">A snapshot of the entire marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 13 }).map((_, i) => (
            <Skeleton key={i} height="5rem" rounded="2xl" />
          ))
        ) : (
          cards.map((c) => <StatCard key={c.label} {...c} />)
        )}
      </div>
    </div>
  );
}

export default SuperAdminOverview;
