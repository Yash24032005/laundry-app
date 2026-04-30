import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdCalculate, MdCheckCircle } from 'react-icons/md';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [garmentPrices, setGarmentPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer: { name: '', phone: '', email: '', address: '' },
    garments: [{ type: 'Shirt', quantity: 1, pricePerItem: 0 }],
    specialInstructions: '',
    paymentMethod: 'CASH',
    estimatedDeliveryDays: 3
  });

  useEffect(() => {
    api.get('/orders/garment-prices').then(res => {
      setGarmentPrices(res.data.data);
      setForm(prev => ({
        ...prev,
        garments: [{ type: 'Shirt', quantity: 1, pricePerItem: res.data.data['Shirt'] || 30 }]
      }));
    });
  }, []);

  const updateGarment = (idx, field, value) => {
    const updated = [...form.garments];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'type') updated[idx].pricePerItem = garmentPrices[value] || 40;
    setForm({ ...form, garments: updated });
  };

  const addGarment = () => {
    const firstType = Object.keys(garmentPrices)[0] || 'Shirt';
    setForm({
      ...form,
      garments: [...form.garments, { type: firstType, quantity: 1, pricePerItem: garmentPrices[firstType] || 30 }]
    });
  };

  const removeGarment = (idx) => {
    if (form.garments.length === 1) return toast.error('At least one garment required');
    setForm({ ...form, garments: form.garments.filter((_, i) => i !== idx) });
  };

  const totalBill = form.garments.reduce((sum, g) => sum + (parseFloat(g.pricePerItem) || 0) * (parseInt(g.quantity) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer.name || !form.customer.phone) {
      return toast.error('Customer name and phone are required');
    }
    setLoading(true);
    try {
      const res = await api.post('/orders', form);
      toast.success(`Order ${res.data.data.orderId} created! 🎉`);
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Order</h1>
          <p className="page-subtitle">Fill in customer and garment details</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/orders')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: 24 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Details */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                👤 Customer Details
              </h3>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  required
                  placeholder="Full name"
                  value={form.customer.name}
                  onChange={e => setForm({ ...form, customer: { ...form.customer, name: e.target.value } })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  required
                  placeholder="+91 98765 43210"
                  value={form.customer.phone}
                  onChange={e => setForm({ ...form, customer: { ...form.customer, phone: e.target.value } })}
                />
              </div>
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={form.customer.email}
                  onChange={e => setForm({ ...form, customer: { ...form.customer, email: e.target.value } })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Address (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Customer address..."
                  value={form.customer.address}
                  onChange={e => setForm({ ...form, customer: { ...form.customer, address: e.target.value } })}
                />
              </div>
            </div>

            {/* Order Settings */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>⚙️ Order Settings</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                    <option value="CASH">💵 Cash</option>
                    <option value="RAZORPAY">💳 Razorpay</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="CARD">🏦 Card</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Delivery in (Days)</label>
                  <select value={form.estimatedDeliveryDays} onChange={e => setForm({ ...form, estimatedDeliveryDays: parseInt(e.target.value) })}>
                    {[1, 2, 3, 5, 7, 10].map(d => <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Special Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Any special care instructions..."
                  value={form.specialInstructions}
                  onChange={e => setForm({ ...form, specialInstructions: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Garments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16 }}>👔 Garments</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addGarment}>
                  <MdAdd /> Add Item
                </button>
              </div>

              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 80px 100px 80px 36px',
                gap: 8, padding: '0 0 10px',
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5
              }}>
                <span>Garment Type</span><span>Qty</span><span>Price/Item</span><span>Subtotal</span><span></span>
              </div>

              {form.garments.map((g, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '2fr 80px 100px 80px 36px',
                  gap: 8, alignItems: 'center', marginBottom: 10
                }}>
                  <select value={g.type} onChange={e => updateGarment(idx, 'type', e.target.value)}>
                    {Object.keys(garmentPrices).map(type => <option key={type}>{type}</option>)}
                  </select>
                  <input
                    type="number" min="1"
                    value={g.quantity}
                    onChange={e => updateGarment(idx, 'quantity', parseInt(e.target.value) || 1)}
                    style={{ textAlign: 'center' }}
                  />
                  <input
                    type="number" min="0" step="0.5"
                    value={g.pricePerItem}
                    onChange={e => updateGarment(idx, 'pricePerItem', parseFloat(e.target.value) || 0)}
                  />
                  <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'right', color: 'var(--accent)' }}>
                    ₹{((parseFloat(g.pricePerItem) || 0) * (parseInt(g.quantity) || 0)).toLocaleString('en-IN')}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGarment(idx)}
                    style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}

              {/* Total */}
              <div style={{
                marginTop: 16, padding: '16px', background: 'var(--primary)',
                borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                  <MdCalculate /> Total Bill
                </div>
                <div style={{ fontSize: 28, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white' }}>
                  ₹{totalBill.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.garments.map((g, i) => (
                  <span key={i} style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '4px 12px', fontSize: 12
                  }}>
                    {g.type} × {g.quantity}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ justifyContent: 'center' }}
            >
              {loading ? '⏳ Creating Order...' : <><MdCheckCircle /> Create Order — ₹{totalBill.toLocaleString('en-IN')}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
