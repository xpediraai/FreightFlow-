import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useERP } from "../../../../../contexts/ERPContext";
import StatusBadge from "../components/common/StatusBadge";

import './Forwarding.css';


const WORKFLOW_STAGES = [
    "Booking Pending",
    "Booking Requested",
    "Booking Confirmed",
    "Container Allocated",
    "SI Submitted",
    "VGM Submitted",
    "Gate-In Completed",
    "Vessel Departed",
    "BL Draft",
    "BL Released",
    "Completed",
];

const TASK_STATUS = [
    "Pending",
    "In Progress",
    "Completed",
    "Not Required",
];

const CONTAINER_STATUSES = [
    "Pending",
    "Allocated",
    "Released",
    "Stuffed",
    "Gate-In",
    "Loaded",
];

const BL_STATUSES = [
    "Pending",
    "Draft",
    "Submitted",
    "Released",
    "Amended",
];

const EMPTY_WORKFLOW = [
    {
        id: "bookingRequest",
        name: "Booking Request",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "bookingConfirmation",
        name: "Booking Confirmation",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "containerAllocation",
        name: "Container Allocation",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "siSubmission",
        name: "Shipping Instruction",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "vgmSubmission",
        name: "VGM Submission",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "gateIn",
        name: "Container Gate-In",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "vesselDeparture",
        name: "Vessel Departure",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "blDraft",
        name: "BL Draft",
        status: "Pending",
        date: "",
        remarks: "",
    },
    {
        id: "blRelease",
        name: "BL Release",
        status: "Pending",
        date: "",
        remarks: "",
    },
];

function createDefaultWorkflow() {
    return EMPTY_WORKFLOW.map((task) => ({
        ...task,
    }));
}

function createDefaultContainers() {
    return [
        {
            id: "container-1",
            containerNo: "",
            containerType: "20' GP",
            sealNo: "",
            status: "Pending",
            gateInDate: "",
            remarks: "",
        },
    ];
}

function normalizeRecord(record) {
    return {
        ...record,

        bookingNo: record.bookingNo || "",
        bookingDate: record.bookingDate || "",
        bookingRequestDate: record.bookingRequestDate || "",
        bookingConfirmationDate:
            record.bookingConfirmationDate || "",

        shippingLine: record.shippingLine || "",

        vessel: record.vessel || "",
        voyage: record.voyage || "",

        etd: record.etd || "",
        eta: record.eta || "",

        siNo: record.siNo || "",
        siDate: record.siDate || "",
        siSubmittedDate: record.siSubmittedDate || "",

        vgmNo: record.vgmNo || "",
        vgmDate: record.vgmDate || "",
        vgmWeight: record.vgmWeight || "",
        vgmUnit: record.vgmUnit || "KG",

        gateInDate: record.gateInDate || "",

        blNo: record.blNo || "",
        blDate: record.blDate || "",
        blStatus: record.blStatus || "Pending",

        portOfLoading: record.portOfLoading || "",
        portOfDischarge: record.portOfDischarge || "",
        finalDestination: record.finalDestination || "",

        assignedTo: record.assignedTo || "",
        priority: record.priority || "Medium",

        remarks: record.remarks || "",

        workflow:
            Array.isArray(record.workflow) &&
                record.workflow.length
                ? record.workflow
                : createDefaultWorkflow(),

        containers:
            Array.isArray(record.containers) &&
                record.containers.length
                ? record.containers
                : createDefaultContainers(),
    };
}

/**
 * Automatically calculates overall forwarding status.
 */
function calculateOverallStatus(record) {
    const workflow = record.workflow || [];

    if (!workflow.length) {
        return record.status || "Booking Pending";
    }

    const getTask = (id) =>
        workflow.find((task) => task.id === id);

    const bookingRequest = getTask("bookingRequest");
    const bookingConfirmation = getTask(
        "bookingConfirmation"
    );
    const containerAllocation = getTask(
        "containerAllocation"
    );
    const siSubmission = getTask("siSubmission");
    const vgmSubmission = getTask("vgmSubmission");
    const gateIn = getTask("gateIn");
    const vesselDeparture = getTask(
        "vesselDeparture"
    );
    const blDraft = getTask("blDraft");
    const blRelease = getTask("blRelease");

    if (blRelease?.status === "Completed") {
        return "Completed";
    }

    if (
        blRelease?.status === "In Progress" ||
        blRelease?.status === "Completed"
    ) {
        return "BL Released";
    }

    if (
        blDraft?.status === "In Progress" ||
        blDraft?.status === "Completed"
    ) {
        return "BL Draft";
    }

    if (
        vesselDeparture?.status === "In Progress" ||
        vesselDeparture?.status === "Completed"
    ) {
        return "Vessel Departed";
    }

    if (
        gateIn?.status === "In Progress" ||
        gateIn?.status === "Completed"
    ) {
        return "Gate-In Completed";
    }

    if (
        vgmSubmission?.status === "In Progress" ||
        vgmSubmission?.status === "Completed"
    ) {
        return "VGM Submitted";
    }

    if (
        siSubmission?.status === "In Progress" ||
        siSubmission?.status === "Completed"
    ) {
        return "SI Submitted";
    }

    if (
        containerAllocation?.status === "In Progress" ||
        containerAllocation?.status === "Completed"
    ) {
        return "Container Allocated";
    }

    if (
        bookingConfirmation?.status === "In Progress" ||
        bookingConfirmation?.status === "Completed"
    ) {
        return "Booking Confirmed";
    }

    if (
        bookingRequest?.status === "In Progress" ||
        bookingRequest?.status === "Completed"
    ) {
        return "Booking Requested";
    }

    return "Booking Pending";
}

function getProgress(record) {
    const workflow = record.workflow || [];

    if (!workflow.length) {
        return 0;
    }

    const applicableTasks = workflow.filter(
        (task) => task.status !== "Not Required"
    );

    if (!applicableTasks.length) {
        return 0;
    }

    const completedTasks = applicableTasks.filter(
        (task) => task.status === "Completed"
    ).length;

    return Math.round(
        (completedTasks / applicableTasks.length) * 100
    );
}

export default function Forwarding() {
    const { store, patch } = useERP();

    const records = Array.isArray(store?.forwardingJobs)
        ? store.forwardingJobs
        : [];

    const jobs = Array.isArray(store?.jobs)
        ? store.jobs
        : [];

    const [selectedId, setSelectedId] = useState(null);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const normalizedRecords = useMemo(
        () => records.map(normalizeRecord),
        [records]
    );

    const filteredRecords = useMemo(() => {
        return normalizedRecords.filter((record) => {
            const job = jobs.find(
                (item) => item.id === record.jobId
            );

            const searchText = `
        ${job?.jobNo || ""}
        ${job?.customerName || ""}
        ${record.bookingNo || ""}
        ${record.shippingLine || ""}
        ${record.vessel || ""}
        ${record.blNo || ""}
        ${record.assignedTo || ""}
      `.toLowerCase();

            const matchesSearch = searchText.includes(
                search.toLowerCase()
            );

            const currentStatus =
                calculateOverallStatus(record);

            const matchesStatus =
                statusFilter === "All" ||
                currentStatus === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        normalizedRecords,
        jobs,
        search,
        statusFilter,
    ]);

    const selectedRecord = normalizedRecords.find(
        (record) => record.id === selectedId
    );

    const updateRecord = (id, changes) => {
        const existing = normalizedRecords.find(
            (record) => record.id === id
        );

        if (!existing) return;

        const updated = normalizeRecord({
            ...existing,
            ...changes,
        });

        const automaticStatus =
            calculateOverallStatus(updated);

        patch("forwardingJobs", id, {
            ...changes,
            status: automaticStatus,
        });
    };

    const updateWorkflowTask = (
        record,
        taskId,
        changes
    ) => {
        const workflow = record.workflow.map(
            (task) =>
                task.id === taskId
                    ? {
                        ...task,
                        ...changes,
                    }
                    : task
        );

        const updatedRecord = {
            ...record,
            workflow,
        };

        const status =
            calculateOverallStatus(updatedRecord);

        patch("forwardingJobs", record.id, {
            workflow,
            status,
        });
    };

    const updateContainer = (
        record,
        containerId,
        changes
    ) => {
        const containers = record.containers.map(
            (container) =>
                container.id === containerId
                    ? {
                        ...container,
                        ...changes,
                    }
                    : container
        );

        patch("forwardingJobs", record.id, {
            containers,
        });
    };

    const addContainer = (record) => {
        const containers = [
            ...record.containers,
            {
                id: `container-${Date.now()}`,
                containerNo: "",
                containerType: "20' GP",
                sealNo: "",
                status: "Pending",
                gateInDate: "",
                remarks: "",
            },
        ];

        patch("forwardingJobs", record.id, {
            containers,
        });
    };

    const removeContainer = (
        record,
        containerId
    ) => {
        const containers = record.containers.filter(
            (container) =>
                container.id !== containerId
        );

        patch("forwardingJobs", record.id, {
            containers,
        });
    };

    return (
        <div className="operations-page">

            {/* HEADER */}

            <div className="page-header">
                <div>
                    <h2>Forwarding Operations</h2>

                    <p className="muted">
                        Manage carrier booking, containers,
                        shipping instructions, VGM, vessel
                        schedules and bill of lading.
                    </p>
                </div>
            </div>

            {/* SUMMARY */}

            <ForwardingSummary
                records={normalizedRecords}
            />

            {/* FILTERS */}

            <div className="card clearing-toolbar">

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search Job, Booking, Vessel, BL..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="All">
                        All Statuses
                    </option>

                    {WORKFLOW_STAGES.map(
                        (status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        )
                    )}
                </select>
            </div>

            {/* TABLE */}

            <div className="card table-card">
                <div className="table-wrap">

                    <table>

                        <thead>
                            <tr>
                                <th>Job</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Booking</th>
                                <th>Shipping Line</th>
                                <th>Vessel / Voyage</th>
                                <th>ETD</th>
                                <th>ETA</th>
                                <th>BL</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredRecords.map(
                                (record) => {
                                    const job = jobs.find(
                                        (item) =>
                                            item.id ===
                                            record.jobId
                                    );

                                    const status =
                                        calculateOverallStatus(
                                            record
                                        );

                                    const progress =
                                        getProgress(record);

                                    return (
                                        <tr key={record.id}>

                                            <td>
                                                <strong>
                                                    {job?.jobNo ||
                                                        "—"}
                                                </strong>
                                            </td>

                                            <td>
                                                {job?.customerName ||
                                                    job?.customer ||
                                                    "—"}
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={
                                                        status
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <div className="progress-cell">

                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${progress}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span>
                                                        {progress}%
                                                    </span>

                                                </div>
                                            </td>

                                            <td>
                                                {record.bookingNo ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {record.shippingLine ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {record.vessel ||
                                                    "—"}

                                                {record.voyage
                                                    ? ` / ${record.voyage}`
                                                    : ""}
                                            </td>

                                            <td>
                                                {record.etd ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {record.eta ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {record.blNo ||
                                                    "—"}
                                            </td>

                                            <td>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        setSelectedId(
                                                            record.id
                                                        )
                                                    }
                                                >
                                                    Manage
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                    {filteredRecords.length === 0 && (
                        <div className="empty">
                            No forwarding jobs found.
                        </div>
                    )}

                </div>
            </div>

            {/* DETAIL PANEL */}

            {selectedRecord && (
                <ForwardingDetail
                    record={selectedRecord}
                    job={jobs.find(
                        (item) =>
                            item.id ===
                            selectedRecord.jobId
                    )}
                    onClose={() =>
                        setSelectedId(null)
                    }
                    onUpdate={updateRecord}
                    onUpdateTask={
                        updateWorkflowTask
                    }
                    onUpdateContainer={
                        updateContainer
                    }
                    onAddContainer={
                        addContainer
                    }
                    onRemoveContainer={
                        removeContainer
                    }
                />
            )}

        </div>
    );
}

/* ============================================================
   SUMMARY
============================================================ */

function ForwardingSummary({
    records,
}) {
    const countStatus = (status) =>
        records.filter(
            (record) =>
                calculateOverallStatus(
                    record
                ) === status
        ).length;

    const total = records.length;

    const completed =
        countStatus("Completed");

    const bookingPending =
        countStatus(
            "Booking Pending"
        );

    const bookingConfirmed =
        countStatus(
            "Booking Confirmed"
        );

    const vesselDeparted =
        countStatus(
            "Vessel Departed"
        );

    return (
        <div className="summary-grid">

            <SummaryCard
                title="Total Jobs"
                value={total}
            />

            <SummaryCard
                title="Booking Pending"
                value={bookingPending}
            />

            <SummaryCard
                title="Booking Confirmed"
                value={bookingConfirmed}
            />

            <SummaryCard
                title="Vessel Departed"
                value={vesselDeparted}
            />

            <SummaryCard
                title="Completed"
                value={completed}
            />

        </div>
    );
}

function SummaryCard({
    title,
    value,
}) {
    return (
        <div className="card summary-card">

            <span className="muted">
                {title}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}

/* ============================================================
   DETAIL PANEL
============================================================ */

function ForwardingDetail({
    record,
    job,
    onClose,
    onUpdate,
    onUpdateTask,
    onUpdateContainer,
    onAddContainer,
    onRemoveContainer,
}) {
    const status = calculateOverallStatus(record);
    const progress = getProgress(record);
    const [activeTab, setActiveTab] = useState("checklist");

    return (
        <div className="clearing-overlay">

            <div className="clearing-modal">

                {/* HEADER */}

                <div className="modal-header">

                    <div>

                        <h2>
                            Forwarding —{" "}
                            {job?.jobNo ||
                                "Job"}
                        </h2>

                        <p className="muted">
                            Manage complete forwarding
                            operations, checklist master, and shipment
                            execution.
                        </p>

                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                {/* STATUS */}

                <div className="clearing-status-header">

                    <div>

                        <span className="muted">
                            Current Status
                        </span>

                        <div className="status-row">
                            <StatusBadge
                                status={status}
                            />
                        </div>

                    </div>

                    <div className="progress-large">

                        <div className="progress-info">

                            <span>
                                Overall Progress
                            </span>

                            <strong>
                                {progress}%
                            </strong>

                        </div>

                        <div className="progress-track">

                            <div
                                className="progress-fill"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                </div>

                {/* TABS */}

                <div style={{ display: "flex", gap: "10px", margin: "15px 0", borderBottom: "2px solid #e2e8f0" }}>
                    <button
                        className={`btn ${activeTab === "checklist" ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "8px 16px", borderRadius: "6px 6px 0 0" }}
                        onClick={() => setActiveTab("checklist")}
                    >
                        📋 Export Checklist & SI Master (Auto-Fills B/L)
                    </button>
                    <button
                        className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "8px 16px", borderRadius: "6px 6px 0 0" }}
                        onClick={() => setActiveTab("overview")}
                    >
                        ⚙️ Workflow & Operations
                    </button>
                </div>

                {activeTab === "checklist" ? (
                    <ExportChecklistSection job={job} record={record} />
                ) : (
                    <>
                    <section className="detail-section">
                    <SectionTitle
                        title="Forwarding Information"
                    />

                    <div className="form-grid">

                        <FormField
                            label="Assigned To"
                        >
                            <input
                                value={
                                    record.assignedTo
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            assignedTo:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Enter employee name"
                            />
                        </FormField>

                        <FormField
                            label="Priority"
                        >
                            <select
                                value={
                                    record.priority
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            priority:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            >
                                <option>
                                    Low
                                </option>

                                <option>
                                    Medium
                                </option>

                                <option>
                                    High
                                </option>

                                <option>
                                    Urgent
                                </option>
                            </select>
                        </FormField>

                        <FormField
                            label="Job Number"
                        >
                            <input
                                value={
                                    job?.jobNo || ""
                                }
                                readOnly
                            />
                        </FormField>

                        <FormField
                            label="Customer"
                        >
                            <input
                                value={
                                    job?.customerName ||
                                    job?.customer ||
                                    ""
                                }
                                readOnly
                            />
                        </FormField>

                    </div>

                </section>

                {/* ROUTE */}

                <section className="detail-section">

                    <SectionTitle
                        title="Shipment Route"
                    />

                    <div className="form-grid">

                        <FormField
                            label="Port of Loading"
                        >
                            <input
                                value={
                                    record.portOfLoading
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            portOfLoading:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="POL"
                            />
                        </FormField>

                        <FormField
                            label="Port of Discharge"
                        >
                            <input
                                value={
                                    record.portOfDischarge
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            portOfDischarge:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="POD"
                            />
                        </FormField>

                        <FormField
                            label="Final Destination"
                        >
                            <input
                                value={
                                    record.finalDestination
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            finalDestination:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Final destination"
                            />
                        </FormField>

                    </div>

                </section>

                {/* WORKFLOW */}

                <section className="detail-section">

                    <SectionTitle
                        title="Forwarding Workflow"
                        description="Each operational stage drives the overall forwarding status automatically."
                    />

                    <div className="workflow-list">

                        {record.workflow.map(
                            (task, index) => (
                                <WorkflowTask
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    onChange={(changes) =>
                                        onUpdateTask(
                                            record,
                                            task.id,
                                            changes
                                        )
                                    }
                                />
                            )
                        )}

                    </div>

                </section>

                {/* BOOKING */}

                <section className="detail-section">

                    <SectionTitle
                        title="Carrier Booking"
                    />

                    <div className="form-grid">

                        <FormField
                            label="Booking Number"
                        >
                            <input
                                value={
                                    record.bookingNo
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            bookingNo:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Enter booking number"
                            />
                        </FormField>

                        <FormField
                            label="Booking Date"
                        >
                            <input
                                type="date"
                                value={
                                    record.bookingDate
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            bookingDate:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="Shipping Line"
                        >
                            <input
                                value={
                                    record.shippingLine
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            shippingLine:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Carrier / Shipping Line"
                            />
                        </FormField>

                        <FormField
                            label="Booking Confirmation Date"
                        >
                            <input
                                type="date"
                                value={
                                    record.bookingConfirmationDate
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            bookingConfirmationDate:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                    </div>

                </section>

                {/* CONTAINERS */}

                <section className="detail-section">

                    <div className="section-title section-title-row">

                        <div>
                            <h3>
                                Container Management
                            </h3>

                            <p className="muted">
                                Allocate and track
                                containers through
                                gate-in and loading.
                            </p>
                        </div>

                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                                onAddContainer(
                                    record
                                )
                            }
                        >
                            + Add Container
                        </button>

                    </div>

                    <div className="document-table">

                        <table>

                            <thead>

                                <tr>
                                    <th>
                                        Container No.
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Seal No.
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Gate-In
                                    </th>

                                    <th>
                                        Remarks
                                    </th>

                                    <th>
                                        Action
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {record.containers.map(
                                    (container) => (
                                        <tr
                                            key={
                                                container.id
                                            }
                                        >

                                            <td>
                                                <input
                                                    value={
                                                        container.containerNo
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        onUpdateContainer(
                                                            record,
                                                            container.id,
                                                            {
                                                                containerNo:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="MSCU..."
                                                />
                                            </td>

                                            <td>

                                                <select
                                                    value={
                                                        container.containerType
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        onUpdateContainer(
                                                            record,
                                                            container.id,
                                                            {
                                                                containerType:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                >

                                                    <option>
                                                        20' GP
                                                    </option>

                                                    <option>
                                                        40' GP
                                                    </option>

                                                    <option>
                                                        40' HC
                                                    </option>

                                                    <option>
                                                        45' HC
                                                    </option>

                                                    <option>
                                                        Reefer
                                                    </option>

                                                </select>

                                            </td>

                                            <td>

                                                <input
                                                    value={
                                                        container.sealNo
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        onUpdateContainer(
                                                            record,
                                                            container.id,
                                                            {
                                                                sealNo:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Seal"
                                                />

                                            </td>

                                            <td>

                                                <select
                                                    value={
                                                        container.status
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        onUpdateContainer(
                                                            record,
                                                            container.id,
                                                            {
                                                                status:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                >

                                                    {CONTAINER_STATUSES.map(
                                                        (status) => (
                                                            <option
                                                                key={
                                                                    status
                                                                }
                                                            >
                                                                {
                                                                    status
                                                                }
                                                            </option>
                                                        )
                                                    )}

                                                </select>

                                            </td>

                                            <td>

                                                <input
                                                    type="date"
                                                    value={
                                                        container.gateInDate ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        onUpdateContainer(
                                                            record,
                                                            container.id,
                                                            {
                                                                gateInDate:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                />

                                            </td>

                                            <td>

                                                <input
                                                    value={
                                                        container.remarks ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        onUpdateContainer(
                                                            record,
                                                            container.id,
                                                            {
                                                                remarks:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Remarks"
                                                />

                                            </td>

                                            <td>

                                                {record
                                                    .containers
                                                    .length >
                                                    1 && (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                onRemoveContainer(
                                                                    record,
                                                                    container.id
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    )}

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

                {/* VESSEL */}

                <section className="detail-section">

                    <SectionTitle
                        title="Vessel Schedule"
                    />

                    <div className="form-grid">

                        <FormField
                            label="Vessel Name"
                        >
                            <input
                                value={
                                    record.vessel
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            vessel:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Vessel name"
                            />
                        </FormField>

                        <FormField
                            label="Voyage"
                        >
                            <input
                                value={
                                    record.voyage
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            voyage:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Voyage number"
                            />
                        </FormField>

                        <FormField
                            label="ETD"
                        >
                            <input
                                type="date"
                                value={
                                    record.etd
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            etd:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="ETA"
                        >
                            <input
                                type="date"
                                value={
                                    record.eta
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            eta:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                    </div>

                </section>

                {/* SHIPPING INSTRUCTION */}

                <section className="detail-section">

                    <SectionTitle
                        title="Shipping Instruction"
                    />

                    <div className="form-grid">

                        <FormField
                            label="SI Number"
                        >
                            <input
                                value={
                                    record.siNo
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            siNo:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="SI number"
                            />
                        </FormField>

                        <FormField
                            label="SI Date"
                        >
                            <input
                                type="date"
                                value={
                                    record.siDate
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            siDate:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="SI Submitted Date"
                        >
                            <input
                                type="date"
                                value={
                                    record.siSubmittedDate
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            siSubmittedDate:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                    </div>

                </section>

                {/* VGM */}

                <section className="detail-section">

                    <SectionTitle
                        title="Verified Gross Mass (VGM)"
                    />

                    <div className="form-grid">

                        <FormField
                            label="VGM Number"
                        >
                            <input
                                value={
                                    record.vgmNo
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            vgmNo:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="VGM number"
                            />
                        </FormField>

                        <FormField
                            label="VGM Date"
                        >
                            <input
                                type="date"
                                value={
                                    record.vgmDate
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            vgmDate:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="VGM Weight"
                        >
                            <input
                                type="number"
                                value={
                                    record.vgmWeight
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            vgmWeight:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="Weight"
                            />
                        </FormField>

                        <FormField
                            label="Unit"
                        >
                            <select
                                value={
                                    record.vgmUnit
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            vgmUnit:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            >
                                <option>
                                    KG
                                </option>

                                <option>
                                    MT
                                </option>
                            </select>
                        </FormField>

                    </div>

                </section>

                {/* BL */}

                <section className="detail-section">

                    <SectionTitle
                        title="Bill of Lading"
                    />

                    <div className="form-grid">

                        <FormField
                            label="BL Number"
                        >
                            <input
                                value={
                                    record.blNo
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            blNo:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                                placeholder="BL number"
                            />
                        </FormField>

                        <FormField
                            label="BL Date"
                        >
                            <input
                                type="date"
                                value={
                                    record.blDate
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            blDate:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            label="BL Status"
                        >
                            <select
                                value={
                                    record.blStatus
                                }
                                onChange={(event) =>
                                    onUpdate(
                                        record.id,
                                        {
                                            blStatus:
                                                event.target
                                                    .value,
                                        }
                                    )
                                }
                            >
                                {BL_STATUSES.map(
                                    (status) => (
                                        <option
                                            key={
                                                status
                                            }
                                        >
                                            {
                                                status
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </FormField>

                    </div>

                </section>

                {/* REMARKS */}

                <section className="detail-section">

                    <SectionTitle
                        title="General Remarks"
                    />

                    <textarea
                        rows="4"
                        value={
                            record.remarks
                        }
                        onChange={(event) =>
                            onUpdate(
                                record.id,
                                {
                                    remarks:
                                        event.target
                                            .value,
                                }
                            )
                        }
                        placeholder="Enter forwarding remarks..."
                    />

                </section>

                {/* FOOTER */}

                <div className="modal-footer">

                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>

                </div>

                </>
                )}

            </div>

        </div>
    );
}

/* ============================================================
   WORKFLOW TASK
============================================================ */

function WorkflowTask({
    task,
    index,
    onChange,
}) {
    return (
        <div className="workflow-task">

            <div className="workflow-number">
                {index + 1}
            </div>

            <div className="workflow-main">

                <div className="workflow-title">

                    <strong>
                        {task.name}
                    </strong>

                    <StatusBadge
                        status={task.status}
                    />

                </div>

                <div className="workflow-fields">

                    <select
                        value={
                            task.status
                        }
                        onChange={(event) =>
                            onChange({
                                status:
                                    event.target
                                        .value,

                                date:
                                    event.target
                                        .value ===
                                        "Completed"
                                        ? task.date ||
                                        today()
                                        : task.date,
                            })
                        }
                    >

                        {TASK_STATUS.map(
                            (status) => (
                                <option
                                    key={status}
                                >
                                    {status}
                                </option>
                            )
                        )}

                    </select>

                    <input
                        type="date"
                        value={
                            task.date || ""
                        }
                        onChange={(event) =>
                            onChange({
                                date:
                                    event.target
                                        .value,
                            })
                        }
                    />

                    <input
                        type="text"
                        value={
                            task.remarks ||
                            ""
                        }
                        onChange={(event) =>
                            onChange({
                                remarks:
                                    event.target
                                        .value,
                            })
                        }
                        placeholder="Remarks"
                    />

                </div>

            </div>

        </div>
    );
}

/* ============================================================
   COMMON COMPONENTS
============================================================ */

function FormField({
    label,
    children,
}) {
    return (
        <div className="form-field">

            <label>
                {label}
            </label>

            {children}

        </div>
    );
}

function SectionTitle({
    title,
    description,
}) {
    return (
        <div className="section-title">

            <div>

                <h3>
                    {title}
                </h3>

                {description && (
                    <p className="muted">
                        {description}
                    </p>
                )}

            </div>

        </div>
    );
}

function today() {
    return new Date()
        .toISOString()
        .split("T")[0];
}

/* ============================================================
   EXPORT CHECKLIST & SI MASTER SECTION
============================================================ */

function ExportChecklistSection({ job, record }) {
    const { store, saveChecklistForJob, getChecklistForJob } = useERP();
    const navigate = useNavigate();

    const existingChecklist = getChecklistForJob(job?.id);
    const clearingJob = (store.clearingJobs || []).find((c) => c.jobId === job?.id);

    const [form, setForm] = useState(() => {
        if (existingChecklist) return existingChecklist;

        const defaultShipper = (store.parties || []).find((p) => p.type === "Shipper") || {
            name: job?.customerName || "",
            address: "Plot 45, Industrial Zone 2, GIDC Estate",
            city: "Ahmedabad",
            country: "India",
            taxId: "24AAAAA0000A1ZB",
            iecCode: "0509012345",
        };

        const defaultConsignee = (store.parties || []).find((p) => p.type === "Consignee") || {
            name: "Euro Distribution GmBH",
            address: "Hafenstrasse 120, 20457",
            city: "Hamburg",
            country: "Germany",
            taxId: "DE998877665",
        };

        const defaultNotify = (store.parties || []).find((p) => p.type === "Notify Party") || {
            name: "Rotterdam Logistics BV",
            address: "Waalhaven Zuidzijde 19",
            city: "Rotterdam",
            country: "Netherlands",
            taxId: "NL887766554B01",
        };

        return {
            bookingNo: record?.bookingNo || "BKG-MSC-902188",
            shippingLine: record?.shippingLine || "MSC Mediterranean Shipping Company",
            vessel: record?.vessel || "MSC OSCAR",
            voyage: record?.voyage || "2609W",
            portOfLoading: record?.portOfLoading || job?.pol || "Nhava Sheva (INNSA)",
            portOfDischarge: record?.portOfDischarge || job?.pod || "Hamburg (DEHAM)",
            placeOfReceipt: "Ahmedabad ICD",
            placeOfDelivery: job?.fpod || "Hamburg Port Terminal",
            finalDestination: record?.finalDestination || job?.fpod || "Hamburg Port Terminal",
            siNo: record?.siNo || "SI-2026-09-001",
            siDate: record?.siDate || today(),
            shippingBillNo: clearingJob?.shippingBillNo || "SB-8891023",
            shippingBillDate: clearingJob?.shippingBillDate || today(),
            shipper: defaultShipper,
            consignee: defaultConsignee,
            notifyParty: defaultNotify,
            cargoItems: [
                {
                    id: "item-1",
                    commodity: job?.cargoDetails?.[0]?.commodity || "Cotton Manufactured Garments (T-Shirts)",
                    hsCode: job?.cargoDetails?.[0]?.hsn_code || "61091000",
                    packages: job?.cargoDetails?.[0]?.quantity || "500",
                    packageType: job?.cargoDetails?.[0]?.packaging || "Cartons",
                    grossWeight: job?.cargoDetails?.[0]?.weight || "12500",
                    weightUnit: "KG",
                    netWeight: "11800",
                    measurement: job?.cargoDetails?.[0]?.volume || "45",
                    measurementUnit: "CBM",
                    marksAndNumbers: "APEX/HAM/1-500",
                },
            ],
            containers: (record?.containers || []).map((c) => ({
                id: c.id,
                containerNo: c.containerNo || "MSCU7829104",
                containerType: c.containerType || "40' HC",
                sealNo: c.sealNo || "MSC-998821",
                tareWeight: "3800",
                grossWeight: c.grossWeight || "16300",
                packages: "500",
                vgmNo: record?.vgmNo || "VGM-881920",
            })),
            remarks: "Export Checklist verified and ready for B/L generation.",
        };
    });

    const [savedSuccess, setSavedSuccess] = useState(false);

    const handlePartySelect = (partyType, partyId) => {
        const selectedParty = (store.parties || []).find((p) => p.id === partyId);
        if (!selectedParty) return;

        if (partyType === "shipper") setForm((prev) => ({ ...prev, shipper: { ...selectedParty } }));
        if (partyType === "consignee") setForm((prev) => ({ ...prev, consignee: { ...selectedParty } }));
        if (partyType === "notifyParty") setForm((prev) => ({ ...prev, notifyParty: { ...selectedParty } }));
    };

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
            shipper: {
                name: "Apex Global Traders Pvt Ltd",
                address: "Plot 45, Industrial Zone 2, GIDC Estate",
                city: "Ahmedabad",
                country: "India",
                taxId: "24AAAAA0000A1ZB",
                iecCode: "0509012345",
            },
            consignee: {
                name: "Euro Distribution GmBH",
                address: "Hafenstrasse 120, 20457",
                city: "Hamburg",
                country: "Germany",
                taxId: "DE998877665",
            },
            notifyParty: {
                name: "Rotterdam Logistics BV",
                address: "Waalhaven Zuidzijde 19",
                city: "Rotterdam",
                country: "Netherlands",
                taxId: "NL887766554B01",
            },
            cargoItems: [
                {
                    id: "item-1",
                    commodity: "Cotton Manufactured Garments (T-Shirts)",
                    hsCode: "61091000",
                    packages: "500",
                    packageType: "Cartons",
                    grossWeight: "12500",
                    weightUnit: "KG",
                    netWeight: "11800",
                    measurement: "45",
                    measurementUnit: "CBM",
                    marksAndNumbers: "APEX/HAM/1-500",
                },
            ],
            containers: [
                {
                    id: "cont-1",
                    containerNo: "MSCU7829104",
                    containerType: "40' HC",
                    sealNo: "MSC-998821",
                    tareWeight: "3800",
                    grossWeight: "16300",
                    packages: "500",
                    vgmNo: "VGM-881920",
                },
            ],
        }));

        alert(`File "${file?.name || 'Checklist.pdf'}" parsed successfully! Checklist master populated.`);
    };

    const handleSave = () => {
        if (!job?.id) return;
        saveChecklistForJob(job.id, form);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 5000);
    };

    return (
        <div className="checklist-master-section card" style={{ padding: "20px", marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>📋 Export Checklist & Shipping Instruction (SI) Master</h3>
                    <p className="muted" style={{ margin: "4px 0 0 0" }}>
                        Upload or enter export checklist details. Data automatically stores in central Master and auto-fills Bill of Lading (B/L).
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        ⚡ Upload / Parse Export Checklist File
                        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg" style={{ display: "none" }} onChange={handleSimulatedUpload} />
                    </label>

                    <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        💾 Save Master & Auto-Fill B/L
                    </button>
                </div>
            </div>

            {savedSuccess && (
                <div style={{ padding: "12px 16px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", marginBottom: "15px", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>✓ Export Checklist Master saved! Bill of Lading (B/L) auto-filled and synchronized.</span>
                    <button className="btn btn-sm" style={{ backgroundColor: "#15803d", color: "#fff" }} onClick={() => navigate("/company/export/bill-of-lading")}>
                        View Bill of Lading →
                    </button>

                </div>
            )}

            {/* PARTIES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                {/* SHIPPER */}
                <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h4 style={{ margin: 0 }}>Shipper (Exporter)</h4>
                        <select className="compact-select" style={{ maxWidth: "160px" }} onChange={(e) => handlePartySelect("shipper", e.target.value)}>
                            <option value="">Select Master...</option>
                            {(store.parties || []).map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                        <FormField label="Company Name">
                            <input value={form.shipper?.name || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, name: e.target.value } }))} />
                        </FormField>
                        <FormField label="Address">
                            <input value={form.shipper?.address || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, address: e.target.value } }))} />
                        </FormField>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <FormField label="City">
                                <input value={form.shipper?.city || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, city: e.target.value } }))} />
                            </FormField>
                            <FormField label="Country">
                                <input value={form.shipper?.country || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, country: e.target.value } }))} />
                            </FormField>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <FormField label="GSTIN / Tax ID">
                                <input value={form.shipper?.taxId || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, taxId: e.target.value } }))} />
                            </FormField>
                            <FormField label="IEC Code">
                                <input value={form.shipper?.iecCode || ""} onChange={(e) => setForm((p) => ({ ...p, shipper: { ...p.shipper, iecCode: e.target.value } }))} />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* CONSIGNEE */}
                <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h4 style={{ margin: 0 }}>Consignee (Buyer)</h4>
                        <select className="compact-select" style={{ maxWidth: "160px" }} onChange={(e) => handlePartySelect("consignee", e.target.value)}>
                            <option value="">Select Master...</option>
                            {(store.parties || []).map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                        <FormField label="Company Name">
                            <input value={form.consignee?.name || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, name: e.target.value } }))} />
                        </FormField>
                        <FormField label="Address">
                            <input value={form.consignee?.address || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, address: e.target.value } }))} />
                        </FormField>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <FormField label="City">
                                <input value={form.consignee?.city || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, city: e.target.value } }))} />
                            </FormField>
                            <FormField label="Country">
                                <input value={form.consignee?.country || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, country: e.target.value } }))} />
                            </FormField>
                        </div>
                        <FormField label="Tax / EORI ID">
                            <input value={form.consignee?.taxId || ""} onChange={(e) => setForm((p) => ({ ...p, consignee: { ...p.consignee, taxId: e.target.value } }))} />
                        </FormField>
                    </div>
                </div>

                {/* NOTIFY PARTY */}
                <div className="card" style={{ padding: "15px", backgroundColor: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h4 style={{ margin: 0 }}>Notify Party</h4>
                        <select className="compact-select" style={{ maxWidth: "160px" }} onChange={(e) => handlePartySelect("notifyParty", e.target.value)}>
                            <option value="">Select Master...</option>
                            {(store.parties || []).map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                        <FormField label="Company Name">
                            <input value={form.notifyParty?.name || ""} onChange={(e) => setForm((p) => ({ ...p, notifyParty: { ...p.notifyParty, name: e.target.value } }))} />
                        </FormField>
                        <FormField label="Address">
                            <input value={form.notifyParty?.address || ""} onChange={(e) => setForm((p) => ({ ...p, notifyParty: { ...p.notifyParty, address: e.target.value } }))} />
                        </FormField>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <FormField label="City">
                                <input value={form.notifyParty?.city || ""} onChange={(e) => setForm((p) => ({ ...p, notifyParty: { ...p.notifyParty, city: e.target.value } }))} />
                            </FormField>
                            <FormField label="Country">
                                <input value={form.notifyParty?.country || ""} onChange={(e) => setForm((p) => ({ ...p, notifyParty: { ...p.notifyParty, country: e.target.value } }))} />
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARGO & COMMODITY */}
            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0 }}>Cargo & Commodity Checklist</h4>
                    <button className="btn btn-secondary btn-sm" onClick={() => setForm(p => ({ ...p, cargoItems: [...(p.cargoItems || []), { id: 'item-' + Date.now(), commodity: '', hsCode: '', packages: '', packageType: 'Cartons', grossWeight: '', netWeight: '', measurement: '', marksAndNumbers: '' }] }))}>+ Add Cargo Row</button>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Commodity Description</th>
                                <th>HSN Code</th>
                                <th>Packages</th>
                                <th>Pkg Type</th>
                                <th>Gross Wt (KG)</th>
                                <th>Net Wt (KG)</th>
                                <th>CBM</th>
                                <th>Marks & Numbers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.cargoItems?.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td>
                                        <input value={item.commodity || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].commodity = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} placeholder="Goods description" />
                                    </td>
                                    <td>
                                        <input value={item.hsCode || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].hsCode = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} placeholder="HSN" style={{ width: "90px" }} />
                                    </td>
                                    <td>
                                        <input type="number" value={item.packages || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].packages = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} style={{ width: "70px" }} />
                                    </td>
                                    <td>
                                        <input value={item.packageType || "Cartons"} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].packageType = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} style={{ width: "90px" }} />
                                    </td>
                                    <td>
                                        <input type="number" value={item.grossWeight || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].grossWeight = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} style={{ width: "90px" }} />
                                    </td>
                                    <td>
                                        <input type="number" value={item.netWeight || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].netWeight = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} style={{ width: "90px" }} />
                                    </td>
                                    <td>
                                        <input type="number" value={item.measurement || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].measurement = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} style={{ width: "70px" }} />
                                    </td>
                                    <td>
                                        <input value={item.marksAndNumbers || ""} onChange={(e) => {
                                            const updated = [...form.cargoItems];
                                            updated[index].marksAndNumbers = e.target.value;
                                            setForm(p => ({ ...p, cargoItems: updated }));
                                        }} placeholder="Marks" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CONTAINER MASTER & SEALS */}
            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0 }}>Container Allocations & Seals</h4>
                    <button className="btn btn-secondary btn-sm" onClick={() => setForm(p => ({ ...p, containers: [...(p.containers || []), { id: 'cont-' + Date.now(), containerNo: '', containerType: "40' HC", sealNo: '', tareWeight: '3800', grossWeight: '', packages: '' }] }))}>+ Add Container</button>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Container No.</th>
                                <th>Type</th>
                                <th>Seal No.</th>
                                <th>Tare Weight (KG)</th>
                                <th>Gross Weight (KG)</th>
                                <th>Packages</th>
                                <th>VGM No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.containers?.map((c, index) => (
                                <tr key={c.id || index}>
                                    <td>
                                        <input value={c.containerNo || ""} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].containerNo = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }} placeholder="MSCU..." />
                                    </td>
                                    <td>
                                        <select value={c.containerType || "40' HC"} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].containerType = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }}>
                                            <option>20' GP</option>
                                            <option>40' GP</option>
                                            <option>40' HC</option>
                                            <option>Reefer</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input value={c.sealNo || ""} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].sealNo = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }} placeholder="Seal No" />
                                    </td>
                                    <td>
                                        <input type="number" value={c.tareWeight || ""} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].tareWeight = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }} style={{ width: "90px" }} />
                                    </td>
                                    <td>
                                        <input type="number" value={c.grossWeight || ""} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].grossWeight = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }} style={{ width: "90px" }} />
                                    </td>
                                    <td>
                                        <input type="number" value={c.packages || ""} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].packages = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }} style={{ width: "70px" }} />
                                    </td>
                                    <td>
                                        <input value={c.vgmNo || ""} onChange={(e) => {
                                            const updated = [...form.containers];
                                            updated[index].vgmNo = e.target.value;
                                            setForm(p => ({ ...p, containers: updated }));
                                        }} placeholder="VGM No" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}