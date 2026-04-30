import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  MdArrowBack, MdLocalLaundryService, MdPhone, MdEmail,
  MdHome, MdPayment, MdCheckCircle, MdHistory
} from 'react-icons/md';

const STATUS_FLOW = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

const loadRazorpay = () => new Promise(resolve => {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusNote, setStatusNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch {
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus, note: statusNote });
      toast.success(`Status updated to ${newStatus}`);
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) return toast.error('Razorpay SDK failed to load');

      const res = await api.post('/payment/create-order', { orderId: order.orderId });
      const { razorpayOrderId, amount, keyId, customerName, customerPhone, customerEmail, laundryOrderId } = res.data.data;

      const options = {
        key: keyId,
        amount,
        currency: 'INR',
        name: 'LaundryPro',
        description: `Payment for Order ${laundryOrderId}`,
        order_id: razorpayOrderId,
        prefill: { name: customerName, contact: customerPhone, email: customerEmail },
        theme: { color: '#e94560' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              laundryOrderId
            });
            toast.success('Payment successful! ✅');
            fetchOrder();
          } catch {
            toast.error('Payment verification failed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <MdLocalLaundryService style={{ fontSize: 28, animation: 'spin 1s linear infinite' }} />
      Loading order...
    </div>
  );

  if (!order) return null;

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }} onClick={() => navigate('/orders')}>
            <MdArrowBack /> Back to Orders
          </button>
          <h1 className="page-title" style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>
            {order.orderId}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span>
            <span className={`badge badge-${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Created {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{order.totalAmount?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Bill</div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>📦 Order Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
          {STATUS_FLOW.map((status, idx) => {
            const isCompleted = idx <= currentStatusIdx;
            const isCurrent = idx === currentStatusIdx;
            return (
              <React.Fragment key={status}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: isCompleted ? (isCurrent ? 'var(--accent)' : 'var(--success)') : 'var(--border)',
                    color: isCompleted ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, transition: 'all 0.3s',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(233,69,96,0.2)' : 'none'
                  }}>
                    {isCompleted && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {status}
                  </div>
                </div>
                {idx < STATUS_FLOW.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: idx < currentStatusIdx ? 'var(--success)' : 'var(--border)', transition: 'background 0.3s', marginBottom: 24 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Status Actions */}
        {order.status !== 'DELIVERED' && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label>Status Note (Optional)</label>
              <input placeholder="Add a note for this status update..." value={statusNote} onChange={e => setStatusNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {STATUS_FLOW.slice(currentStatusIdx + 1).map(status => (
                <button key={status} className="btn btn-primary" onClick={() => updateStatus(status)}>
                  <MdCheckCircle /> Mark as {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Customer Info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>👤 Customer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 22, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{order.customer?.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
              <MdPhone /> {order.customer?.phone}
            </div>
            {order.customer?.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                <MdEmail /> {order.customer?.email}
              </div>
            )}
            {order.customer?.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                <MdHome /> {order.customer?.address}
              </div>
            )}
            <div style={{ marginTop: 8, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Delivery</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                📅 {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>💰 Payment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Paid</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(order.amountPaid || 0).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Pending</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{(order.totalAmount - (order.amountPaid || 0)).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Method</span>
              <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
            </div>
            {order.razorpayPaymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.razorpayPaymentId}</span>
              </div>
            )}
            {order.paymentStatus !== 'PAID' && (
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', marginTop: 8 }}
                onClick={handleRazorpayPayment}
                disabled={paymentLoading}
              >
                <MdPayment /> {paymentLoading ? 'Opening...' : 'Pay via Razorpay'}
              </button>
            )}
            {order.paymentStatus === 'PAID' && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: 10, textAlign: 'center', fontWeight: 600 }}>
                ✅ Payment Complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Garments */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>👔 Garments</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Garment', 'Qty', 'Price/Item', 'Subtotal'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.garments?.map((g, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{g.type}</td>
                <td style={{ padding: '12px 16px' }}>{g.quantity}</td>
                <td style={{ padding: '12px 16px' }}>₹{g.pricePerItem}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent)' }}>₹{g.subtotal?.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--primary)' }}>
              <td colSpan={3} style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>TOTAL</td>
              <td style={{ padding: '14px 16px', color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'Syne, sans-serif' }}>
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
        {order.specialInstructions && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>📝 Special Instructions: </span>
            <span style={{ fontSize: 13 }}>{order.specialInstructions}</span>
          </div>
        )}
      </div>

      {/* Status History */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdHistory /> Status History
        </h3>
        {order.statusHistory?.map((h, i) => (
          <div key={i} style={{
            display: 'flex', gap: 16, padding: '12px 0',
            borderBottom: i < order.statusHistory.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {i === order.statusHistory.length - 1 ? '🔵' : '✅'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{h.status}</div>
              {h.note && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>"{h.note}"</div>}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {new Date(h.updatedAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderDetail;
