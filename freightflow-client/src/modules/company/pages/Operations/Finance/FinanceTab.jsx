import React, { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Award } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import Badge from '../../../../../shared/components/Badge';

const FinanceTab = ({ shipmentId, jobId }) => {
  const [charges, setCharges] = useState([
    { id: 'c-1', name: 'Ocean Freight Charge', type: 'INCOME', entity: 'Godrej Consumer Products', amount: 3500.00, currency: 'USD', status: 'INVOICED' },
    { id: 'c-2', name: 'THC & Terminal Handling', type: 'INCOME', entity: 'Godrej Consumer Products', amount: 450.00, currency: 'USD', status: 'PAID' },
    { id: 'c-3', name: 'Carrier Freight Cost', type: 'EXPENSE', entity: 'Maersk Line / MSC', amount: 2800.00, currency: 'USD', status: 'APPROVED' },
    { id: 'c-4', name: 'Customs Clearance Fee', type: 'EXPENSE', entity: 'Nhava Sheva CHA Services', amount: 250.00, currency: 'USD', status: 'PAID' }
  ]);

  const totalIncome = charges.filter(c => c.type === 'INCOME').reduce((sum, c) => sum + c.amount, 0);
  const totalExpense = charges.filter(c => c.type === 'EXPENSE').reduce((sum, c) => sum + c.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const marginPercentage = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: '4px' }}>
      {/* FINANCIAL SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} /> Total Income (Receivables)
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#065f46' }}>
            USD {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={14} /> Total Expense (Payables)
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#991b1b' }}>
            USD {totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} /> Net Profit Margin ({marginPercentage}%)
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#1e40af' }}>
            USD {netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} style={{ color: '#dc2626' }} /> Shipment Charges & Vouchers
        </h4>
        <Button variant="primary" size="sm" leftIcon={Plus}>Add Charge Line</Button>
      </div>

      {/* CHARGES TABLE */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151', textTransform: 'uppercase', fontSize: '11px' }}>
              <th style={{ padding: '12px 14px' }}>CHARGE DESCRIPTION</th>
              <th style={{ padding: '12px 14px' }}>TYPE</th>
              <th style={{ padding: '12px 14px' }}>CUSTOMER / VENDOR</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>AMOUNT</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {charges.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700', color: '#111827' }}>{c.name}</td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge variant={c.type === 'INCOME' ? 'success' : 'danger'}>{c.type}</Badge>
                </td>
                <td style={{ padding: '12px 14px', color: '#4b5563' }}>{c.entity}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: c.type === 'INCOME' ? '#059669' : '#dc2626' }}>
                  {c.currency} {c.amount.toFixed(2)}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge variant="info">{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceTab;
