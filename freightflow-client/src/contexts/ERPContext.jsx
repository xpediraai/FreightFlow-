import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { seedData } from "../data/mockData";

const STORAGE_KEY = "freightflow_export_erp_v1";

export const ERPContext = createContext(null);


/* ============================================================
   HELPERS
============================================================ */

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

const today = () =>
  new Date().toISOString().slice(0, 10);

const now = () =>
  new Date().toISOString();

/* ============================================================
   EMPTY BL
============================================================ */

const emptyParty = () => ({
  name: "",
  address: "",
  city: "",
  country: "",
});

const emptyCargo = () => ({
  id: makeId("cargo"),

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

const createEmptyBL = (jobId = "") => ({
  id: makeId("bl"),

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

  createdAt: now(),
  updatedAt: now(),
});

/* ============================================================
   LOAD STORE
============================================================ */

function loadStore() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      /*
       * Merge seedData with saved data.
       *
       * Important:
       * This also makes sure billOfLadings exists when the
       * user already has an old localStorage version.
       */
      return {
        ...seedData,
        ...parsed,

        billOfLadings: parsed.billOfLadings || seedData.billOfLadings || [],
        checklists: parsed.checklists || seedData.checklists || [],
        parties: parsed.parties || seedData.parties || [],
      };
    }
  } catch (error) {
    console.error(
      "Failed to load FreightFlow localStorage:",
      error
    );
  }

  return {
    ...seedData,
    billOfLadings: seedData.billOfLadings || [],
    checklists: seedData.checklists || [],
    parties: seedData.parties || [],
  };
}

/* ============================================================
   PROVIDER
============================================================ */

export function ERPProvider({ children }) {
  const [store, setStore] = useState(loadStore);

  /* ============================================================
     LOCAL STORAGE
  ============================================================ */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(store)
      );
    } catch (error) {
      console.error(
        "Failed to save FreightFlow localStorage:",
        error
      );
    }
  }, [store]);

  /* ============================================================
     GENERIC UPDATE
  ============================================================ */

  const update = (key, updater) => {
    setStore((prev) => {
      const currentValue = prev[key] || [];

      const nextValue =
        typeof updater === "function"
          ? updater(currentValue)
          : updater;

      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  /* ============================================================
     ADD
  ============================================================ */

  const add = (key, item) => {
    const record = {
      id: makeId(key.slice(0, 3)),
      createdAt: now(),
      ...item,
    };

    update(key, (list) => [
      ...(list || []),
      record,
    ]);

    return record;
  };

  /* ============================================================
     PATCH
     
     IMPORTANT:
     
     Existing implementation could only UPDATE.
     
     BL creation needs PATCH to also CREATE if the ID doesn't
     already exist.
  ============================================================ */

  const patch = (key, id, changes) => {
    let result = null;

    setStore((prev) => {
      const list = prev[key] || [];

      /* --------------------------------------------------------
         DELETE
      -------------------------------------------------------- */

      if (changes === null) {
        return {
          ...prev,

          [key]: list.filter(
            (item) => item.id !== id
          ),
        };
      }

      /* --------------------------------------------------------
         CHECK EXISTING
      -------------------------------------------------------- */

      const exists = list.some(
        (item) => item.id === id
      );

      /* --------------------------------------------------------
         UPDATE
      -------------------------------------------------------- */

      if (exists) {
        const updatedList = list.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const updated = {
            ...item,
            ...changes,
            updatedAt: now(),
          };

          result = updated;

          return updated;
        });

        return {
          ...prev,
          [key]: updatedList,
        };
      }

      /* --------------------------------------------------------
         CREATE
      -------------------------------------------------------- */

      const newRecord = {
        id,
        ...changes,
        createdAt:
          changes.createdAt || now(),
        updatedAt: now(),
      };

      result = newRecord;

      return {
        ...prev,

        [key]: [
          ...list,
          newRecord,
        ],
      };
    });

    return result;
  };

  /* ============================================================
     REMOVE
  ============================================================ */

  const remove = (key, id) =>
    update(key, (list) =>
      (list || []).filter(
        (item) => item.id !== id
      )
    );

  /* ============================================================
     RESET DEMO
  ============================================================ */

  const resetDemo = () => {
    setStore({
      ...seedData,
      billOfLadings: seedData.billOfLadings || [],
      checklists: seedData.checklists || [],
      parties: seedData.parties || [],
    });
  };

  /* ============================================================
     NUMBER GENERATOR
  ============================================================ */

  const generateNo = (prefix, list = []) =>
    `${prefix}-${new Date().getFullYear()}-${String(
      list.length + 1
    ).padStart(4, "0")}`;

  /* ============================================================
     CREATE QUOTATION FROM INQUIRY
  ============================================================ */

  const createQuotationFromInquiry = (inquiry) => {
    const charges = [];

    (inquiry.services || []).forEach(
      (serviceId) => {
        const defaults = {
          clearing: [
            ["Customs Clearance", 5000],
            ["Shipping Bill Filing", 2000],
            ["Documentation", 1500],
          ],

          forwarding: [
            ["Ocean Freight", 65000],
            ["Booking Charges", 3000],
            ["BL Documentation", 2500],
          ],

          transport: [
            ["Factory Pickup", 7000],
            ["Port Transportation", 9000],
          ],
        };

        (defaults[serviceId] || []).forEach(
          ([description, amount]) => {
            charges.push({
              id: makeId("charge"),
              serviceId,
              description,
              quantity: 1,
              rate: amount,
              amount,
            });
          }
        );
      }
    );

    return add("quotations", {
      quotationNo: generateNo(
        "QUO",
        store.quotations
      ),

      inquiryId: inquiry.id,

      customerId:
        inquiry.customerId,

      customerName:
        inquiry.customerName,

      validUntil: new Date(
        Date.now() +
        7 * 86400000
      )
        .toISOString()
        .slice(0, 10),

      status: "Draft",

      discount: 0,

      taxRate: 18,

      charges,
    });
  };

  /* ============================================================
     CREATE BL FROM JOB
  ============================================================ */

  /* ============================================================
     CHECKLIST & BL AUTOMATION
  ============================================================ */

  const getChecklistForJob = (jobId) => {
    if (!jobId) return null;
    return (store.checklists || []).find((c) => c.jobId === jobId) || null;
  };

  const syncBLFromJobChecklist = (jobId) => {
    if (!jobId) return null;

    const job = (store.jobs || []).find((j) => j.id === jobId);
    const checklist = (store.checklists || []).find((c) => c.jobId === jobId);
    const forwardingJob = (store.forwardingJobs || []).find((f) => f.jobId === jobId);
    const clearingJob = (store.clearingJobs || []).find((c) => c.jobId === jobId);
    const jobContainers = (store.containers || []).filter((c) => c.jobId === jobId);

    const existingBL = (store.billOfLadings || []).find((bl) => bl.jobId === jobId);
    const blId = existingBL ? existingBL.id : makeId("bl");

    const shipper = checklist?.shipper?.name
      ? checklist.shipper
      : {
          name: job?.customerName || "",
          address: "",
          city: "",
          country: "",
          taxId: "",
          iecCode: "",
        };

    const consignee = checklist?.consignee?.name
      ? checklist.consignee
      : existingBL?.consignee || emptyParty();

    const notifyParty = checklist?.notifyParty?.name
      ? checklist.notifyParty
      : existingBL?.notifyParty || emptyParty();

    let cargo = [];
    if (checklist?.cargoItems && checklist.cargoItems.length > 0) {
      cargo = checklist.cargoItems.map((item, idx) => {
        const matchingContainer = checklist.containers?.[idx] || jobContainers[idx] || {};
        return {
          id: item.id || makeId("cargo"),
          containerNo: item.containerNo || matchingContainer.containerNo || "",
          sealNo: item.sealNo || matchingContainer.sealNo || "",
          packages: item.packages || "",
          packageType: item.packageType || "Cartons",
          description: item.commodity || item.description || "",
          hsCode: item.hsCode || "",
          grossWeight: item.grossWeight || matchingContainer.grossWeight || "",
          weightUnit: item.weightUnit || "KG",
          netWeight: item.netWeight || "",
          measurement: item.measurement || "",
          measurementUnit: item.measurementUnit || "CBM",
          marksAndNumbers: item.marksAndNumbers || "",
        };
      });
    } else if (checklist?.containers && checklist.containers.length > 0) {
      cargo = checklist.containers.map((c) => ({
        id: makeId("cargo"),
        containerNo: c.containerNo || "",
        sealNo: c.sealNo || "",
        packages: c.packages || "",
        packageType: "Cartons",
        description: job?.cargoDetails?.[0]?.commodity || "",
        hsCode: job?.cargoDetails?.[0]?.hsn_code || "",
        grossWeight: c.grossWeight || "",
        weightUnit: "KG",
        netWeight: "",
        measurement: "",
        measurementUnit: "CBM",
        marksAndNumbers: "",
      }));
    } else if (existingBL?.cargo?.length > 0) {
      cargo = existingBL.cargo;
    } else {
      cargo = [emptyCargo()];
    }

    const blPayload = {
      ...(existingBL || createEmptyBL(jobId)),
      jobId,
      bookingNo: checklist?.bookingNo || forwardingJob?.bookingNo || existingBL?.bookingNo || "",
      shippingLine: checklist?.shippingLine || forwardingJob?.shippingLine || existingBL?.shippingLine || "",
      vessel: checklist?.vessel || forwardingJob?.vessel || existingBL?.vessel || "",
      voyage: checklist?.voyage || forwardingJob?.voyage || existingBL?.voyage || "",
      portOfLoading: checklist?.portOfLoading || forwardingJob?.portOfLoading || job?.pol || "",
      portOfDischarge: checklist?.portOfDischarge || forwardingJob?.portOfDischarge || job?.pod || "",
      placeOfReceipt: checklist?.placeOfReceipt || "",
      placeOfDelivery: checklist?.placeOfDelivery || job?.fpod || "",
      finalDestination: checklist?.finalDestination || forwardingJob?.finalDestination || job?.fpod || "",
      shipper,
      consignee,
      notifyParty,
      cargo,
      siNo: checklist?.siNo || forwardingJob?.siNo || "",
      siDate: checklist?.siDate || forwardingJob?.siDate || "",
      shippingBillNo: clearingJob?.shippingBillNo || checklist?.shippingBillNo || existingBL?.shippingBillNo || "",
      shippingBillDate: clearingJob?.shippingBillDate || checklist?.shippingBillDate || existingBL?.shippingBillDate || "",
      status: existingBL ? existingBL.status : "Draft Prepared",
      updatedAt: now(),
    };

    return patch("billOfLadings", blId, blPayload);
  };

  const saveChecklistForJob = (jobId, checklistData) => {
    if (!jobId) return null;

    const existingChecklist = (store.checklists || []).find((c) => c.jobId === jobId);
    const checklistId = existingChecklist ? existingChecklist.id : makeId("chk");

    const record = {
      id: checklistId,
      jobId,
      ...checklistData,
      createdAt: existingChecklist ? existingChecklist.createdAt : now(),
      updatedAt: now(),
    };

    patch("checklists", checklistId, record);

    // Sync Containers master
    if (Array.isArray(checklistData.containers)) {
      checklistData.containers.forEach((c) => {
        if (c.containerNo) {
          const existingCont = (store.containers || []).find(
            (cnt) => cnt.jobId === jobId && cnt.containerNo === c.containerNo
          );
          if (existingCont) {
            patch("containers", existingCont.id, {
              sealNo: c.sealNo || existingCont.sealNo,
              weight: c.grossWeight || existingCont.weight,
              containerType: c.containerType || existingCont.containerType,
            });
          } else {
            add("containers", {
              jobId,
              containerNo: c.containerNo,
              containerType: c.containerType || "40' HC",
              sealNo: c.sealNo || "",
              weight: c.grossWeight || "",
              status: "Allocated",
            });
          }
        }
      });
    }

    // Sync Forwarding Job record
    const forwardingJob = (store.forwardingJobs || []).find((f) => f.jobId === jobId);
    if (forwardingJob) {
      patch("forwardingJobs", forwardingJob.id, {
        bookingNo: checklistData.bookingNo || forwardingJob.bookingNo,
        shippingLine: checklistData.shippingLine || forwardingJob.shippingLine,
        vessel: checklistData.vessel || forwardingJob.vessel,
        voyage: checklistData.voyage || forwardingJob.voyage,
        portOfLoading: checklistData.portOfLoading || forwardingJob.portOfLoading,
        portOfDischarge: checklistData.portOfDischarge || forwardingJob.portOfDischarge,
        finalDestination: checklistData.finalDestination || forwardingJob.finalDestination,
        siNo: checklistData.siNo || forwardingJob.siNo,
        siDate: checklistData.siDate || forwardingJob.siDate,
      });
    }

    // Sync Parties master if new
    if (checklistData.shipper?.name) {
      const exists = (store.parties || []).some(
        (p) => p.name.toLowerCase() === checklistData.shipper.name.toLowerCase()
      );
      if (!exists) {
        add("parties", { ...checklistData.shipper, type: "Shipper" });
      }
    }
    if (checklistData.consignee?.name) {
      const exists = (store.parties || []).some(
        (p) => p.name.toLowerCase() === checklistData.consignee.name.toLowerCase()
      );
      if (!exists) {
        add("parties", { ...checklistData.consignee, type: "Consignee" });
      }
    }

    // Auto-sync into Bill of Lading
    syncBLFromJobChecklist(jobId);

    return record;
  };

  const createBLFromJob = (job) => {
    if (!job) {
      console.error("createBLFromJob: Job not found");
      return null;
    }

    const existingBL = (store.billOfLadings || []).find((bl) => bl.jobId === job.id);
    if (existingBL) {
      return syncBLFromJobChecklist(job.id);
    }

    return syncBLFromJobChecklist(job.id);
  };

  const updateTransportJob = (jobId, transportData) => {
    if (!jobId) return null;
    const existing = (store.transportJobs || []).find((t) => t.jobId === jobId);
    const id = existing ? existing.id : makeId("trp");
    const record = {
      id,
      jobId,
      ...transportData,
      updatedAt: now(),
    };
    patch("transportJobs", id, record);

    if (["Gate In", "Completed", "Reached Destination"].includes(transportData.status)) {
      const jobContainers = (store.containers || []).filter((c) => c.jobId === jobId);
      jobContainers.forEach((c) => {
        patch("containers", c.id, { status: "Gate In" });
      });
    }

    return record;
  };

  const getJobFullDetails = (jobId) => {
    if (!jobId) return null;
    const job = (store.jobs || []).find((j) => j.id === jobId);
    if (!job) return null;

    const services = Array.isArray(job.services) ? job.services : ["clearing", "forwarding", "transport"];
    const hasClearing = services.includes("clearing");
    const hasForwarding = services.includes("forwarding");
    const hasTransport = services.includes("transport");

    const forwarding = hasForwarding ? (store.forwardingJobs || []).find((f) => f.jobId === jobId) || null : null;
    const clearing = hasClearing ? (store.clearingJobs || []).find((c) => c.jobId === jobId) || null : null;
    const transport = hasTransport ? (store.transportJobs || []).find((t) => t.jobId === jobId) || null : null;
    const checklist = (store.checklists || []).find((c) => c.jobId === jobId) || null;
    const billOfLading = (store.billOfLadings || []).find((b) => b.jobId === jobId) || null;
    const containers = (store.containers || []).filter((c) => c.jobId === jobId);

    return {
      job,
      services,
      hasClearing,
      hasForwarding,
      hasTransport,
      forwarding,
      clearing,
      transport,
      checklist,
      billOfLading,
      containers,
    };
  };

  const addServiceToJob = (jobId, serviceName) => {
    if (!jobId || !serviceName) return;

    setStore((prev) => {
      const jobs = prev.jobs || [];
      const updatedJobs = jobs.map((j) => {
        if (j.id !== jobId) return j;

        const currentServices = Array.isArray(j.services) ? j.services : [];
        if (currentServices.includes(serviceName)) return j;

        return {
          ...j,
          services: [...currentServices, serviceName],
          updatedAt: now(),
        };
      });

      return {
        ...prev,
        jobs: updatedJobs,
      };
    });

    if (serviceName === "clearing") {
      const exists = (store.clearingJobs || []).some((c) => c.jobId === jobId);
      if (!exists) {
        add("clearingJobs", {
          jobId,
          status: "Documents Pending",
          shippingBillNo: "",
          assessmentNo: "",
          leoDate: "",
        });
      }
    }
    if (serviceName === "forwarding") {
      const exists = (store.forwardingJobs || []).some((f) => f.jobId === jobId);
      if (!exists) {
        add("forwardingJobs", {
          jobId,
          status: "Booking Pending",
          bookingNo: "",
          shippingLine: "",
          vessel: "",
          voyage: "",
          portOfLoading: "",
          portOfDischarge: "",
          finalDestination: "",
        });
      }
    }
    if (serviceName === "transport") {
      const exists = (store.transportJobs || []).some((t) => t.jobId === jobId);
      if (!exists) {
        add("transportJobs", {
          jobId,
          status: "Vehicle Pending",
          vehicleNo: "",
          driverName: "",
          pickupDate: "",
          pickupLocation: "",
          deliveryLocation: "",
        });
      }
    }
  };

  /* ============================================================
     CREATE JOB FROM QUOTATION
  ============================================================ */

  const createJobFromQuotation = (
    quotation
  ) => {
    if (!quotation) return null;
    const inquiry = (store.inquiries || []).find(
      (i) =>
        i.id === quotation.inquiryId || i.id === quotation.inquiry_id
    );

    const pol = quotation.pol || quotation.origin || inquiry?.pol || "Mundra Port (INMUN)";
    const pod = quotation.pod || quotation.destination || inquiry?.pod || "Jebel Ali (AEJEA)";
    const fpod = quotation.fpod || quotation.destination || inquiry?.fpod || pod;
    const customerName = quotation.customerName || quotation.customer_name || quotation.exporter_name || inquiry?.customerName || "Customer";

    const job = add("jobs", {
      jobNo: generateNo(
        "EXP",
        store.jobs || []
      ),

      quotationId: quotation.id,
      quotationNo: quotation.quotationNo || quotation.quotation_no || "",

      inquiryId: quotation.inquiryId || quotation.inquiry_id || "",

      customerId: quotation.customerId || quotation.customer_id || "",

      customerName,

      pol,

      pod,

      fpod,

      shipmentType: quotation.shipmentType || quotation.shipment_terms || inquiry?.shipmentType || "FCL",

      services: quotation.services || inquiry?.services || ["clearing", "forwarding", "transport"],

      status: "In Progress",

      cargoDetails: quotation.cargoDetails || inquiry?.cargoDetails || [],

      containerDetails: quotation.containerDetails || inquiry?.containerDetails || [],
    });


    /* ----------------------------------------------------------
       CREATE CONTAINERS
    ---------------------------------------------------------- */

    (
      inquiry?.containerDetails ||
      []
    ).forEach((c) =>
      add("containers", {
        jobId: job.id,

        containerNo:
          c.containerNo || "",

        containerType:
          c.containerType ||
          "40 HC",

        sealNo:
          c.sealNo || "",

        weight:
          c.weight || "",

        status:
          "Requested",
      })
    );

    /* ----------------------------------------------------------
       CREATE SERVICE JOBS
    ---------------------------------------------------------- */

    (
      job.services || []
    ).forEach((service) => {
      /* --------------------------------------------------------
         CLEARING
      -------------------------------------------------------- */

      if (
        service ===
        "clearing"
      ) {
        add("clearingJobs", {
          jobId: job.id,

          status:
            "Documents Pending",

          shippingBillNo: "",

          assessmentNo: "",

          leoDate: "",
        });
      }

      /* --------------------------------------------------------
         FORWARDING
      -------------------------------------------------------- */

      if (
        service ===
        "forwarding"
      ) {
        add("forwardingJobs", {
          jobId: job.id,

          status:
            "Booking Pending",

          bookingNo: "",

          bookingDate: "",

          bookingConfirmationDate:
            "",

          shippingLine: "",

          vessel: "",

          voyage: "",

          etd: "",

          eta: "",

          portOfLoading:
            inquiry?.pol || "",

          portOfDischarge:
            inquiry?.pod || "",

          finalDestination:
            inquiry?.fpod || "",

          siNo: "",

          siDate: "",

          siSubmittedDate: "",

          vgmNo: "",

          vgmDate: "",

          vgmWeight: "",

          vgmUnit: "KG",

          blNo: "",

          blDate: "",

          blStatus: "",
        });
      }

      /* --------------------------------------------------------
         TRANSPORT
      -------------------------------------------------------- */

      if (
        service ===
        "transport"
      ) {
        add("transportJobs", {
          jobId: job.id,

          status:
            "Vehicle Pending",

          vehicleNo: "",

          driverName: "",

          pickupDate: "",

          pickupLocation: "",

          deliveryLocation: "",
        });
      }
    });

    /*
     * Approve quotation.
     */

    patch(
      "quotations",
      quotation.id,
      {
        status: "Approved",

        approvedAt: now(),
      }
    );

    return job;
  };

  /* ============================================================
     UPDATE FORWARDING STATUS
     
     This is useful for BL automation.
     
     When forwarding reaches:
     
     Vessel Departed
     or
     BL Draft
     
     a BL record is automatically created.
  ============================================================ */

  const updateForwardingStatus = (
    forwardingJobId,
    status
  ) => {
    const forwardingJob =
      store.forwardingJobs.find(
        (item) =>
          item.id ===
          forwardingJobId
      );

    if (!forwardingJob) {
      return null;
    }

    /*
     * Update forwarding.
     */

    patch(
      "forwardingJobs",
      forwardingJobId,
      {
        status,
      }
    );

    /*
     * Create BL when vessel has departed.
     */

    const shouldCreateBL = [
      "Vessel Departed",
      "BL Draft",
      "BL Released",
      "Completed",
    ].includes(status);

    if (shouldCreateBL) {
      const job =
        store.jobs.find(
          (item) =>
            item.id ===
            forwardingJob.jobId
        );

      if (job) {
        return createBLFromJob(
          job
        );
      }
    }

    return null;
  };

  /* ============================================================
     UPDATE BL STATUS
     
     This also keeps the forwarding record synchronized.
  ============================================================ */

  const updateBLStatus = (
    blId,
    status
  ) => {
    const bl =
      store.billOfLadings.find(
        (item) =>
          item.id === blId
      );

    if (!bl) {
      return null;
    }

    patch(
      "billOfLadings",
      blId,
      {
        status,
      }
    );

    /*
     * If final BL is received, update forwarding BL status.
     */

    if (
      [
        "Final BL Received",
        "Completed",
      ].includes(status)
    ) {
      const forwardingJob =
        store.forwardingJobs.find(
          (item) =>
            item.jobId ===
            bl.jobId
        );

      if (forwardingJob) {
        patch(
          "forwardingJobs",
          forwardingJob.id,
          {
            blNo:
              bl.blNo || "",
            blStatus:
              status,
          }
        );
      }
    }

    return true;
  };

  /* ============================================================
     STATS
  ============================================================ */

  const stats = useMemo(
    () => ({
      inquiries:
        store.inquiries.length,

      quotations:
        store.quotations.length,

      activeJobs:
        store.jobs.filter(
          (j) =>
            j.status !==
            "Closed"
        ).length,

      revenue:
        store.invoices.reduce(
          (s, i) =>
            s +
            Number(
              i.grandTotal || 0
            ),
          0
        ),

      outstanding:
        store.invoices.reduce(
          (s, i) =>
            s +
            Number(
              i.balance || 0
            ),
          0
        ),

      costs:
        store.costs.reduce(
          (s, c) =>
            s +
            Number(
              c.amount || 0
            ),
          0
        ),

      /* --------------------------------------------------------
         BL STATS
      -------------------------------------------------------- */

      billOfLadings:
        (
          store.billOfLadings ||
          []
        ).length,

      pendingBLs:
        (
          store.billOfLadings ||
          []
        ).filter(
          (bl) =>
            [
              "Not Started",
              "Data Pending",
            ].includes(
              bl.status
            )
        ).length,

      draftBLs:
        (
          store.billOfLadings ||
          []
        ).filter(
          (bl) =>
            [
              "Draft Prepared",
              "Submitted to Carrier",
              "Draft Received",
            ].includes(
              bl.status
            )
        ).length,

      finalBLs:
        (
          store.billOfLadings ||
          []
        ).filter(
          (bl) =>
            [
              "Final BL Received",
              "Completed",
            ].includes(
              bl.status
            )
        ).length,
    }),
    [store]
  );

  /* ============================================================
     CONTEXT VALUE
  ============================================================ */

  const value = {
    store,

    add,
    patch,
    remove,
    update,

    resetDemo,

    createQuotationFromInquiry,

    createJobFromQuotation,

    createBLFromJob,

    getChecklistForJob,

    saveChecklistForJob,

    syncBLFromJobChecklist,

    updateTransportJob,

    getJobFullDetails,

    addServiceToJob,

    updateForwardingStatus,

    updateBLStatus,

    stats,

    today,
  };

  return (
    <ERPContext.Provider
      value={value}
    >
      {children}
    </ERPContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export const useERP = () =>
  useContext(ERPContext);