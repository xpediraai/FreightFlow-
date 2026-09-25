import React, { useState } from "react";
import { Plus, Trash2, Upload, Eye, Download, FileText, X } from "lucide-react";
import { useERP } from "../../../../../contexts/ERPContext";
import Modal from "../components/common/Modal";
import "./Documents.css";

const TYPES = [
  "Commercial Invoice",
  "Packing List",
  "Shipping Bill",
  "Certificate of Origin",
  "Fumigation Certificate",
  "Inspection Certificate",
  "VGM",
  "Bill of Lading",
  "Delivery Proof",
  "Other",
];

export default function Documents() {
  const { store, add, remove } = useERP();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [search, setSearch] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
          type: file.type,
          data: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);

    add("documents", {
      jobNo: f.get("jobNo"),
      type: f.get("type"),
      documentNo: f.get("documentNo"),
      status: "Verified",
      fileName: selectedFile ? selectedFile.name : f.get("fileName") || "No file attached",
      fileData: selectedFile ? selectedFile.data : null,
      fileSize: selectedFile ? selectedFile.size : "",
      fileType: selectedFile ? selectedFile.type : "",
      uploadedDate: new Date().toISOString().split("T")[0],
    });

    setOpen(false);
    setSelectedFile(null);
  };

  const docs = (store.documents || []).filter((d) => {
    const text = `${d.jobNo || ""} ${d.type || ""} ${d.documentNo || ""} ${d.fileName || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="documents-page">
      <div className="toolbar">
        <div>
          <p className="muted">Central document repository & verification checklist for all jobs and shipments.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search document or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem" }}
          />
          <button className="btn primary" onClick={() => setOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={17} /> Add Document
          </button>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job No</th>
                <th>Document Type</th>
                <th>Document No.</th>
                <th>Uploaded File</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="strong">{d.jobNo || "—"}</td>
                  <td>{d.type}</td>
                  <td>{d.documentNo || "—"}</td>
                  <td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <FileText size={15} style={{ color: "#2563eb" }} />
                      <span>{d.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: d.status === "Verified" ? "#dcfce7" : "#f1f5f9",
                        color: d.status === "Verified" ? "#15803d" : "#475569",
                      }}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {d.fileData && (
                        <>
                          <button className="icon-btn" title="View Preview" onClick={() => setPreviewDoc(d)}>
                            <Eye size={15} />
                          </button>
                          <a className="icon-btn" title="Download File" href={d.fileData} download={d.fileName}>
                            <Download size={15} />
                          </a>
                        </>
                      )}
                      <button className="icon-btn danger-icon" title="Delete Document" onClick={() => remove("documents", d.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {docs.length === 0 && <div className="empty">No documents found.</div>}
        </div>
      </div>

      {/* ADD DOCUMENT MODAL */}
      <Modal open={open} title="Add & Upload Document" onClose={() => { setOpen(false); setSelectedFile(null); }}>
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Job No">
              <input name="jobNo" placeholder="EXP-2026-0001" required />
            </Field>
            <Field label="Document Type">
              <select name="type">
                {TYPES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Document No.">
              <input name="documentNo" placeholder="INV-99824" />
            </Field>
            <Field label="Upload File">
              <input type="file" onChange={handleFileChange} />
            </Field>
          </div>

          {selectedFile && (
            <div style={{ marginTop: "12px", padding: "10px", background: "#f8fafc", borderRadius: "6px", fontSize: "13px" }}>
              <strong>Selected File:</strong> {selectedFile.name} ({selectedFile.size})
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn" onClick={() => { setOpen(false); setSelectedFile(null); }}>
              Cancel
            </button>
            <button className="btn primary">Save & Upload Document</button>
          </div>
        </form>
      </Modal>

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="doc-preview-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="doc-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="doc-preview-header">
              <div>
                <h3 style={{ margin: 0 }}>{previewDoc.type}</h3>
                <span className="muted" style={{ fontSize: "12px" }}>
                  {previewDoc.fileName}
                </span>
              </div>
              <button className="icon-action-btn" onClick={() => setPreviewDoc(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="doc-preview-body">
              {previewDoc.fileData?.startsWith("data:image/") ? (
                <img src={previewDoc.fileData} alt={previewDoc.type} />
              ) : previewDoc.fileData?.startsWith("data:application/pdf") ? (
                <iframe src={previewDoc.fileData} title={previewDoc.type} />
              ) : (
                <div className="doc-preview-fallback">
                  <FileText size={48} />
                  <h4>Document Attached</h4>
                  <p className="muted">{previewDoc.fileName}</p>
                  <a className="btn btn-primary" href={previewDoc.fileData} download={previewDoc.fileName} style={{ marginTop: "12px" }}>
                    <Download size={16} /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}