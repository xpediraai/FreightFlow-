import React, { useState } from "react";
import { CheckCircle2, Eye, Pencil, Plus, Send, XCircle } from "lucide-react";
import { useERP } from "../../../../../contexts/ERPContext";
import Modal from "../components/common/Modal";
import StatusBadge from "../components/common/StatusBadge";
import { SERVICE_TYPES } from "../data/services";


export default function QuotationList() {
  const { store, patch, createJobFromQuotation } = useERP();
  const [selected, setSelected] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  const createFrom = (inquiry) => { setOpenCreate(false); };
  const total = q => {
    const subtotal = (q.charges || []).reduce((s, c) => s + Number(c.amount || 0), 0);
    const discount = Number(q.discount || 0);
    const taxable = Math.max(0, subtotal - discount);
    return { subtotal, discount, tax: taxable * Number(q.taxRate || 0) / 100, grand: taxable * (1 + Number(q.taxRate || 0) / 100) };
  };
  return <div>
    <div className="toolbar"><div><p className="muted">Create, send and approve service-wise quotations.</p></div><button className="btn primary" onClick={() => setOpenCreate(true)}><Plus size={17} /> New Quotation</button></div>
    <div className="card table-card"><div className="table-wrap"><table><thead><tr><th>Quotation</th><th>Customer</th><th>Services</th><th>Subtotal</th><th>Tax</th><th>Grand Total</th><th>Status</th><th /></tr></thead>
      <tbody>{store.quotations.map(q => { const t = total(q); return <tr key={q.id}><td className="strong">{q.quotationNo}</td><td>{q.customerName}</td><td><div className="service-pills">{[...new Set((q.charges || []).map(c => c.serviceId))].map(s => <span className={`service-pill ${s}`} key={s}>{SERVICE_TYPES.find(x => x.id === s)?.name}</span>)}</div></td><td>₹{t.subtotal.toLocaleString("en-IN")}</td><td>₹{t.tax.toLocaleString("en-IN")}</td><td className="strong">₹{t.grand.toLocaleString("en-IN")}</td><td><StatusBadge status={q.status} /></td><td><div className="row-actions"><button className="icon-btn" onClick={() => setSelected(q)}><Eye size={15} /></button>{q.status === "Draft" && <button title="Send" className="icon-btn" onClick={() => patch("quotations", q.id, { status: "Sent" })}><Send size={15} /></button>}{q.status !== "Approved" && q.status !== "Rejected" && <button title="Approve and create job" className="icon-btn success-icon" onClick={() => { createJobFromQuotation(q) }}><CheckCircle2 size={15} /></button>}{q.status !== "Rejected" && q.status !== "Approved" && <button className="icon-btn danger-icon" onClick={() => patch("quotations", q.id, { status: "Rejected" })}><XCircle size={15} /></button>}</div></td></tr> })}</tbody></table>{store.quotations.length === 0 && <div className="empty">No quotations yet. Open an inquiry and click the quotation action.</div>}</div></div>
    <Modal open={!!selected} title={selected?.quotationNo || "Quotation"} onClose={() => setSelected(null)}>
      {selected && <QuotationDetail q={selected} total={total(selected)} />}
    </Modal>
    <Modal open={openCreate} title="Create Quotation" onClose={() => setOpenCreate(false)}>
      <div className="empty">Select an inquiry from the Shipping Inquiries page and use the <b>document-plus</b> action to generate a quotation automatically.</div>
    </Modal>
  </div>
}

function QuotationDetail({ q, total }) { return <div><div className="detail-grid"><Info label="Customer" value={q.customerName} /><Info label="Valid Until" value={q.validUntil} /><Info label="Status" value={<StatusBadge status={q.status} />} /><Info label="Tax Rate" value={`${q.taxRate}%`} /></div><h3 className="section-title">Service Charges</h3><div className="table-wrap"><table><thead><tr><th>Service</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{q.charges?.map(c => <tr key={c.id}><td>{SERVICE_TYPES.find(s => s.id === c.serviceId)?.name}</td><td>{c.description}</td><td>{c.quantity}</td><td>₹{Number(c.rate).toLocaleString("en-IN")}</td><td>₹{Number(c.amount).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div><div className="totals"><span>Subtotal <b>₹{total.subtotal.toLocaleString("en-IN")}</b></span><span>Discount <b>₹{total.discount.toLocaleString("en-IN")}</b></span><span>Tax <b>₹{total.tax.toLocaleString("en-IN")}</b></span><strong>Grand Total <b>₹{total.grand.toLocaleString("en-IN")}</b></strong></div></div> }
function Info({ label, value }) { return <div className="info"><span>{label}</span><b>{value}</b></div> }