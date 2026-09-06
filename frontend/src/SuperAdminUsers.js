// frontend/src/SuperAdminUsers.js
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

const ROLE_FILTERS = [
  { id: '', label: 'All' },
  { id: 'customer', label: 'Customers' },
  { id: 'shopkeeper', label: 'Shopkeepers' },
  { id: 'superadmin', label: 'Superadmins' },
];

const OTHER_ROLE = { customer: 'shopkeeper', shopkeeper: 'customer' };

function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { user, getAuthHeader } = useAuth();
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter) params.set('role', roleFilter);
      const res = await axios.get(`${API_URL}/api/admin/users?${params.toString()}`, getAuthHeader());
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast({ message: 'Failed to load users.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, getAuthHeader, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const handleToggleStatus = async (target) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/users/${target._id}/status`,
        { isActive: !target.isActive },
        getAuthHeader()
      );
      setUsers((prev) => prev.map((u) => (u._id === target._id ? res.data : u)));
      toast({ message: `${target.username} is now ${res.data.isActive ? 'active' : 'deactivated'}.`, type: 'success' });
    } catch (error) {
      toast({ message: error.response?.data?.message || 'Failed to update status.', type: 'error' });
    }
  };

  const handleChangeRole = async (target) => {
    const newRole = OTHER_ROLE[target.role];
    if (!newRole) return;
    if (!window.confirm(`Change ${target.username}'s role from ${target.role} to ${newRole}?`)) return;
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/users/${target._id}/role`,
        { role: newRole },
        getAuthHeader()
      );
      setUsers((prev) => prev.map((u) => (u._id === target._id ? res.data : u)));
      toast({ message: `${target.username} is now a ${newRole}.`, type: 'success' });
    } catch (error) {
      toast({ message: error.response?.data?.message || 'Failed to change role.', type: 'error' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Super Admin</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">User Management</h1>
        <p className="text-on-surface-variant mt-2">View and manage every account on the platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex bg-surface-container-high rounded-xl p-1 self-start">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                roleFilter === f.id ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <SearchInput
            label="Search users"
            labelHidden
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search username, name, email…"
          />
        </div>
      </div>

      <Table>
        <TableHead>
          <TableHeaderRow>
            <TableHeaderCell>Username</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Registered</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Provider</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
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
          ) : users.length === 0 ? (
            <tr>
              <TableCell colSpan={8}>
                <EmptyState icon="group_off" title="No users match your filters." />
              </TableCell>
            </tr>
          ) : (
            users.map((u) => {
              const isSelf = !!user && user._id === u._id;
              return (
                <TableRow key={u._id}>
                  <TableCell className="font-bold text-on-surface">{u.username}</TableCell>
                  <TableCell className="text-on-surface-variant">{u.name || '—'}</TableCell>
                  <TableCell className="text-on-surface-variant">{u.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm" className="capitalize">{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-on-surface-variant text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive !== false ? 'success' : 'danger'} dot size="sm">
                      {u.isActive !== false ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-on-surface-variant capitalize">{u.authProvider || 'local'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isSelf}
                        title={isSelf ? 'You cannot modify your own account' : ''}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      {OTHER_ROLE[u.role] && (
                        <button
                          onClick={() => handleChangeRole(u)}
                          disabled={isSelf}
                          title={isSelf ? 'You cannot modify your own account' : ''}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          Make {OTHER_ROLE[u.role]}
                        </button>
                      )}
                    </div>
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

export default SuperAdminUsers;
