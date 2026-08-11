// frontend/src/SuperAdminOrders.js
// Read-only by design — the admin API has no PATCH for orders; shopkeepers manage
// order status via their own dashboard, not via the super admin.
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import Pagination from './components/ui/Pagination';
import { Table, TableHead, TableBody, TableRow, TableHeaderRow, TableHeaderCell, TableCell } from './components/ui/Table';
import Badge from './components/ui/Badge';
import Skeleton from './components/ui/Skeleton';
import EmptyState from './components/ui/EmptyState';
import SearchInput from './components/ui/SearchInput';
import Select from './components/ui/Select';
import { API_URL } from './config';

const STATUS_CONFIG = {
  Pending:              { variant: 'warning' },
  Confirmed:            { variant: 'info' },
  Packed:               { variant: 'warm' },
  'Ready to Deliver':   { variant: 'success' },
  'Out For Delivery':   { variant: 'info' },
  'Ready for Pickup':   { variant: 'warm' },
  Delivered:            { variant: 'success' },
  Cancelled:            { variant: 'danger' },
};
const STATUS_OPTIONS = ['', ...Object.keys(STATUS_CONFIG)];

function SuperAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { getAuthHeader } = useAuth();
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await axios.get(`${API_URL}/api/admin/orders?${params.toString()}`, getAuthHeader());
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast({ message: 'Failed to load orders.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, startDate, endDate, getAuthHeader, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [search, status, startDate, endDate]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Super Admin</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Order Management</h1>
        <p className="text-on-surface-variant mt-2">Every order placed on the platform.</p>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-6">
        <div className="max-w-xs w-full">
          <SearchInput
            label="Search orders"
            labelHidden
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search customer name or order ID…"
          />
        </div>
        <div className="max-w-[180px] w-full">
          <Select label="Filter by status" labelHidden value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-stitch max-w-[160px]" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-stitch max-w-[160px]" />
      </div>

      <Table>
        <TableHead>
          <TableHeaderRow>
            <TableHeaderCell>Order ID</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Shop</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Payment</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
          </TableHeaderRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={7}><Skeleton height="1.25rem" width="100%" /></TableCell>
              </TableRow>
            ))
          ) : orders.length === 0 ? (
            <tr>
              <TableCell colSpan={7}>
                <EmptyState icon="receipt_long" title="No orders match your filters." />
              </TableCell>
            </tr>
          ) : (
            orders.map((o) => {
              const sc = STATUS_CONFIG[o.status] || { variant: 'neutral' };
              return (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-xs text-on-surface-variant" title={o._id}>
                    #{o._id.slice(-6)}
                  </TableCell>
                  <TableCell className="text-on-surface">{o.customerName}</TableCell>
                  <TableCell className="text-on-surface-variant">{o.shopName || '—'}</TableCell>
                  <TableCell className="font-bold text-on-surface">₹{o.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">{o.paymentMethod || 'COD'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} size="sm">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-on-surface-variant text-xs">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
    </div>
  );
}

export default SuperAdminOrders;
