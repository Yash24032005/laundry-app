import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  MdSearch, MdFilterList, MdAdd, MdVisibility,
  MdEdit, MdLocalLaundryService, MdRefresh
} from 'react-icons/md';

const STATUSES = ['', 'RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: '', customerName: '', phone: '', garmentType: '' });
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/orders', { params });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const getNextStatus = (current) => {
    const order = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{pagination?.total || 0} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchOrders}><MdRefresh /> Refresh</button>
          <button className="btn btn-primary" onClick={() => navigate('/orders/new')}><MdAdd /> New Order</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label>Customer Name</label>
            <div style={{ position: 'relative' }}>
              <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                placeholder="Search name..."
                value={filters.customerName}
                onChange={e => { setFilters({ ...filters, customerName: e.target.value }); setPage(1); }}
                style={{ paddingLeft: 34 }}
              />
            </div>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label>Phone</label>
            <input
              placeholder="Search phone..."
              value={filters.phone}
              onChange={e => { setFilters({ ...filters, phone: e.target.value }); setPage(1); }}
            />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label>Garment Type</label>
            <input
              placeholder="e.g. Shirt..."
              value={filters.garmentType}
              onChange={e => { setFilters({ ...filters, garmentType: e.target.value }); setPage(1); }}
            />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label>Status</label>
            <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
              {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ status: '', customerName: '', phone: '', garmentType: '' }); setPage(1); }}>
            <MdFilterList /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-spinner">
            <MdLocalLaundryService style={{ fontSize: 28, animation: 'spin 1s linear infinite' }} />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <MdLocalLaundryService style={{ fontSize: 48 }} />
            <h3 style={{ marginBottom: 8 }}>No orders found</h3>
            <p style={{ marginBottom: 20 }}>Try changing filters or create a new order</p>
            <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>Create First Order</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '2px solid var(--border)' }}>
                  {['Order ID', 'Customer', 'Phone', 'Garments', 'Amount', 'Status', 'Payment', 'Est. Delivery', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      style={{
                        cursor: 'pointer', transition: 'background 0.15s',
                        borderBottom: '1px solid var(--border)',
                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                          {order.orderId}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14 }}>{order.customer?.name}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{order.customer?.phone}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>
                        {order.garments?.slice(0, 2).map(g => `${g.type}(${g.quantity})`).join(', ')}
                        {order.garments?.length > 2 && <span style={{ color: 'var(--text-muted)' }}> +{order.garments.length - 2}</span>}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 15 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge-${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/orders/${order._id}`)}
                            title="View"
                          >
                            <MdVisibility />
                          </button>
                          {nextStatus && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => handleStatusUpdate(order._id, nextStatus, e)}
                              title={`Mark as ${nextStatus}`}
                              style={{ fontSize: 11, padding: '5px 10px' }}
                            >
                              → {nextStatus}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-secondary btn-sm" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Orders;
