import React, { useState } from "react";
import { Plus, CreditCard, IndianRupee } from "lucide-react";
import { useERP } from "../../../../../contexts/ERPContext";
import Modal from "../components/common/Modal";
import StatusBadge from "../components/common/StatusBadge";
import "./Finance.css";



export default function Finance() {
    const { store, add } = useERP(); const [tab, setTab] = useState("invoices"); const [open, setOpen] = useState(false);
    const invoiceTotal = i => Number(i.grandTotal || 0);
    const createInvoice = e => { e.preventDefault(); const f = new FormData(e.currentTarget); const total = Number(f.get("grandTotal") || 0); add("invoices", { invoiceNo: `INV-${new Date().getFullYear()}-${String(store.invoices.length + 1).padStart(4, "0")}`, jobNo: f.get("jobNo"), customerName: f.get("customerName"), grandTotal: total, balance: total, status: "Unpaid" }); setOpen(false) };
    return <div><div className="finance-summary"><div><span>Total Revenue</span><b>₹{store.invoices.reduce((s, i) => s + invoiceTotal(i), 0).toLocaleString("en-IN")}</b></div><div><span>Outstanding</span><b>₹{store.invoices.reduce((s, i) => s + Number(i.balance || 0), 0).toLocaleString("en-IN")}</b></div><div><span>Vendor Costs</span><b>₹{store.costs.reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString("en-IN")}</b></div></div>
        <div className="toolbar"><div className="tabs"><button className={tab === "invoices" ? "active" : ""} onClick={() => setTab("invoices")}>Customer Invoices</button><button className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>Payments</button><button className={tab === "costs" ? "active" : ""} onClick={() => setTab("costs")}>Vendor Costs</button></div>{tab === "invoices" && <button className="btn primary" onClick={() => setOpen(true)}><Plus size={17} /> Create Invoice</button>}</div>
        {tab === "invoices" && <InvoiceTable />}{tab === "payments" && <PaymentTable />}{tab === "costs" && <CostTable />}
        <Modal open={open} title="Create Customer Invoice" onClose={() => setOpen(false)}><form onSubmit={createInvoice}><div className="form-grid"><Field label="Job No"><input name="jobNo" required /></Field><Field label="Customer"><input name="customerName" required /></Field><Field label="Grand Total"><input name="grandTotal" type="number" required /></Field></div><div className="modal-footer"><button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button><button className="btn primary">Create Invoice</button></div></form></Modal>
    </div>
}
function InvoiceTable() { const { store } = useERP(); return <Table><thead><tr><th>Invoice</th><th>Job</th><th>Customer</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead><tbody>{store.invoices.map(i => <tr key={i.id}><td className="strong">{i.invoiceNo}</td><td>{i.jobNo}</td><td>{i.customerName}</td><td>₹{Number(i.grandTotal).toLocaleString("en-IN")}</td><td>₹{Number(i.balance).toLocaleString("en-IN")}</td><td><StatusBadge status={i.status} /></td></tr>)}</tbody></Table> }
function PaymentTable() { const { store } = useERP(); return <Table><thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Mode</th><th>Reference</th></tr></thead><tbody>{store.payments.map(p => <tr key={p.id}><td>{p.date}</td><td>{p.invoiceNo}</td><td>₹{Number(p.amount).toLocaleString("en-IN")}</td><td>{p.mode}</td><td>{p.reference}</td></tr>)}</tbody></Table> }
function CostTable() { const { store } = useERP(); return <Table><thead><tr><th>Date</th><th>Job</th><th>Service</th><th>Vendor</th><th>Amount</th></tr></thead><tbody>{store.costs.map(c => <tr key={c.id}><td>{c.date}</td><td>{c.jobNo}</td><td>{c.service}</td><td>{c.vendor}</td><td>₹{Number(c.amount).toLocaleString("en-IN")}</td></tr>)}</tbody></Table> }
function Table({ children }) { return <div className="card table-card"><div className="table-wrap"><table>{children}</table></div></div> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }