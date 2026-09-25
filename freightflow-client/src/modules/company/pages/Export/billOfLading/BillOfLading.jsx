import React, { useMemo, useState } from "react";
import { useERP } from "../../../../../contexts/ERPContext";
import StatusBadge from "../components/common/StatusBadge";

import './BillOfLading.css'

const BL_STATUSES = [
    "Not Started",
    "Data Pending",
    "Draft Prepared",
    "Submitted to Carrier",
    "Draft Received",
    "Under Verification",
    "Amendment Required",
    "Approved",
    "Final BL Received",
    "Completed",
];

const BL_TYPES = ["Master BL", "House BL"];

const emptyCargo = () => ({
    id: crypto.randomUUID(),
    containerNo: "",
    sealNo: "",
    packages: "",
    packageType: "Cartons",
    description: "",
    hsCode: "",
    grossWeight: "",
    weightUnit: "KG",
    measurement: "",
    measurementUnit: "CBM",
});

const emptyParty = () => ({
    name: "",
    address: "",
    city: "",
    country: "",
});

const emptyBL = (jobId = "") => ({
    id: crypto.randomUUID(),
    jobId,

    status: "Not Started",
    blNo: "",
    blType: "Master BL",

    bookingNo: "",
    shippingLine: "",
    vessel: "",
    voyage: "",

    portOfLoading: "",
    portOfDischarge: "",
    placeOfReceipt: "",
    placeOfDelivery: "",
    finalDestination: "",

    shipper: emptyParty(),
    consignee: emptyParty(),
    notifyParty: emptyParty(),

    cargo: [emptyCargo()],

    siNo: "",
    siDate: "",
    submittedDate: "",
    draftReceivedDate: "",
    approvedDate: "",
    finalReceivedDate: "",

    amendmentRequired: false,
    amendmentRemarks: "",

    draftFile: null,
    finalFile: null,

    remarks: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

export default function BillOfLading() {
    const { store, patch, syncBLFromJobChecklist } = useERP();

    const jobs = store?.jobs || [];

    const [selectedBLId, setSelectedBLId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    /*
     * Supports both:
     * store.billOfLadings
     * and older projects where BL data is inside forwardingJobs.
     */
    const billOfLadings = store?.billOfLadings || [];

    const selectedBL = useMemo(
        () =>
            billOfLadings.find((item) => item.id === selectedBLId) || null,
        [billOfLadings, selectedBLId]
    );

    const filteredBLs = useMemo(() => {
        return billOfLadings.filter((bl) => {
            const job = jobs.find((j) => j.id === bl.jobId);

            const searchText = [
                bl.blNo,
                bl.bookingNo,
                bl.shippingLine,
                bl.vessel,
                job?.jobNo,
                bl.shipper?.name,
                bl.consignee?.name,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchText.includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "All" || bl.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [billOfLadings, jobs, search, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: billOfLadings.length,

            pending: billOfLadings.filter((x) =>
                ["Not Started", "Data Pending"].includes(x.status)
            ).length,

            draft: billOfLadings.filter((x) =>
                ["Draft Prepared", "Submitted to Carrier", "Draft Received"].includes(
                    x.status
                )
            ).length,

            verification: billOfLadings.filter((x) =>
                ["Under Verification", "Amendment Required"].includes(x.status)
            ).length,

            final: billOfLadings.filter((x) =>
                ["Final BL Received", "Completed"].includes(x.status)
            ).length,
        };
    }, [billOfLadings]);

    const getJob = (jobId) =>
        jobs.find((job) => job.id === jobId);

    const createBL = () => {
        const newBL = emptyBL();

        patch("billOfLadings", newBL.id, newBL);

        setSelectedBLId(newBL.id);
        setShowModal(true);
    };

    const createFromJob = (job) => {
        const createdOrSyncedBL = syncBLFromJobChecklist(job.id);
        if (createdOrSyncedBL) {
            setSelectedBLId(createdOrSyncedBL.id);
            setShowModal(true);
        }
    };

    const updateBL = (changes) => {
        if (!selectedBL) return;

        patch("billOfLadings", selectedBL.id, {
            ...changes,
            updatedAt: new Date().toISOString(),
        });
    };

    const updateParty = (party, changes) => {
        updateBL({
            [party]: {
                ...(selectedBL[party] || emptyParty()),
                ...changes,
            },
        });
    };

    const addCargo = () => {
        updateBL({
            cargo: [...(selectedBL.cargo || []), emptyCargo()],
        });
    };

    const updateCargo = (id, changes) => {
        updateBL({
            cargo: (selectedBL.cargo || []).map((item) =>
                item.id === id ? { ...item, ...changes } : item
            ),
        });
    };

    const removeCargo = (id) => {
        if ((selectedBL.cargo || []).length === 1) return;

        updateBL({
            cargo: selectedBL.cargo.filter((item) => item.id !== id),
        });
    };

    const calculateTotals = (bl) => {
        const cargo = bl?.cargo || [];

        const packages = cargo.reduce(
            (sum, item) => sum + Number(item.packages || 0),
            0
        );

        const weight = cargo.reduce(
            (sum, item) => sum + Number(item.grossWeight || 0),
            0
        );

        const measurement = cargo.reduce(
            (sum, item) => sum + Number(item.measurement || 0),
            0
        );

        return {
            packages,
            weight,
            measurement,
        };
    };

    const handleFile = (field, event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        /*
         * localStorage cannot directly store File objects.
         * We store file metadata for now.
         */
        updateBL({
            [field]: {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
            },
        });
    };

    const deleteBL = () => {
        if (!selectedBL) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this BL record?"
        );

        if (!confirmed) return;

        patch("billOfLadings", selectedBL.id, null);

        setSelectedBLId(null);
        setShowModal(false);
    };

    const printBL = () => {
        window.print();
    };

    return (
        <div className="operations-page bl-page">

            {/* HEADER */}

            <div className="page-header">
                <div>
                    <h1>Bill of Lading</h1>
                    <p className="muted">
                        Prepare BL data, manage carrier drafts, verify amendments and
                        record final BL receipt.
                    </p>
                </div>

                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={createBL}>
                        + Create BL
                    </button>
                </div>
            </div>

            {/* SUMMARY */}

            <div className="summary-grid">

                <SummaryCard
                    title="Total BL"
                    value={stats.total}
                />

                <SummaryCard
                    title="Pending"
                    value={stats.pending}
                />

                <SummaryCard
                    title="Draft / Carrier"
                    value={stats.draft}
                />

                <SummaryCard
                    title="Verification"
                    value={stats.verification}
                />

                <SummaryCard
                    title="Final BL"
                    value={stats.final}
                />

            </div>

            {/* TOOLBAR */}

            <div className="card bl-toolbar">

                <div className="bl-search">
                    <input
                        type="text"
                        placeholder="Search BL, booking, job, vessel, shipper..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>

                    {BL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

            </div>

            {/* TABLE */}

            <div className="card table-card">

                <div className="table-wrap">

                    <table>

                        <thead>
                            <tr>
                                <th>BL No.</th>
                                <th>Job</th>
                                <th>Type</th>
                                <th>Booking</th>
                                <th>Shipping Line</th>
                                <th>Vessel / Voyage</th>
                                <th>Shipper</th>
                                <th>Consignee</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredBLs.map((bl) => {

                                const job = getJob(bl.jobId);

                                return (
                                    <tr key={bl.id}>

                                        <td className="strong">
                                            {bl.blNo || "Draft BL"}
                                        </td>

                                        <td>
                                            {job?.jobNo || "—"}
                                        </td>

                                        <td>
                                            {bl.blType}
                                        </td>

                                        <td>
                                            {bl.bookingNo || "—"}
                                        </td>

                                        <td>
                                            {bl.shippingLine || "—"}
                                        </td>

                                        <td>
                                            {bl.vessel || "—"}

                                            {bl.voyage && (
                                                <span>
                                                    {" "}
                                                    / {bl.voyage}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {bl.shipper?.name || "—"}
                                        </td>

                                        <td>
                                            {bl.consignee?.name || "—"}
                                        </td>

                                        <td>
                                            <StatusBadge status={bl.status} />
                                        </td>

                                        <td>

                                            <button
                                                className="btn btn-sm"
                                                onClick={() => {
                                                    setSelectedBLId(bl.id);
                                                    setShowModal(true);
                                                }}
                                            >
                                                Open
                                            </button>

                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>

                    </table>

                    {filteredBLs.length === 0 && (
                        <div className="empty">
                            No Bill of Lading records found.
                        </div>
                    )}

                </div>

            </div>

            {/* CREATE FROM JOB */}

            {showModal && selectedBL && (
                <BLModal
                    bl={selectedBL}
                    jobs={jobs}
                    onClose={() => setShowModal(false)}
                    onUpdate={updateBL}
                    onUpdateParty={updateParty}
                    onAddCargo={addCargo}
                    onUpdateCargo={updateCargo}
                    onRemoveCargo={removeCargo}
                    onFile={handleFile}
                    onPreview={() => setShowPreview(true)}
                    onPrint={printBL}
                    onDelete={deleteBL}
                    calculateTotals={calculateTotals}
                />
            )}

            {/* PRINT / PREVIEW */}

            {showPreview && selectedBL && (
                <BLPreview
                    bl={selectedBL}
                    job={getJob(selectedBL.jobId)}
                    onClose={() => setShowPreview(false)}
                    onPrint={printBL}
                />
            )}

        </div>
    );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({ title, value }) {
    return (
        <div className="summary-card">
            <div className="summary-card-title">
                {title}
            </div>

            <div className="summary-card-value">
                {value}
            </div>
        </div>
    );
}

/* ============================================================
   BL MODAL
============================================================ */

function BLModal({
    bl,
    jobs,
    onClose,
    onUpdate,
    onUpdateParty,
    onAddCargo,
    onUpdateCargo,
    onRemoveCargo,
    onFile,
    onPreview,
    onPrint,
    onDelete,
    calculateTotals,
}) {
    const totals = calculateTotals(bl);

    const job = jobs.find((x) => x.id === bl.jobId);

    return (
        <div className="clearing-overlay">

            <div className="clearing-modal bl-modal">

                <div className="modal-header">

                    <div>
                        <h2>
                            {bl.blNo || "New Bill of Lading"}
                        </h2>

                        <p className="muted">
                            {job?.jobNo || "No Job Linked"}
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {bl.jobId && (
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ backgroundColor: "#2563eb", color: "#fff", borderColor: "#2563eb" }}
                                onClick={() => {
                                    syncBLFromJobChecklist(bl.jobId);
                                    alert("BL data refreshed and auto-filled from Master Checklist & Forwarding!");
                                }}
                            >
                                🔄 Auto-Fill from Checklist Master
                            </button>
                        )}
                        <button
                            className="modal-close"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                </div>

                {/* STATUS */}

                <div className="bl-status-panel">

                    <div>
                        <label>BL Status</label>

                        <select
                            value={bl.status}
                            onChange={(e) =>
                                onUpdate({
                                    status: e.target.value,
                                })
                            }
                        >

                            {BL_STATUSES.map((status) => (
                                <option key={status}>
                                    {status}
                                </option>
                            ))}

                        </select>
                    </div>

                    <div>
                        <label>BL Type</label>

                        <select
                            value={bl.blType}
                            onChange={(e) =>
                                onUpdate({
                                    blType: e.target.value,
                                })
                            }
                        >

                            {BL_TYPES.map((type) => (
                                <option key={type}>
                                    {type}
                                </option>
                            ))}

                        </select>
                    </div>

                    <div>
                        <label>BL Number</label>

                        <input
                            value={bl.blNo}
                            placeholder="Carrier BL Number"
                            onChange={(e) =>
                                onUpdate({
                                    blNo: e.target.value,
                                })
                            }
                        />
                    </div>

                </div>

                {/* BASIC INFORMATION */}

                <Section title="Shipment & Carrier Information">

                    <div className="form-grid">

                        <Field
                            label="Booking Number"
                            value={bl.bookingNo}
                            onChange={(value) =>
                                onUpdate({ bookingNo: value })
                            }
                        />

                        <Field
                            label="Shipping Line"
                            value={bl.shippingLine}
                            onChange={(value) =>
                                onUpdate({ shippingLine: value })
                            }
                        />

                        <Field
                            label="Vessel"
                            value={bl.vessel}
                            onChange={(value) =>
                                onUpdate({ vessel: value })
                            }
                        />

                        <Field
                            label="Voyage"
                            value={bl.voyage}
                            onChange={(value) =>
                                onUpdate({ voyage: value })
                            }
                        />

                        <Field
                            label="Port of Loading"
                            value={bl.portOfLoading}
                            onChange={(value) =>
                                onUpdate({ portOfLoading: value })
                            }
                        />

                        <Field
                            label="Port of Discharge"
                            value={bl.portOfDischarge}
                            onChange={(value) =>
                                onUpdate({ portOfDischarge: value })
                            }
                        />

                        <Field
                            label="Place of Receipt"
                            value={bl.placeOfReceipt}
                            onChange={(value) =>
                                onUpdate({ placeOfReceipt: value })
                            }
                        />

                        <Field
                            label="Place of Delivery"
                            value={bl.placeOfDelivery}
                            onChange={(value) =>
                                onUpdate({ placeOfDelivery: value })
                            }
                        />

                        <Field
                            label="Final Destination"
                            value={bl.finalDestination}
                            onChange={(value) =>
                                onUpdate({ finalDestination: value })
                            }
                        />

                    </div>

                </Section>

                {/* PARTIES */}

                <PartySection
                    title="Shipper"
                    party={bl.shipper}
                    onChange={(changes) =>
                        onUpdateParty("shipper", changes)
                    }
                />

                <PartySection
                    title="Consignee"
                    party={bl.consignee}
                    onChange={(changes) =>
                        onUpdateParty("consignee", changes)
                    }
                />

                <PartySection
                    title="Notify Party"
                    party={bl.notifyParty}
                    onChange={(changes) =>
                        onUpdateParty("notifyParty", changes)
                    }
                />

                {/* CARGO */}

                <Section
                    title="Cargo Details"
                    action={
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={onAddCargo}
                        >
                            + Add Cargo
                        </button>
                    }
                >

                    <div className="cargo-list">

                        {(bl.cargo || []).map((cargo, index) => (

                            <div
                                className="cargo-item"
                                key={cargo.id}
                            >

                                <div className="cargo-item-header">

                                    <strong>
                                        Cargo #{index + 1}
                                    </strong>

                                    {bl.cargo.length > 1 && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                                onRemoveCargo(cargo.id)
                                            }
                                        >
                                            Remove
                                        </button>
                                    )}

                                </div>

                                <div className="form-grid">

                                    <Field
                                        label="Container No."
                                        value={cargo.containerNo}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                containerNo: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Seal No."
                                        value={cargo.sealNo}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                sealNo: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Packages"
                                        type="number"
                                        value={cargo.packages}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                packages: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Package Type"
                                        value={cargo.packageType}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                packageType: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="HS Code"
                                        value={cargo.hsCode}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                hsCode: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Gross Weight"
                                        type="number"
                                        value={cargo.grossWeight}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                grossWeight: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Weight Unit"
                                        value={cargo.weightUnit}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                weightUnit: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Measurement"
                                        type="number"
                                        value={cargo.measurement}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                measurement: value,
                                            })
                                        }
                                    />

                                    <Field
                                        label="Measurement Unit"
                                        value={cargo.measurementUnit}
                                        onChange={(value) =>
                                            onUpdateCargo(cargo.id, {
                                                measurementUnit: value,
                                            })
                                        }
                                    />

                                </div>

                                <div className="form-field full-field">

                                    <label>
                                        Cargo Description
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={cargo.description}
                                        onChange={(e) =>
                                            onUpdateCargo(cargo.id, {
                                                description: e.target.value,
                                            })
                                        }
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                    <div className="cargo-total-box">

                        <div>
                            <span>Total Packages</span>
                            <strong>{totals.packages}</strong>
                        </div>

                        <div>
                            <span>Total Gross Weight</span>
                            <strong>{totals.weight} KG</strong>
                        </div>

                        <div>
                            <span>Total Measurement</span>
                            <strong>{totals.measurement} CBM</strong>
                        </div>

                    </div>

                </Section>

                {/* SI */}

                <Section title="Shipping Instruction">

                    <div className="form-grid">

                        <Field
                            label="SI Number"
                            value={bl.siNo}
                            onChange={(value) =>
                                onUpdate({ siNo: value })
                            }
                        />

                        <Field
                            label="SI Date"
                            type="date"
                            value={bl.siDate}
                            onChange={(value) =>
                                onUpdate({ siDate: value })
                            }
                        />

                        <Field
                            label="Submitted to Carrier"
                            type="date"
                            value={bl.submittedDate}
                            onChange={(value) =>
                                onUpdate({ submittedDate: value })
                            }
                        />

                    </div>

                </Section>

                {/* CARRIER WORKFLOW */}

                <Section title="Carrier BL Workflow">

                    <div className="form-grid">

                        <Field
                            label="Draft Received Date"
                            type="date"
                            value={bl.draftReceivedDate}
                            onChange={(value) =>
                                onUpdate({
                                    draftReceivedDate: value,
                                })
                            }
                        />

                        <Field
                            label="Approved Date"
                            type="date"
                            value={bl.approvedDate}
                            onChange={(value) =>
                                onUpdate({
                                    approvedDate: value,
                                })
                            }
                        />

                        <Field
                            label="Final BL Received Date"
                            type="date"
                            value={bl.finalReceivedDate}
                            onChange={(value) =>
                                onUpdate({
                                    finalReceivedDate: value,
                                })
                            }
                        />

                    </div>

                    <label className="checkbox-field">

                        <input
                            type="checkbox"
                            checked={Boolean(bl.amendmentRequired)}
                            onChange={(e) =>
                                onUpdate({
                                    amendmentRequired: e.target.checked,
                                    status: e.target.checked
                                        ? "Amendment Required"
                                        : bl.status,
                                })
                            }
                        />

                        Amendment Required

                    </label>

                    {bl.amendmentRequired && (

                        <div className="form-field">

                            <label>
                                Amendment Remarks
                            </label>

                            <textarea
                                rows="3"
                                value={bl.amendmentRemarks || ""}
                                onChange={(e) =>
                                    onUpdate({
                                        amendmentRemarks: e.target.value,
                                    })
                                }
                            />

                        </div>

                    )}

                </Section>

                {/* FILES */}

                <Section title="BL Documents">

                    <div className="document-upload-grid">

                        <div className="upload-box">

                            <strong>
                                Carrier Draft BL
                            </strong>

                            {bl.draftFile && (
                                <p>
                                    {bl.draftFile.name}
                                </p>
                            )}

                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    onFile("draftFile", e)
                                }
                            />

                        </div>

                        <div className="upload-box">

                            <strong>
                                Final BL
                            </strong>

                            {bl.finalFile && (
                                <p>
                                    {bl.finalFile.name}
                                </p>
                            )}

                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    onFile("finalFile", e)
                                }
                            />

                        </div>

                    </div>

                    <p className="muted small-text">
                        Files are currently stored as metadata because browser
                        localStorage cannot directly persist File objects. Use backend
                        storage when the document module is connected to the server.
                    </p>

                </Section>

                {/* REMARKS */}

                <Section title="Remarks">

                    <textarea
                        rows="4"
                        value={bl.remarks || ""}
                        onChange={(e) =>
                            onUpdate({
                                remarks: e.target.value,
                            })
                        }
                        placeholder="Internal BL remarks..."
                    />

                </Section>

                {/* FOOTER */}

                <div className="modal-footer">

                    <button
                        className="btn btn-danger"
                        onClick={onDelete}
                    >
                        Delete
                    </button>

                    <div className="modal-footer-right">

                        <button
                            className="btn"
                            onClick={onClose}
                        >
                            Close
                        </button>

                        <button
                            className="btn"
                            onClick={onPreview}
                        >
                            Preview BL
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={onPrint}
                        >
                            Print / Save PDF
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

/* ============================================================
   PARTY
============================================================ */

function PartySection({
    title,
    party,
    onChange,
}) {
    const data = party || emptyParty();

    return (
        <Section title={title}>

            <div className="form-grid">

                <Field
                    label="Name"
                    value={data.name}
                    onChange={(value) =>
                        onChange({ name: value })
                    }
                />

                <Field
                    label="City"
                    value={data.city}
                    onChange={(value) =>
                        onChange({ city: value })
                    }
                />

                <Field
                    label="Country"
                    value={data.country}
                    onChange={(value) =>
                        onChange({ country: value })
                    }
                />

            </div>

            <div className="form-field">

                <label>
                    Address
                </label>

                <textarea
                    rows="2"
                    value={data.address || ""}
                    onChange={(e) =>
                        onChange({
                            address: e.target.value,
                        })
                    }
                />

            </div>

        </Section>
    );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
    label,
    value,
    onChange,
    type = "text",
}) {
    return (
        <div className="form-field">

            <label>
                {label}
            </label>

            <input
                type={type}
                value={value ?? ""}
                onChange={(e) =>
                    onChange(e.target.value)
                }
            />

        </div>
    );
}

/* ============================================================
   SECTION
============================================================ */

function Section({
    title,
    children,
    action,
}) {
    return (
        <div className="detail-section">

            <div className="section-title-row">

                <h3 className="section-title">
                    {title}
                </h3>

                {action}

            </div>

            {children}

        </div>
    );
}

/* ============================================================
   BL PREVIEW
============================================================ */

function BLPreview({
    bl,
    job,
    onClose,
    onPrint,
}) {
    const cargo = bl.cargo || [];

    const totals = cargo.reduce(
        (acc, item) => {
            acc.packages += Number(item.packages || 0);
            acc.weight += Number(item.grossWeight || 0);
            acc.measurement += Number(item.measurement || 0);

            return acc;
        },
        {
            packages: 0,
            weight: 0,
            measurement: 0,
        }
    );

    return (
        <div className="bl-preview-overlay">

            <div className="bl-preview-modal">

                <div className="preview-toolbar">

                    <button
                        className="btn"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={onPrint}
                    >
                        Print / Save as PDF
                    </button>

                </div>

                <div className="bl-document">

                    <div className="draft-watermark">
                        DRAFT — NOT AN OFFICIAL BILL OF LADING
                    </div>

                    <div className="bl-document-header">

                        <div>
                            <h1>
                                BILL OF LADING
                            </h1>

                            <p>
                                {bl.blType}
                            </p>
                        </div>

                        <div className="bl-number">

                            <span>
                                B/L No.
                            </span>

                            <strong>
                                {bl.blNo || "DRAFT"}
                            </strong>

                        </div>

                    </div>

                    <div className="bl-route-grid">

                        <InfoBox
                            title="Port of Loading"
                            value={bl.portOfLoading}
                        />

                        <InfoBox
                            title="Port of Discharge"
                            value={bl.portOfDischarge}
                        />

                        <InfoBox
                            title="Place of Delivery"
                            value={bl.placeOfDelivery}
                        />

                        <InfoBox
                            title="Final Destination"
                            value={bl.finalDestination}
                        />

                    </div>

                    <div className="bl-party-grid">

                        <InfoBox
                            title="SHIPPER"
                            value={formatParty(bl.shipper)}
                        />

                        <InfoBox
                            title="CONSIGNEE"
                            value={formatParty(bl.consignee)}
                        />

                        <InfoBox
                            title="NOTIFY PARTY"
                            value={formatParty(bl.notifyParty)}
                        />

                    </div>

                    <div className="bl-vessel-grid">

                        <InfoBox
                            title="BOOKING"
                            value={bl.bookingNo}
                        />

                        <InfoBox
                            title="SHIPPING LINE"
                            value={bl.shippingLine}
                        />

                        <InfoBox
                            title="VESSEL"
                            value={bl.vessel}
                        />

                        <InfoBox
                            title="VOYAGE"
                            value={bl.voyage}
                        />

                    </div>

                    <table className="bl-cargo-table">

                        <thead>

                            <tr>
                                <th>Container / Seal</th>
                                <th>Packages</th>
                                <th>Description</th>
                                <th>HS Code</th>
                                <th>Gross Weight</th>
                                <th>Measurement</th>
                            </tr>

                        </thead>

                        <tbody>

                            {cargo.map((item) => (

                                <tr key={item.id}>

                                    <td>
                                        {item.containerNo || "—"}

                                        <br />

                                        <small>
                                            Seal: {item.sealNo || "—"}
                                        </small>
                                    </td>

                                    <td>
                                        {item.packages || "—"}
                                        <br />
                                        <small>
                                            {item.packageType}
                                        </small>
                                    </td>

                                    <td>
                                        {item.description || "—"}
                                    </td>

                                    <td>
                                        {item.hsCode || "—"}
                                    </td>

                                    <td>
                                        {item.grossWeight || "—"}{" "}
                                        {item.weightUnit}
                                    </td>

                                    <td>
                                        {item.measurement || "—"}{" "}
                                        {item.measurementUnit}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                        <tfoot>

                            <tr>

                                <td>
                                    <strong>TOTAL</strong>
                                </td>

                                <td>
                                    <strong>
                                        {totals.packages}
                                    </strong>
                                </td>

                                <td />

                                <td />

                                <td>
                                    <strong>
                                        {totals.weight} KG
                                    </strong>
                                </td>

                                <td>
                                    <strong>
                                        {totals.measurement} CBM
                                    </strong>
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                    <div className="bl-document-footer">

                        <div>
                            <strong>
                                Shipping Bill No.
                            </strong>

                            <p>
                                {bl.shippingBillNo || "—"}
                            </p>
                        </div>

                        <div>
                            <strong>
                                SB Date
                            </strong>

                            <p>
                                {bl.shippingBillDate || "—"}
                            </p>
                        </div>

                        <div>
                            <strong>
                                SI No.
                            </strong>

                            <p>
                                {bl.siNo || "—"}
                            </p>
                        </div>

                        <div>
                            <strong>
                                Job No.
                            </strong>

                            <p>
                                {job?.jobNo || "—"}
                            </p>
                        </div>

                    </div>

                    <div className="bl-remarks">

                        <strong>
                            Remarks
                        </strong>

                        <p>
                            {bl.remarks || "—"}
                        </p>

                    </div>

                    <div className="bl-disclaimer">

                        This document is an internal draft prepared from shipment
                        information. It is not an official Bill of Lading and does not
                        replace the Bill of Lading issued by the carrier / shipping line.

                    </div>

                </div>

            </div>

        </div>
    );
}

function InfoBox({
    title,
    value,
}) {
    return (
        <div className="info-box">

            <strong>
                {title}
            </strong>

            <div>
                {value || "—"}
            </div>

        </div>
    );
}

function formatParty(party) {
    if (!party) return "—";

    return [
        party.name,
        party.address,
        party.city,
        party.country,
    ]
        .filter(Boolean)
        .join("\n");
}