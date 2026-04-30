import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend
// } from 'recharts';
import api from '../utils/api';
// import {
//   MdShoppingBag, MdCurrencyRupee, MdToday, MdLocalLaundryService,
//   MdTrendingUp, MdArrowForward, MdReceiptLong, MdCheckCircle
// } from 'react-icons/md';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import {
  MdShoppingBag, MdCurrencyRupee, MdLocalLaundryService,
  MdTrendingUp, MdArrowForward, MdReceiptLong, MdCheckCircle
} from 'react-icons/md';

const STATUS_COLORS = {
  RECEIVED: '#3b82f6',
  PROCESSING: '#f59e0b',
  READY: '#10b981',
  DELIVERED: '#6b7280'
};

const StatCard = ({ icon, label, value, subtitle, color, onClick }) => (
  <div
    className="card"
    onClick={onClick}
    style={{
      padding: 24, cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s', borderLeft: `4px solid ${color}`
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'none')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <div style={{ fontSize: 32, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--primary)', marginTop: 6 }}>{value}</div>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>}
      </div>
      <div style={{ width: 48, height: 48, background: `${color}20`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color }}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/dashboard/revenue-chart?days=7')
        ]);
        setData(dashRes.data.data);
        setChartData(chartRes.data.data.map(d => ({
          date: new Date(d._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          orders: d.orders,
          revenue: d.revenue
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <MdLocalLaundryService style={{ fontSize: 32, animation: 'spin 1s linear infinite' }} />
      Loading dashboard...
    </div>
  );

  const statusPieData = data ? Object.entries(data.ordersByStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your laundry business</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
          + New Order
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard
          icon={<MdShoppingBag />}
          label="Total Orders"
          value={data?.overview?.totalOrders || 0}
          subtitle={`${data?.overview?.todayOrders || 0} today`}
          color="#3b82f6"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          icon={<MdCurrencyRupee />}
          label="Total Revenue"
          value={`₹${(data?.overview?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="All time"
          color="#10b981"
        />
        <StatCard
          icon={<MdCheckCircle />}
          label="Collected"
          value={`₹${(data?.overview?.totalCollected || 0).toLocaleString('en-IN')}`}
          subtitle={`₹${(data?.overview?.pendingAmount || 0).toLocaleString('en-IN')} pending`}
          color="#f59e0b"
        />
        <StatCard
          icon={<MdTrendingUp />}
          label="This Month"
          value={`₹${(data?.overview?.monthRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Monthly revenue"
          color="#e94560"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#e94560" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Orders by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {statusPieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>Recent Orders</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/orders')}>
              View All <MdArrowForward />
            </button>
          </div>
          {data?.recentOrders?.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <MdReceiptLong style={{ fontSize: 36 }} />
              <p>No orders yet</p>
            </div>
          ) : (
            data?.recentOrders?.map(order => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{order.customer?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>₹{order.totalAmount}</div>
                  <span className={`badge badge-${order.status?.toLowerCase()}`} style={{ fontSize: 10 }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Popular Garments */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Popular Garments</h3>
          {data?.popularGarments?.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <MdLocalLaundryService style={{ fontSize: 36 }} />
              <p>No data yet</p>
            </div>
          ) : (
            data?.popularGarments?.map((g, i) => (
              <div key={g._id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: i === 0 ? '#fef3c7' : 'var(--surface-2)',
                  color: i === 0 ? '#d97706' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{g._id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.totalQuantity} pieces</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)' }}>
                  ₹{g.totalRevenue?.toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
