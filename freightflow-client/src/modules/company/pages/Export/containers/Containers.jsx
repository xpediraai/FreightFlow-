import { useERP } from "../../../../../contexts/ERPContext";
import React from "react";
import StatusBadge from "../components/common/StatusBadge";
import "./Containers.css";


const statuses = ["Requested", "Allocated", "Empty Picked Up", "At Factory", "Stuffed", "Gate In", "Loaded", "On Vessel", "Discharged", "Delivered"];

export default function Containers() {
    const { store, patch } = useERP();
    return <div><div className="toolbar"><p className="muted">Container-level tracking across all export jobs.</p></div><div className="card table-card"><div className="table-wrap"><table><thead><tr><th>Job</th><th>Container</th><th>Type</th><th>Seal</th><th>Weight</th><th>Status</th><th>Update</th></tr></thead><tbody>{store.containers.map(c => { const j = store.jobs.find(x => x.id === c.jobId); return <tr key={c.id}><td className="strong">{j?.jobNo}</td><td>{c.containerNo || "Not assigned"}</td><td>{c.containerType}</td><td>{c.sealNo || "—"}</td><td>{c.weight || "—"}</td><td><StatusBadge status={c.status} /></td><td><select className="compact-select" value={c.status} onChange={e => patch("containers", c.id, { status: e.target.value })}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td></tr> })}</tbody></table>{store.containers.length === 0 && <div className="empty">No containers yet.</div>}</div></div></div>
}