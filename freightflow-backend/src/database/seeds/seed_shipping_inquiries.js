/**
 * @file seed_shipping_inquiries.js
 * @description Seed script to insert 4 realistic sample Shipping Inquiry records into database.
 */
const db = require("../index");
const sequelize = require("../../config/database");

const SAMPLE_INQUIRIES = [
  {
    inquiry_no: "ESI/SS/09-26/001",
    exporter_name: "Apex Global Logistics Ltd",
    pol: "Mundra Port (INMUN)",
    pod: "Dubai / Jebel Ali (AEJEA)",
    fpod: "Jebel Ali Free Zone (JAFZA)",
    shipment_type: "Ocean Freight (FCL/LCL)",
    shipment_sub_type: "Clearing & Forwarding",
    shipment_terms: "FOB",
    cargo_ready_date: "2026-09-20",
    stuffing_location: "Factory",
    factory_name: "Apex Morbi Plant #1",
    factory_address: "Plot 45-B, GIDC Phase II, Morbi, Gujarat 363642",
    factory_contact_person: "Rajesh Mehta (+91 98765 43210)",
    shipping_line_preference: "Maersk Line",
    free_days_required: 14,
    inspections: "SGS Pre-shipment Inspection",
    certifications: "Certificate of Origin (COO)",
    fumigations: "ISPM-15 Wooden Pallet Fumigation",
    loading_unloading: "Factory Crane Loading required",
    palletization: "Euro Pallet Wooden Heat Treated",
    lashing_chocking: "Heavy Container Lashing Wire Belt",
    special_requirements: "Temperature monitoring log required for ceramics export.",
    priority: "High",
    status: "Pending",
    cargoDetails: [
      {
        commodity: "Polished Vitrified Tiles",
        hsn_code: "6907.21",
        cargo_type: "General",
        weight_value: "24500",
        weight_uom: "KG",
      }
    ],
    containerDetails: [
      { container_type: "20' Standard Dry (20GP)", no_of_containers: 2 }
    ]
  },
  {
    inquiry_no: "ESI/SS/09-26/002",
    exporter_name: "Gujarat Textiles Pvt Ltd",
    pol: "Nhava Sheva / JNPT (INNSA)",
    pod: "Rotterdam (NLRTM)",
    fpod: "Rotterdam Industrial Terminal",
    shipment_type: "Ocean Freight (FCL/LCL)",
    shipment_sub_type: "Forwarding",
    shipment_terms: "CIF",
    cargo_ready_date: "2026-09-25",
    stuffing_location: "Factory",
    factory_name: "Gujarat Textiles Spinning Mill #2",
    factory_address: "Survey No. 128, Sanand Industrial Area, Sanand, Gujarat",
    factory_contact_person: "Suresh Patel (+91 98250 99887)",
    shipping_line_preference: "MSC (Mediterranean Shipping Company)",
    free_days_required: 21,
    inspections: "Self Inspection Certificate",
    certifications: "GSP Form A Certificate",
    fumigations: "Standard Cargo Fumigation",
    loading_unloading: "Forklift loading",
    palletization: "Stretch Wrapped Plastic Pallets",
    lashing_chocking: "Standard Strapping",
    special_requirements: "Moisture absorbent silica bags in all 40' HC containers.",
    priority: "Medium",
    status: "Quoted",
    cargoDetails: [
      {
        commodity: "100% Combed Cotton Yarn",
        hsn_code: "5205.12",
        cargo_type: "General",
        weight_value: "18200",
        weight_uom: "KG",
      }
    ],
    containerDetails: [
      { container_type: "40' High Cube (40HC)", no_of_containers: 3 }
    ]
  },
  {
    inquiry_no: "ESI/SS/09-26/003",
    exporter_name: "Sunlight Exports & Trading",
    pol: "Hazira Port (INHZR)",
    pod: "Singapore (SGSIN)",
    fpod: "Singapore Jurong Island",
    shipment_type: "Ocean Freight (FCL/LCL)",
    shipment_sub_type: "Transport",
    shipment_terms: "CFR",
    cargo_ready_date: "2026-09-18",
    stuffing_location: "CFS",
    factory_name: "",
    factory_address: "",
    factory_contact_person: "",
    shipping_line_preference: "Hapag-Lloyd",
    free_days_required: 7,
    inspections: "Hazmat Class 3 Certification",
    certifications: "MSDS & IMO Dangerous Goods Declaration",
    fumigations: "N/A",
    loading_unloading: "Hazardous Chemical Handling Crane",
    palletization: "UN Certified Drums on Plastic Pallets",
    lashing_chocking: "Steel Chain Lashing",
    special_requirements: "Dangerous Goods Class 3 Flammable Liquid. IMO declaration required.",
    priority: "High",
    status: "Confirmed",
    cargoDetails: [
      {
        commodity: "Industrial Organic Chemicals",
        hsn_code: "2902.20",
        cargo_type: "Hazardous",
        weight_value: "21000",
        weight_uom: "KG",
      }
    ],
    containerDetails: [
      { container_type: "20' Standard Dry (20GP)", no_of_containers: 1 }
    ]
  },
  {
    inquiry_no: "ESI/SS/09-26/004",
    exporter_name: "Orient Shipping & Freight Corp",
    pol: "Mundra Port (INMUN)",
    pod: "Hamburg (DEHAM)",
    fpod: "Berlin Dry Port",
    shipment_type: "Ocean Freight (FCL/LCL)",
    shipment_sub_type: "Clearing",
    shipment_terms: "EXW",
    cargo_ready_date: "2026-10-01",
    stuffing_location: "Factory",
    factory_name: "Orient Central ICD Warehouse",
    factory_address: "Pipeline Road, Hazira, Surat, Gujarat 394270",
    factory_contact_person: "Amit Shah (+91 99090 11223)",
    shipping_line_preference: "CMA CGM",
    free_days_required: 14,
    inspections: "Phytosanitary Certificate",
    certifications: "Organic Export Certificate",
    fumigations: "Methyl Bromide Fumigation",
    loading_unloading: "Reefer Loading Dock",
    palletization: "Plastic Heat Sealed Pallets",
    lashing_chocking: "Thermal Blanket Shielding",
    special_requirements: "Maintain continuous -18°C temperature control for frozen food cargo.",
    priority: "Medium",
    status: "In Progress",
    cargoDetails: [
      {
        commodity: "Frozen Seafood & Shrimp",
        hsn_code: "0306.17",
        cargo_type: "Reefer",
        weight_value: "22800",
        weight_uom: "KG",
      }
    ],
    containerDetails: [
      { container_type: "40' Reefer Container", no_of_containers: 2 }
    ]
  }
];

const seedInquiries = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connection established for seeding...");

    // Sync database tables if not created
    await db.sequelize.sync({ alter: true });
    console.log("Database models synchronized.");

    // Fetch all companies & default user
    const companies = await db.Company.findAll();
    const user = await db.Users.findOne();
    const userId = user ? user.id : null;

    for (const comp of companies) {
      const companyId = comp.id;
      let index = 1;

      for (const data of SAMPLE_INQUIRIES) {
        // Find matching customer by exporter_name
        const customer = await db.Customer.findOne({ where: { customer_name: data.exporter_name } });
        const exporterId = customer ? customer.id : null;

        // Custom inquiry no per company to avoid unique constraint collision
        const inquiryNo = `ESI/${comp.company_name.slice(0, 3).toUpperCase()}/09-26/00${index}`;
        index++;

        const payload = {
          ...data,
          inquiry_no: inquiryNo,
          company_id: companyId,
          exporter_id: exporterId,
          created_by: userId,
          updated_by: userId,
        };

        let inquiry = await db.ShippingInquiry.findOne({ where: { inquiry_no: inquiryNo, company_id: companyId } });
        if (!inquiry) {
          inquiry = await db.ShippingInquiry.create(payload);
          if (data.cargoDetails) {
            const cargos = data.cargoDetails.map(c => ({ ...c, inquiry_id: inquiry.id }));
            await db.ShippingInquiryCargo.bulkCreate(cargos);
          }
          if (data.containerDetails) {
            const containers = data.containerDetails.map(c => ({ ...c, inquiry_id: inquiry.id }));
            await db.ShippingInquiryContainer.bulkCreate(containers);
          }
          console.log(`Seeded Shipping Inquiry: ${inquiryNo} for Company: ${comp.company_name}`);
        } else {
          await inquiry.update(payload);
          console.log(`Updated Shipping Inquiry for Company: ${comp.company_name} (${inquiryNo})`);
        }
      }
    }
    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  seedInquiries();
}

module.exports = seedInquiries;
