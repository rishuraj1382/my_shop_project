// frontend/src/SuperAdminShops.js
// Read-only by design — the admin API has no PATCH for shops; shopkeepers manage
// their own open/closed status via their own dashboard, not via the super admin.
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './Toast';
import Pagination from './components/ui/Pagination';
import { Table, TableHead, TableBody, TableRow, TableHeaderRow, TableHeaderCell, TableCell } from './components/ui/Table';
import Badge from './components/ui/Badge';
import EmptyState from './components/ui/EmptyState';
import Skeleton from './components/ui/Skeleton';
import SearchInput from './components/ui/SearchInput';
import { API_URL } from './config';

function SuperAdminShops() {
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { getAuthHeader } = useAuth();
  const toast = useToast();

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search.trim()) params.set('search', search.trim());
      const res = await axios.get(`${API_URL}/api/admin/shops?${params.toString()}`, getAuthHeader());
      setShops(res.data.shops);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast({ message: 'Failed to load shops.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, getAuthHeader, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchShops(), 300);
    return () => clearTimeout(timer);
  }, [fetchShops]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Super Admin</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Shop Management</h1>
        <p className="text-on-surface-variant mt-2">Every shop on the platform.</p>
      </div>

      <div className="max-w-xs mb-6">
        <SearchInput
          label="Search shops"
          labelHidden
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search shop, owner, city…"
        />
      </div>

      <Table>
        <TableHead>
          <TableHeaderRow>
            <TableHeaderCell>Shop Name</TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell>City</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Products</TableHeaderCell>
            <TableHeaderCell>Orders</TableHeaderCell>
            <TableHeaderCell>Rating</TableHeaderCell>
            <TableHeaderCell>Registered</TableHeaderCell>
          </TableHeaderRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={8}>
                  <Skeleton height="1.25rem" width="100%" rounded="lg" />
                </TableCell>
              </TableRow>
            ))
          ) : shops.length === 0 ? (
            <tr>
              <TableCell colSpan={8}>
                <EmptyState icon="storefront" title="No shops match your search." />
              </TableCell>
            </tr>
          ) : (
            shops.map((s) => (
              <TableRow key={s._id}>
                <TableCell className="font-bold text-on-surface">{s.shopName}</TableCell>
                <TableCell className="text-on-surface-variant">{s.username}</TableCell>
                <TableCell className="text-on-surface-variant">{s.city || '—'}</TableCell>
                <TableCell>
                  <Badge variant={s.isOpen === false ? 'danger' : 'success'} icon={s.isOpen === false ? 'cancel' : 'check_circle'} size="sm">
                    {s.isOpen === false ? 'Closed' : 'Open'}
                  </Badge>
                </TableCell>
                <TableCell className="text-on-surface-variant">{s.productCount || 0}</TableCell>
                <TableCell className="text-on-surface-variant">{s.orderCount || 0}</TableCell>
                <TableCell className="text-on-surface-variant">
                  {s.averageRating > 0 ? (
                    <span>
                      <span className="text-tertiary">★</span> {s.averageRating.toFixed(1)}
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-on-surface-variant text-xs">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
    </div>
  );
}

export default SuperAdminShops;
