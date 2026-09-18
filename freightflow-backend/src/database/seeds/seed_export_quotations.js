/**
 * @file seed_export_quotations.js
 * @description Seed script to insert sample Export Quotation records with charges into the database.
 */
const db = require("../index");

const SAMPLE_QUOTATIONS = [
  {
    quotation_no: "EQUOT/SS/09-26/001",
    exporter_name: "Apex Global Logistics Ltd",
    pol: "Mundra Port (INMUN)",
    pod: "Dubai / Jebel Ali (AEJEA)",
    fpod: "Jebel Ali Free Zone (JAFZA)",
    commodity: "Polished Vitrified Tiles",
    hsn_code: "6907.21",
    cargo_type: "General",
    gross_weight: "24,500 KG",
    container_type: "20' Standard Dry (20GP)",
    no_of_containers: 2,
    shipment_terms: "FOB",
    cargo_ready_date: "2026-09-20",
    stuffing_location: "Factory",
    factory_name: "Apex Morbi Plant #1",
    factory_address: "Plot 45-B, GIDC Phase II, Morbi, Gujarat 363642",
    factory_contact_person: "Rajesh Mehta (+91 98765 43210)",
    shipping_line_preference: "Maersk Line",
    free_days_required: 14,
    special_requirements: "Temperature monitoring log required for ceramics export.",
    customs_verification_status: "Checked & Verified",
    customs_commodity_checked: "Yes",
    customs_cargo_photos: "Available",
    customs_hsn_status: "Verified",
    customs_restrictions: "None",
    customs_notes: "HSN 6907.21 verified against Morbi export directory.",
    carrier_option_a: {
      line: "Maersk Line",
      freight: 1250,
      local: 350,
      notes: "Direct vessel, 7 days transit time."
    },
    carrier_option_b: {
      line: "MSC Shipping",
      freight: 1100,
      local: 400,
      notes: "1 transshipment at Colombo, 12 days transit."
    },
    carrier_option_c: {
      line: "CMA CGM",
      freight: 1180,
      local: 360,
      notes: "Direct weekly call, free 14 days detention."
    },
    selected_carrier: "Maersk Line",
    carrier_selection_notes: "Fastest transit time chosen per customer demand.",
    priority: "High",
    status: "Prepared",
    charges: [
      { charge_name: "Ocean Freight", basis: "Per Container", applicable: true, quantity: 2, rate: 1250.00, amount: 2500.00 },
      { charge_name: "THC Origin (Terminal Handling)", basis: "Per Container", applicable: true, quantity: 2, rate: 180.00, amount: 360.00 },
      { charge_name: "BL Documentation Fee", basis: "Per Shipment", applicable: true, quantity: 1, rate: 75.00, amount: 75.00 },
      { charge_name: "Customs Clearance Fee", basis: "Per Shipment", applicable: true, quantity: 1, rate: 150.00, amount: 150.00 },
      { charge_name: "Factory Transportation", basis: "Per Container", applicable: true, quantity: 2, rate: 300.00, amount: 600.00 },
    ]
  },
  {
    quotation_no: "EQUOT/SS/09-26/002",
    exporter_name: "Gujarat Textiles Pvt Ltd",
    pol: "Nhava Sheva / JNPT (INNSA)",
    pod: "Rotterdam (NLRTM)",
    fpod: "Rotterdam Industrial Terminal",
    commodity: "100% Combed Cotton Yarn",
    hsn_code: "5205.12",
    cargo_type: "General",
    gross_weight: "18,200 KG",
    container_type: "40' High Cube (40HC)",
    no_of_containers: 3,
    shipment_terms: "CIF",
    cargo_ready_date: "2026-09-25",
    stuffing_location: "Factory",
    factory_name: "Gujarat Textiles Spinning Mill #2",
    factory_address: "Survey No. 128, Sanand Industrial Area, Sanand, Gujarat",
    factory_contact_person: "Suresh Patel (+91 98250 99887)",
    shipping_line_preference: "MSC",
    free_days_required: 21,
    special_requirements: "Moisture absorbent silica bags in all 40' HC containers.",
    customs_verification_status: "Checked & Verified",
    customs_commodity_checked: "Yes",
    customs_cargo_photos: "Available",
    customs_hsn_status: "Verified",
    customs_restrictions: "None",
    customs_notes: "GSP Form A Certificate attached.",
    carrier_option_a: {
      line: "MSC",
      freight: 2200,
      local: 450,
      notes: "Direct service to Rotterdam, 22 days transit."
    },
    carrier_option_b: {
      line: "Hapag-Lloyd",
      freight: 2350,
      local: 420,
      notes: "Express liner service, 20 days transit."
    },
    carrier_option_c: {
      line: "COSCO",
      freight: 2050,
      local: 480,
      notes: "Indirect service via Felixstowe."
    },
    selected_carrier: "MSC",
    carrier_selection_notes: "Economical freight with good container inventory.",
    priority: "Medium",
    status: "Sent",
    charges: [
      { charge_name: "Ocean Freight", basis: "Per Container", applicable: true, quantity: 3, rate: 2200.00, amount: 6600.00 },
      { charge_name: "Origin THC", basis: "Per Container", applicable: true, quantity: 3, rate: 220.00, amount: 660.00 },
      { charge_name: "Marine Cargo Insurance", basis: "Per Shipment", applicable: true, quantity: 1, rate: 350.00, amount: 350.00 },
      { charge_name: "Customs Documentation & Filing", basis: "Per Shipment", applicable: true, quantity: 1, rate: 120.00, amount: 120.00 },
    ]
  }
];

const seedExportQuotations = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connection established for Export Quotation seeding...");

    // Sync database models
    await db.sequelize.sync({ alter: true });
    console.log("Database models synchronized.");

    const companies = await db.Company.findAll();
    const user = await db.Users.findOne();
    const userId = user ? user.id : null;

    for (const comp of companies) {
      const companyId = comp.id;
      let index = 1;

      for (const data of SAMPLE_QUOTATIONS) {
        const customer = await db.Customer.findOne({ where: { customer_name: data.exporter_name } });
        const exporterId = customer ? customer.id : null;

        const inquiry = await db.ShippingInquiry.findOne({ where: { exporter_name: data.exporter_name, company_id: companyId } });
        const inquiryId = inquiry ? inquiry.id : null;
        const inquiryNo = inquiry ? inquiry.inquiry_no : null;

        const quotationNo = `EQUOT/${comp.company_name.slice(0, 3).toUpperCase()}/09-26/00${index}`;
        index++;

        const totalAmount = data.charges.reduce((sum, c) => sum + (c.amount || 0), 0);

        const payload = {
          ...data,
          quotation_no: quotationNo,
          company_id: companyId,
          exporter_id: exporterId,
          inquiry_id: inquiryId,
          inquiry_no: inquiryNo || data.inquiry_no || null,
          total_amount: totalAmount,
          created_by: userId,
          updated_by: userId,
        };

        let quot = await db.ExportQuotation.findOne({ where: { quotation_no: quotationNo, company_id: companyId } });
        if (!quot) {
          quot = await db.ExportQuotation.create(payload);
          if (data.charges && data.charges.length > 0) {
            const charges = data.charges.map(c => ({ ...c, quotation_id: quot.id }));
            await db.ExportQuotationCharge.bulkCreate(charges);
          }
          console.log(`Seeded Export Quotation: ${quotationNo} for Company: ${comp.company_name}`);
        } else {
          await quot.update(payload);
          await db.ExportQuotationCharge.destroy({ where: { quotation_id: quot.id } });
          if (data.charges && data.charges.length > 0) {
            const charges = data.charges.map(c => ({ ...c, quotation_id: quot.id }));
            await db.ExportQuotationCharge.bulkCreate(charges);
          }
          console.log(`Updated Export Quotation: ${quotationNo} for Company: ${comp.company_name}`);
        }
      }
    }
    console.log("Export Quotation seeding completed successfully!");
  } catch (err) {
    console.error("Export Quotation seeding failed:", err.message);
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  seedExportQuotations();
}

module.exports = seedExportQuotations;
