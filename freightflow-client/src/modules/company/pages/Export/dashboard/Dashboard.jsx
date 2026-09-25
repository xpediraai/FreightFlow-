import { Link } from "react-router-dom";
import React from "react";
import { ArrowUpRight, FileInput, ReceiptText, BriefcaseBusiness, IndianRupee, Truck, Ship, ShieldCheck } from "lucide-react";
import { useERP } from "../../../../../contexts/ERPContext";
import StatusBadge from "../components/common/StatusBadge";
import "./Dashboard.css";



export default function Dashboard() {
  const { store, stats } = useERP();
  const recent = [...store.jobs].reverse().slice(0, 5);
  return <div>
    <div className="page-intro">
      <div><h2>Export Operations</h2><p>Track inquiries, quotations, shipments and service execution from one place.</p></div>
      <div className="quick-actions">
        <Link className="btn primary" to="/company/export/shipping-inquiry">+ New Inquiry</Link>
        <Link className="btn" to="/company/export/quotation">View Quotations</Link>
      </div>
    </div>

    <div className="stat-grid">
      <Stat icon={FileInput} label="Inquiries" value={stats.inquiries} link="/company/export/shipping-inquiry" />
      <Stat icon={ReceiptText} label="Quotations" value={stats.quotations} link="/company/export/quotation" />
      <Stat icon={BriefcaseBusiness} label="Active Jobs" value={stats.activeJobs} link="/company/export/jobs" />
      <Stat icon={IndianRupee} label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} link="/company/export/finance" />
    </div>

    <div className="dashboard-grid">
      <div className="card">
        <div className="card-title"><div><h3>Recent Jobs</h3><p>Latest shipment activity</p></div><Link to="/company/export/jobs">View all <ArrowUpRight size={15} /></Link></div>

        {recent.length === 0 ? <Empty text="No jobs yet. Approve a quotation to create your first job." /> :
          <div className="table-wrap"><table><thead><tr><th>Job</th><th>Customer</th><th>Route</th><th>Services</th><th>Status</th></tr></thead>
            <tbody>{recent.map(j => <tr key={j.id}><td className="strong">{j.jobNo}</td><td>{j.customerName}</td><td>{j.pol} → {j.pod}</td><td><ServiceIcons services={j.services} /></td><td><StatusBadge status={j.status} /></td></tr>)}</tbody></table></div>}
      </div>
      <div className="card">
        <div className="card-title"><div><h3>Service Mix</h3><p>Active jobs by service</p></div></div>
        <ServiceMix jobs={store.jobs} />
      </div>
    </div>
  </div>
}

function Stat({ icon: Icon, label, value, link }) { return <Link to={link} className="stat-card"><div className="stat-icon"><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong></div><ArrowUpRight size={17} className="stat-arrow" /></Link> }
function ServiceIcons({ services = [] }) { return <div className="service-pills">{services.map(s => <span key={s} className={`service-pill ${s}`}>{s === "clearing" ? "CLR" : s === "forwarding" ? "FWD" : "TRN"}</span>)}</div> }
function ServiceMix({ jobs }) { const counts = ["clearing", "forwarding", "transport"].map(s => [s, jobs.filter(j => j.services?.includes(s)).length]); return <div className="service-mix">{counts.map(([s, n]) => <div className="mix-row" key={s}><span>{s === "clearing" ? <ShieldCheck /> : s === "forwarding" ? <Ship /> : <Truck />}{s}</span><div className="progress"><i style={{ width: `${Math.min(100, n * 20)}%` }} /></div><b>{n}</b></div>)}</div> }
function Empty({ text }) { return <div className="empty">{text}</div> }