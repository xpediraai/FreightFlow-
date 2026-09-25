import React, { useState } from "react";
import { Eye, Truck, FileText, Anchor, ShieldCheck, RefreshCw, CheckCircle2, Plus, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useERP } from "../../../../../contexts/ERPContext";
import StatusBadge from "../components/common/StatusBadge";

import "../clearing/Clearing.css";
import "./JobList.css";


const TRANSPORT_WORKFLOW = [
  { id: "pending", name: "Vehicle Pending" },
  { id: "assigned", name: "Vehicle Assigned" },
  { id: "dispatched", name: "Dispatched to Pickup" },
  { id: "reached_pickup", name: "Reached Pickup Location" },
  { id: "loaded", name: "Cargo Loaded" },
  { id: "in_transit", name: "In Transit to Port" },
  { id: "reached_dest", name: "Reached Port / ICD" },
  { id: "gate_in", name: "Port Gate-In" },
  { id: "completed", name: "Transport Completed" },
];

const CLEARING_WORKFLOW = [
  { id: "documents", name: "Document Collection" },
  { id: "verification", name: "Document Verification" },
  { id: "sbPreparation", name: "Shipping Bill Preparation" },
  { id: "sbFiling", name: "Shipping Bill Filing" },
  { id: "assessment", name: "Customs Assessment" },
  { id: "examination", name: "Customs Examination" },
  { id: "query", name: "Customs Query" },
  { id: "queryResolution", name: "Query Resolution" },
  { id: "leo", name: "LEO / Let Export Order" },
  { id: "completed", name: "Clearing Completed" },
];

const FORWARDING_WORKFLOW = [
  { id: "bookingRequest", name: "Booking Request" },
  { id: "bookingConfirmation", name: "Booking Confirmation" },
  { id: "containerAllocation", name: "Container Allocation" },
  { id: "siSubmission", name: "Shipping Instruction (SI)" },
  { id: "vgmSubmission", name: "VGM Submission" },
  { id: "gateIn", name: "Container Gate-In" },
  { id: "vesselDeparture", name: "Vessel Departure" },
  { id: "blDraft", name: "BL Draft" },
  { id: "blRelease", name: "BL Release" },
  { id: "completed", name: "Forwarding Completed" },
];

export default function JobList() {
  const { store, getJobFullDetails } = useERP();
  const [selectedJobId, setSelectedJobId] = useState(null);

  const jobs = store?.jobs || [];

  return (
    <div className="operations-page">
      {/* EXPORT PIPELINE STEPPER BANNER */}
      <div className="card" style={{ padding: "20px", marginBottom: "20px", backgroundColor: "#0f172a", color: "#fff", borderRadius: "12px" }}>
        <div style={{ marginBottom: "15px" }}>
          <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#f8fafc" }}>🌐 Export Shipping ERP — Complete Process Control</h2>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Full operational field coverage: Trucking, Customs Filing, Checklist Master, Container Seals, HSN Codes & Bill of Lading.
          </p>
        </div>

        <div className="export-stepper" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
          <StepCard step="1" title="Quotation & Job" desc="Agreed Rates & Services" activeIcon={<FileText size={16} />} color="#3b82f6" />
          <StepCard step="2" title="Inland Transport" desc="Vehicle, Driver & LR No" activeIcon={<Truck size={16} />} color="#f59e0b" />
          <StepCard step="3" title="Customs Clearing" desc="SB No, Assessment & LEO" activeIcon={<ShieldCheck size={16} />} color="#8b5cf6" />
          <StepCard step="4" title="Checklist & SI" desc="Containers, Seals & HSN" activeIcon={<Anchor size={16} />} color="#06b6d4" />
          <StepCard step="5" title="Bill of Lading" desc="Master / House B/L" activeIcon={<RefreshCw size={16} />} color="#10b981" />
          <StepCard step="6" title="Finance & Invoice" desc="Tax Invoice & Payments" activeIcon={<CheckCircle2 size={16} />} color="#ec4899" />
        </div>
      </div>

      <div className="page-header">
        <div>
          <h2>Export Jobs Command Center</h2>
          <p className="muted">
            Execute complete single or combined export services per job with full operational fields and 1-click B/L auto-fill.
          </p>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job No</th>
                <th>Customer</th>
                <th>Route (POL → POD)</th>
                <th>Services</th>
                <th>Transport</th>
                <th>Clearing</th>
                <th>Forwarding</th>
                <th>B/L Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const details = getJobFullDetails(j.id);
                const services = details?.services || [];

                return (
                  <tr key={j.id}>
                    <td className="strong">{j.jobNo}</td>
                    <td>{j.customerName}</td>
                    <td>
                      {j.pol} → {j.pod}
                      {j.fpod ? ` (${j.fpod})` : ""}
                    </td>
                    <td>
                      <div className="service-pills" style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {services.map((s) => (
                          <span
                            key={s}
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              backgroundColor: s === "clearing" ? "#ede9fe" : s === "forwarding" ? "#e0f2fe" : "#fef3c7",
                              color: s === "clearing" ? "#6d28d9" : s === "forwarding" ? "#0369a1" : "#b45309",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {details?.hasTransport ? (
                        <StatusBadge status={details?.transport?.status || "Vehicle Pending"} />
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>— N/A —</span>
                      )}
                    </td>
                    <td>
                      {details?.hasClearing ? (
                        <StatusBadge status={details?.clearing?.status || "Documents Pending"} />
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>— N/A —</span>
                      )}
                    </td>
                    <td>
                      {details?.hasForwarding ? (
                        <StatusBadge status={details?.forwarding?.status || "Booking Pending"} />
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>— N/A —</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={details?.billOfLading?.status || "Pending"} />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        onClick={() => setSelectedJobId(j.id)}
                      >
                        ⚡ Full Command Center
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="empty">No export jobs yet. Approve a quotation to create a shipment.</div>
          )}
        </div>
      </div>

      {selectedJobId && (
        <MasterJobCommandCenterModal
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}

function StepCard({ step, title, desc, activeIcon, color }) {
  return (
    <div style={{ backgroundColor: "#1e293b", padding: "10px", borderRadius: "8px", borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ color }}>{activeIcon}</span>
        <strong style={{ fontSize: "0.85rem" }}>{step}. {title}</strong>
      </div>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{desc}</p>
    </div>
  );
}

/* ============================================================
   MASTER UNIFIED JOB COMMAND CENTER MODAL (FULL FIELDS)
============================================================ */

function MasterJobCommandCenterModal({ jobId, onClose }) {
  const { store, getJobFullDetails, updateTransportJob, patch, saveChecklistForJob, syncBLFromJobChecklist, addServiceToJob } = useERP();
  const navigate = useNavigate();

  const details = getJobFullDetails(jobId);

  if (!details || !details.job) return null;
  const { job, hasTransport, hasClearing, hasForwarding, transport, clearing, forwarding, checklist, billOfLading } = details;

  const defaultTab = hasTransport ? "transport" : hasClearing ? "clearing" : hasForwarding ? "forwarding" : "bl";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showBLPreviewModal, setShowBLPreviewModal] = useState(false);

  return (
    <div className="clearing-overlay">
      <div className="clearing-modal" style={{ maxWidth: "1100px", maxHeight: "92vh", overflowY: "auto" }}>
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2>Unified Export Command Center — {job.jobNo}</h2>
            <p className="muted">
              Customer: {job.customerName} | Route: {job.pol} → {job.pod} {job.fpod ? `(${job.fpod})` : ""}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* TOP STATUS SUMMARY BAR */}
        <div className="card" style={{ padding: "12px 16px", margin: "15px 0", backgroundColor: "#f8fafc", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          <div>
            <small style={{ color: "#64748b", display: "block" }}>Trucking Status</small>
            {hasTransport ? (
              <StatusBadge status={transport?.status || "Vehicle Pending"} />
            ) : (
              <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>Not Included</span>
            )}
          </div>
          <div>
            <small style={{ color: "#64748b", display: "block" }}>Customs SB Filing</small>
            {hasClearing ? (
              <StatusBadge status={clearing?.status || "Documents Pending"} />
            ) : (
              <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>Not Included</span>
            )}
          </div>
          <div>
            <small style={{ color: "#64748b", display: "block" }}>Forwarding Booking</small>
            {hasForwarding ? (
              <StatusBadge status={forwarding?.status || "Booking Pending"} />
            ) : (
              <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>Not Included</span>
            )}
          </div>
          <div>
            <small style={{ color: "#64748b", display: "block" }}>Bill of Lading B/L</small>
            <StatusBadge status={billOfLading?.status || "Pending"} />
          </div>
        </div>

        {/* UNIFIED DYNAMIC SERVICE TABS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", marginBottom: "15px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {hasTransport && (
              <button
                className={`btn ${activeTab === "transport" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0" }}
                onClick={() => setActiveTab("transport")}
              >
                🚚 Transport Logistics (Full Fields)
              </button>
            )}

            {hasClearing && (
              <button
                className={`btn ${activeTab === "clearing" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0" }}
                onClick={() => setActiveTab("clearing")}
              >
                🛃 Customs Clearing (Full Fields)
              </button>
            )}

            {hasForwarding && (
              <button
                className={`btn ${activeTab === "forwarding" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0" }}
                onClick={() => setActiveTab("forwarding")}
              >
                📦 Forwarding & Checklist Master
              </button>
            )}

            <button
              className={`btn ${activeTab === "bl" ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0" }}
              onClick={() => setActiveTab("bl")}
            >
              📄 Bill of Lading (B/L Generator)
            </button>
          </div>

          {/* ADD SERVICE ON DEMAND */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Add Service:</span>
            {!hasTransport && (
              <button className="btn btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "0.75rem" }} onClick={() => { addServiceToJob(job.id, "transport"); setActiveTab("transport"); }}>
                + Transport
              </button>
            )}
            {!hasClearing && (
              <button className="btn btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "0.75rem" }} onClick={() => { addServiceToJob(job.id, "clearing"); setActiveTab("clearing"); }}>
                + Clearing
              </button>
            )}
            {!hasForwarding && (
              <button className="btn btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "0.75rem" }} onClick={() => { addServiceToJob(job.id, "forwarding"); setActiveTab("forwarding"); }}>
                + Forwarding
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTENTS (FULL OPERATIONAL FIELDS) */}
        {activeTab === "transport" && hasTransport && (
          <FullTransportTab
            job={job}
            transport={transport}
            onSave={(data) => updateTransportJob(job.id, data)}
          />
        )}

        {activeTab === "clearing" && hasClearing && (
          <FullClearingTab
            job={job}
            clearing={clearing}
            onSave={(data) => {
              if (clearing?.id) {
                patch("clearingJobs", clearing.id, data);
                syncBLFromJobChecklist(job.id);
              }
            }}
          />
        )}

        {activeTab === "forwarding" && hasForwarding && (
          <FullForwardingChecklistTab
            job={job}
            forwarding={forwarding}
            checklist={checklist}
            onSave={(data) => {
              saveChecklistForJob(job.id, data);
            }}
          />
        )}

        {activeTab === "bl" && (
          <FullBLTab
            job={job}
            billOfLading={billOfLading}
            onSync={() => syncBLFromJobChecklist(job.id)}
            onOpenPreview={() => setShowBLPreviewModal(true)}
            onNavigateBL={() => {
              onClose();
              navigate("/company/export/bill-of-lading");
            }}

          />
        )}

        <div className="modal-footer" style={{ marginTop: "20px" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Command Center
          </button>
        </div>
      </div>

      {showBLPreviewModal && billOfLading && (
        <LiveBLPreviewModal
          bl={billOfLading}
          job={job}
          onClose={() => setShowBLPreviewModal(false)}
        />
      )}
    </div>
  );
}

/* ============================================================
   1. FULL TRANSPORT TAB (ALL OPERATIONAL FIELDS)
============================================================ */

function FullTransportTab({ job, transport, onSave }) {
  const [form, setForm] = useState({
    status: transport?.status || "Vehicle Assigned",
    vehicleNo: transport?.vehicleNo || "GJ-01-AB-9988",
    driverName: transport?.driverName || "Suresh Kumar",
    driverPhone: transport?.driverPhone || "+91 97123 45678",
    lrNo: transport?.lrNo || "LR-99812",
    transporterName: transport?.transporterName || "Express Container Logistics",
    pickupDate: transport?.pickupDate || "2026-09-15",
    gateInDate: transport?.gateInDate || "2026-09-16",
    pickupLocation: transport?.pickupLocation || "Ahmedabad Factory GIDC",
    deliveryLocation: transport?.deliveryLocation || job?.pol || "Nhava Sheva Port Gate",
    remarks: transport?.remarks || "Container loaded at factory, driver dispatched.",
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3 style={{ margin: "0 0 15px 0" }}>🚚 Inland Trucking & Factory Pickup (Full Logistics Execution)</h3>

      <div className="form-grid" style={{ marginBottom: "20px" }}>
        <div className="form-field">
          <label>Transport Status</label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            {TRANSPORT_WORKFLOW.map((step) => (
              <option key={step.id} value={step.name}>
                {step.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Vehicle Number</label>
          <input value={form.vehicleNo} onChange={(e) => setForm((p) => ({ ...p, vehicleNo: e.target.value }))} placeholder="e.g. GJ-01-AB-9988" />
        </div>

        <div className="form-field">
          <label>Driver Name</label>
          <input value={form.driverName} onChange={(e) => setForm((p) => ({ ...p, driverName: e.target.value }))} placeholder="Driver Name" />
        </div>

        <div className="form-field">
          <label>Driver Phone</label>
          <input value={form.driverPhone} onChange={(e) => setForm((p) => ({ ...p, driverPhone: e.target.value }))} placeholder="+91..." />
        </div>

        <div className="form-field">
          <label>Lorry Receipt (LR) No.</label>
          <input value={form.lrNo} onChange={(e) => setForm((p) => ({ ...p, lrNo: e.target.value }))} placeholder="LR-12345" />
        </div>

        <div className="form-field">
          <label>Transporter Name</label>
          <input value={form.transporterName} onChange={(e) => setForm((p) => ({ ...p, transporterName: e.target.value }))} placeholder="Transporter Vendor" />
        </div>

        <div className="form-field">
          <label>Factory Pickup Date</label>
          <input type="date" value={form.pickupDate} onChange={(e) => setForm((p) => ({ ...p, pickupDate: e.target.value }))} />
        </div>

        <div className="form-field">
          <label>Port Gate-In Date</label>
          <input type="date" value={form.gateInDate} onChange={(e) => setForm((p) => ({ ...p, gateInDate: e.target.value }))} />
        </div>

        <div className="form-field">
          <label>Pickup Address / ICD</label>
          <input value={form.pickupLocation} onChange={(e) => setForm((p) => ({ ...p, pickupLocation: e.target.value }))} placeholder="Factory / ICD" />
        </div>

        <div className="form-field">
          <label>Delivery / Port Gate Location</label>
          <input value={form.deliveryLocation} onChange={(e) => setForm((p) => ({ ...p, deliveryLocation: e.target.value }))} placeholder="Port Gate" />
        </div>
      </div>

      <div className="form-field full-field" style={{ marginBottom: "20px" }}>
        <label>Trucking & Logistics Remarks</label>
        <textarea rows="3" value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Enter transport remarks..." />
      </div>

      <button className="btn btn-primary" onClick={() => { onSave(form); alert("Transport logistics saved & Gate-In status synced!"); }}>
        💾 Save Transport & Sync Container Gate-In
      </button>
    </div>
  );
}

/* ============================================================
   2. FULL CLEARING TAB (ALL CUSTOMS CLEARING FIELDS)
============================================================ */

function FullClearingTab({ job, clearing, onSave }) {
  const { today } = useERP();
  const [form, setForm] = useState({
    status: clearing?.status || "SB Filed",
    customsHouse: clearing?.customsHouse || "Nhava Sheva Customs (INNSA1)",
    shippingBillNo: clearing?.shippingBillNo || "SB-8891023",
    shippingBillDate: clearing?.shippingBillDate || "2026-09-15",
    assessmentNo: clearing?.assessmentNo || "ASS-55410",
    assessmentDate: clearing?.assessmentDate || "2026-09-15",
    examinationDate: clearing?.examinationDate || "2026-09-16",
    examinationResult: clearing?.examinationResult || "Cleared",
    queryNo: clearing?.queryNo || "",
    queryDate: clearing?.queryDate || "",
    queryResolvedDate: clearing?.queryResolvedDate || "",
    queryRemarks: clearing?.queryRemarks || "",
    leoNo: clearing?.leoNo || "LEO-99102",
    leoDate: clearing?.leoDate || "2026-09-16",
    drawbackAmount: clearing?.drawbackAmount || "12500",
    assignedTo: clearing?.assignedTo || "Rajesh CHA Agent",
    remarks: clearing?.remarks || "Shipping Bill filed, customs assessment passed and LEO order issued.",
    documents: clearing?.documents || [
      { id: "d1", name: "Commercial Invoice", status: "Verified", uploadedDate: "2026-09-14", remarks: "Inv #1092 Ok" },
      { id: "d2", name: "Packing List", status: "Verified", uploadedDate: "2026-09-14", remarks: "500 Cartons verified" },
      { id: "d3", name: "Authorization Letter (SDF)", status: "Received", uploadedDate: "2026-09-14", remarks: "Customs CHA Signed" },
      { id: "d4", name: "GST / IEC Documents", status: "Verified", uploadedDate: "2026-09-14", remarks: "IEC Verified" },
    ],
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3 style={{ margin: "0 0 15px 0" }}>🛃 Customs Clearing & Shipping Bill Filing (Full Customs Flow)</h3>

      {/* BASIC CLEARING INFO */}
      <div className="form-grid" style={{ marginBottom: "20px" }}>
        <div className="form-field">
          <label>Clearing Operational Status</label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            {CLEARING_WORKFLOW.map((step) => (
              <option key={step.id} value={step.name}>
                {step.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Customs House / Port Code</label>
          <input value={form.customsHouse} onChange={(e) => setForm((p) => ({ ...p, customsHouse: e.target.value }))} placeholder="Port / Customs House" />
        </div>

        <div className="form-field">
          <label>CHA Assigned Agent</label>
          <input value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} placeholder="Agent Name" />
        </div>

        <div className="form-field">
          <label>Duty Drawback Amount (₹)</label>
          <input value={form.drawbackAmount} onChange={(e) => setForm((p) => ({ ...p, drawbackAmount: e.target.value }))} placeholder="Drawback" />
        </div>
      </div>

      {/* CUSTOMS DOCUMENT CHECKLIST TABLE */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>📄 Customs Document Checklist</h4>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Status</th>
                <th>Uploaded Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {form.documents.map((doc, idx) => (
                <tr key={doc.id || idx}>
                  <td><strong>{doc.name}</strong></td>
                  <td>
                    <select
                      value={doc.status}
                      onChange={(e) => {
                        const updated = [...form.documents];
                        updated[idx].status = e.target.value;
                        setForm((p) => ({ ...p, documents: updated }));
                      }}
                    >
                      <option>Pending</option>
                      <option>Received</option>
                      <option>Verified</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={doc.uploadedDate || ""}
                      onChange={(e) => {
                        const updated = [...form.documents];
                        updated[idx].uploadedDate = e.target.value;
                        setForm((p) => ({ ...p, documents: updated }));
                      }}
                    />
                  </td>
                  <td>
                    <input
                      value={doc.remarks || ""}
                      onChange={(e) => {
                        const updated = [...form.documents];
                        updated[idx].remarks = e.target.value;
                        setForm((p) => ({ ...p, remarks: updated }));
                      }}
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHIPPING BILL & ASSESSMENT & LEO GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        {/* SHIPPING BILL */}
        <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>1. Shipping Bill (SB) Filing</h4>
          <div className="form-field">
            <label>Shipping Bill Number</label>
            <input value={form.shippingBillNo} onChange={(e) => setForm((p) => ({ ...p, shippingBillNo: e.target.value }))} placeholder="SB Number" />
          </div>
          <div className="form-field" style={{ marginTop: "10px" }}>
            <label>Shipping Bill Filing Date</label>
            <input type="date" value={form.shippingBillDate} onChange={(e) => setForm((p) => ({ ...p, shippingBillDate: e.target.value }))} />
          </div>
        </div>

        {/* ASSESSMENT */}
        <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>2. Customs Assessment & Examination</h4>
          <div className="form-field">
            <label>Assessment No.</label>
            <input value={form.assessmentNo} onChange={(e) => setForm((p) => ({ ...p, assessmentNo: e.target.value }))} placeholder="Assessment No" />
          </div>
          <div className="form-field" style={{ marginTop: "10px" }}>
            <label>Examination Result</label>
            <select value={form.examinationResult} onChange={(e) => setForm((p) => ({ ...p, examinationResult: e.target.value }))}>
              <option>Pending</option>
              <option>Cleared</option>
              <option>Query Raised</option>
              <option>Hold</option>
            </select>
          </div>
        </div>

        {/* LEO */}
        <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>3. LEO / Let Export Order</h4>
          <div className="form-field">
            <label>LEO Order Number</label>
            <input value={form.leoNo} onChange={(e) => setForm((p) => ({ ...p, leoNo: e.target.value }))} placeholder="LEO Number" />
          </div>
          <div className="form-field" style={{ marginTop: "10px" }}>
            <label>LEO Issue Date</label>
            <input type="date" value={form.leoDate} onChange={(e) => setForm((p) => ({ ...p, leoDate: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="form-field full-field" style={{ marginBottom: "20px" }}>
        <label>Clearing & Customs Remarks</label>
        <textarea rows="3" value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Enter clearing remarks..." />
      </div>

      <button className="btn btn-primary" onClick={() => { onSave(form); alert("Customs SB filing saved & automatically synced into B/L!"); }}>
        💾 Save Customs Filing & Sync into B/L
      </button>
    </div>
  );
}

/* ============================================================
   3. FULL FORWARDING & CHECKLIST TAB (ALL FIELDS & MASTER)
============================================================ */

function FullForwardingChecklistTab({ job, forwarding, checklist, onSave }) {
  const { store, today } = useERP();

  const [form, setForm] = useState(() => {
    return {
      bookingNo: checklist?.bookingNo || forwarding?.bookingNo || "BKG-MSC-902188",
      bookingDate: forwarding?.bookingDate || "2026-09-10",
      shippingLine: checklist?.shippingLine || forwarding?.shippingLine || "MSC Mediterranean Shipping Company",
      vessel: checklist?.vessel || forwarding?.vessel || "MSC OSCAR",
      voyage: checklist?.voyage || forwarding?.voyage || "2609W",
      etd: forwarding?.etd || "2026-09-22",
      eta: forwarding?.eta || "2026-10-15",
      portOfLoading: checklist?.portOfLoading || forwarding?.portOfLoading || job.pol || "Nhava Sheva (INNSA)",
      portOfDischarge: checklist?.portOfDischarge || forwarding?.portOfDischarge || job.pod || "Hamburg (DEHAM)",
      placeOfReceipt: checklist?.placeOfReceipt || "Ahmedabad ICD",
      placeOfDelivery: checklist?.placeOfDelivery || job.fpod || "Hamburg Port Terminal",
      finalDestination: checklist?.finalDestination || forwarding?.finalDestination || job.fpod || "Hamburg Port Terminal",
      siNo: checklist?.siNo || forwarding?.siNo || "SI-2026-09-001",
      siDate: checklist?.siDate || forwarding?.siDate || today(),
      shipper: checklist?.shipper || { name: job.customerName, address: "Plot 45, GIDC Estate", city: "Ahmedabad", country: "India", taxId: "24AAAAA0000A1ZB", iecCode: "0509012345" },
      consignee: checklist?.consignee || { name: "Euro Distribution GmBH", address: "Hafenstrasse 120", city: "Hamburg", country: "Germany", taxId: "DE998877665" },
      notifyParty: checklist?.notifyParty || { name: "Rotterdam Logistics BV", address: "Waalhaven 19", city: "Rotterdam", country: "Netherlands", taxId: "NL887766554" },
      cargoItems: checklist?.cargoItems || [
        { id: "item-1", commodity: job?.cargoDetails?.[0]?.commodity || "Cotton Manufactured Garments", hsCode: "61091000", packages: "500", packageType: "Cartons", grossWeight: "12500", netWeight: "11800", measurement: "45", marksAndNumbers: "APEX/HAM/1-500" }
      ],
      containers: checklist?.containers || [
        { id: "cont-1", containerNo: "MSCU7829104", containerType: "40' HC", sealNo: "MSC-998821", tareWeight: "3800", grossWeight: "16300", packages: "500", vgmNo: "VGM-881920" }
      ]
    };
  });

  const handleSimulatedUpload = (event) => {
    const file = event.target.files?.[0];
    setForm((prev) => ({
      ...prev,
      bookingNo: "BKG-MSC-902188",
      shippingLine: "MSC Mediterranean Shipping Company",
      vessel: "MSC OSCAR",
      voyage: "2609W",
      siNo: "SI-MSC-" + Math.floor(100000 + Math.random() * 900000),
      siDate: today(),
      shipper: { name: "Apex Global Traders Pvt Ltd", address: "Plot 45, GIDC Estate", city: "Ahmedabad", country: "India", taxId: "24AAAAA0000A1ZB", iecCode: "0509012345" },
      consignee: { name: "Euro Distribution GmBH", address: "Hafenstrasse 120", city: "Hamburg", country: "Germany", taxId: "DE998877665" },
      notifyParty: { name: "Rotterdam Logistics BV", address: "Waalhaven 19", city: "Rotterdam", country: "Netherlands", taxId: "NL887766554" },
    }));
    alert(`File "${file?.name || 'Checklist.pdf'}" parsed successfully! Export Checklist Master pre-filled.`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ margin: 0 }}>📦 Carrier Forwarding & Export Checklist Master</h3>
          <p className="muted" style={{ margin: "4px 0 0 0" }}>Manage carrier booking, vessel schedule, party master details, container seals & cargo HSN codes.</p>
        </div>
        <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
          ⚡ Upload / Parse Checklist File
          <input type="file" accept=".pdf,.doc,.xls,.xlsx,.csv" style={{ display: "none" }} onChange={handleSimulatedUpload} />
        </label>
      </div>

      {/* CARRIER BOOKING & SCHEDULE */}
      <div className="form-grid" style={{ marginBottom: "20px" }}>
        <div className="form-field">
          <label>Carrier Booking Number</label>
          <input value={form.bookingNo} onChange={(e) => setForm((p) => ({ ...p, bookingNo: e.target.value }))} placeholder="Booking No" />
        </div>
        <div className="form-field">
          <label>Shipping Line</label>
          <input value={form.shippingLine} onChange={(e) => setForm((p) => ({ ...p, shippingLine: e.target.value }))} placeholder="Shipping Line" />
        </div>
        <div className="form-field">
          <label>Vessel Name</label>
          <input value={form.vessel} onChange={(e) => setForm((p) => ({ ...p, vessel: e.target.value }))} placeholder="Vessel Name" />
        </div>
        <div className="form-field">
          <label>Voyage Number</label>
          <input value={form.voyage} onChange={(e) => setForm((p) => ({ ...p, voyage: e.target.value }))} placeholder="Voyage" />
        </div>
        <div className="form-field">
          <label>Port of Loading (POL)</label>
          <input value={form.portOfLoading} onChange={(e) => setForm((p) => ({ ...p, portOfLoading: e.target.value }))} />
        </div>
        <div className="form-field">
          <label>Port of Discharge (POD)</label>
          <input value={form.portOfDischarge} onChange={(e) => setForm((p) => ({ ...p, portOfDischarge: e.target.value }))} />
        </div>
      </div>

      {/* PARTIES (SHIPPER / CONSIGNEE / NOTIFY) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        {/* SHIPPER */}
        <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>Shipper (Exporter)</h4>
          <div className="form-field">
            <label>Name</label>
            <input value={form.shipper?.name || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, name: e.target.value } }))} />
          </div>
          <div className="form-field" style={{ marginTop: "8px" }}>
            <label>Address</label>
            <input value={form.shipper?.address || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, address: e.target.value } }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
            <div className="form-field">
              <label>GSTIN / Tax ID</label>
              <input value={form.shipper?.taxId || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, taxId: e.target.value } }))} />
            </div>
            <div className="form-field">
              <label>IEC Code</label>
              <input value={form.shipper?.iecCode || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, iecCode: e.target.value } }))} />
            </div>
          </div>
        </div>

        {/* CONSIGNEE */}
        <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>Consignee (Buyer)</h4>
          <div className="form-field">
            <label>Name</label>
            <input value={form.consignee?.name || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, name: e.target.value } }))} />
          </div>
          <div className="form-field" style={{ marginTop: "8px" }}>
            <label>Address</label>
            <input value={form.consignee?.address || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, address: e.target.value } }))} />
          </div>
          <div className="form-field" style={{ marginTop: "8px" }}>
            <label>Tax / EORI ID</label>
            <input value={form.consignee?.taxId || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, taxId: e.target.value } }))} />
          </div>
        </div>

        {/* NOTIFY PARTY */}
        <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>Notify Party</h4>
          <div className="form-field">
            <label>Name</label>
            <input value={form.notifyParty?.name || ""} onChange={(e) => setForm((p) => ({ ...p, notifyParty: { ...p.notifyParty, name: e.target.value } }))} />
          </div>
          <div className="form-field" style={{ marginTop: "8px" }}>
            <label>Address</label>
            <input value={form.notifyParty?.address || ""} onChange={(e) => setForm((p) => ({ ...p, notifyParty: { ...p.notifyParty, address: e.target.value } }))} />
          </div>
        </div>
      </div>

      {/* CONTAINER ALLOCATION TABLE */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>Container Allocations & Seals Table</h4>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Container No.</th>
                <th>Type</th>
                <th>Seal No.</th>
                <th>Tare Wt (KG)</th>
                <th>Gross Wt (KG)</th>
                <th>Packages</th>
                <th>VGM No</th>
              </tr>
            </thead>
            <tbody>
              {form.containers?.map((c, idx) => (
                <tr key={c.id || idx}>
                  <td><input value={c.containerNo || ""} onChange={(e) => { const u = [...form.containers]; u[idx].containerNo = e.target.value; setForm((p) => ({ ...p, containers: u })); }} placeholder="MSCU..." /></td>
                  <td>
                    <select value={c.containerType || "40' HC"} onChange={(e) => { const u = [...form.containers]; u[idx].containerType = e.target.value; setForm((p) => ({ ...p, containers: u })); }}>
                      <option>20' GP</option>
                      <option>40' GP</option>
                      <option>40' HC</option>
                      <option>Reefer</option>
                    </select>
                  </td>
                  <td><input value={c.sealNo || ""} onChange={(e) => { const u = [...form.containers]; u[idx].sealNo = e.target.value; setForm((p) => ({ ...p, containers: u })); }} placeholder="Seal" /></td>
                  <td><input type="number" value={c.tareWeight || ""} onChange={(e) => { const u = [...form.containers]; u[idx].tareWeight = e.target.value; setForm((p) => ({ ...p, containers: u })); }} style={{ width: "80px" }} /></td>
                  <td><input type="number" value={c.grossWeight || ""} onChange={(e) => { const u = [...form.containers]; u[idx].grossWeight = e.target.value; setForm((p) => ({ ...p, containers: u })); }} style={{ width: "80px" }} /></td>
                  <td><input type="number" value={c.packages || ""} onChange={(e) => { const u = [...form.containers]; u[idx].packages = e.target.value; setForm((p) => ({ ...p, containers: u })); }} style={{ width: "70px" }} /></td>
                  <td><input value={c.vgmNo || ""} onChange={(e) => { const u = [...form.containers]; u[idx].vgmNo = e.target.value; setForm((p) => ({ ...p, containers: u })); }} placeholder="VGM" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => { onSave(form); alert("Checklist Master saved & Bill of Lading auto-filled!"); }}>
        💾 Save Master Checklist & Auto-Fill B/L
      </button>
    </div>
  );
}

/* ============================================================
   4. FULL BILL OF LADING TAB (COMPLETE B/L GENERATOR & PREVIEW)
============================================================ */

function FullBLTab({ job, billOfLading, onSync, onOpenPreview, onNavigateBL }) {
  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ margin: 0 }}>📄 Bill of Lading (B/L) Generator & Auto-Sync</h3>
          <p className="muted" style={{ margin: "4px 0 0 0" }}>Auto-fills 100% of data from Transport, Clearing (SB No), and Forwarding Checklist Master.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-primary" onClick={() => { onSync(); alert("B/L data synchronized with Master!"); }}>
            🔄 1-Click Auto-Sync from Master
          </button>
          <button className="btn btn-secondary" onClick={onOpenPreview}>
            🖨️ Live Printable B/L Preview
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>B/L Status</label>
            <StatusBadge status={billOfLading?.status || "Draft Prepared"} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>B/L Number</label>
            <strong>{billOfLading?.blNo || "DRAFT-BL-2026"}</strong>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Shipping Bill (SB) No.</label>
            <strong>{billOfLading?.shippingBillNo || "SB-8891023"}</strong>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Carrier Booking No.</label>
            <strong>{billOfLading?.bookingNo || "BKG-MSC-902188"}</strong>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <strong style={{ fontSize: "0.85rem", color: "#475569", display: "block" }}>Shipper</strong>
            <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              <b>{billOfLading?.shipper?.name || job.customerName}</b>
              <br />
              {billOfLading?.shipper?.address || "GIDC Estate, Ahmedabad"}
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <strong style={{ fontSize: "0.85rem", color: "#475569", display: "block" }}>Consignee</strong>
            <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              <b>{billOfLading?.consignee?.name || "Euro Distribution GmBH"}</b>
              <br />
              {billOfLading?.consignee?.address || "Hamburg, Germany"}
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onNavigateBL}>
          Open Full Bill of Lading Editor Screen →
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   LIVE BL PRINTABLE PREVIEW MODAL
============================================================ */

function LiveBLPreviewModal({ bl, job, onClose }) {
  const cargo = bl?.cargo || [];
  return (
    <div className="clearing-overlay" style={{ zIndex: 1100 }}>
      <div className="clearing-modal" style={{ maxWidth: "900px", padding: "25px" }}>
        <div className="modal-header" style={{ marginBottom: "15px" }}>
          <h2>Printable Bill of Lading (B/L)</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print / Download PDF
            </button>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="bl-document" style={{ border: "2px solid #0f172a", padding: "20px", backgroundColor: "#fff" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", pb: "10px", marginBottom: "15px" }}>
            <h1 style={{ margin: 0, fontSize: "1.8rem" }}>BILL OF LADING</h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>{bl.blType || "Master BL"} | B/L No: {bl.blNo || "DRAFT"}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", borderBottom: "1px solid #cbd5e1", paddingBottom: "15px", marginBottom: "15px" }}>
            <div>
              <strong>SHIPPER:</strong>
              <div>{bl.shipper?.name || job.customerName}</div>
              <small>{bl.shipper?.address} {bl.shipper?.city}</small>
            </div>
            <div>
              <strong>CONSIGNEE:</strong>
              <div>{bl.consignee?.name || "Euro Distribution GmBH"}</div>
              <small>{bl.consignee?.address} {bl.consignee?.city}</small>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", borderBottom: "1px solid #cbd5e1", paddingBottom: "15px", marginBottom: "15px" }}>
            <div><small style={{ color: "#64748b" }}>BOOKING NO</small><div><b>{bl.bookingNo || "—"}</b></div></div>
            <div><small style={{ color: "#64748b" }}>SHIPPING LINE</small><div><b>{bl.shippingLine || "—"}</b></div></div>
            <div><small style={{ color: "#64748b" }}>VESSEL / VOYAGE</small><div><b>{bl.vessel} {bl.voyage}</b></div></div>
            <div><small style={{ color: "#64748b" }}>SB NO / DATE</small><div><b>{bl.shippingBillNo || "—"}</b></div></div>
          </div>

          <table className="bl-cargo-table" style={{ width: "100%", fontSize: "0.85rem", marginBottom: "15px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th>Container / Seal</th>
                <th>Packages</th>
                <th>Goods Description</th>
                <th>HSN Code</th>
                <th>Gross Weight</th>
              </tr>
            </thead>
            <tbody>
              {cargo.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.containerNo} / {item.sealNo}</td>
                  <td>{item.packages} {item.packageType}</td>
                  <td>{item.description}</td>
                  <td>{item.hsCode}</td>
                  <td>{item.grossWeight} KG</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}