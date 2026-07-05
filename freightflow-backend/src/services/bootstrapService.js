/**
 * @file bootstrapService.js
 * @description Application startup logic to verify and create default configurations.
 */

const bcrypt = require("bcrypt");
const Users = require("../modules/Auth/Users/users.model");

const runBootstrap = async () => {
    try {
        // console.log("--------------------------------------------------");



        const adminEmail = "admin@freightflow.com";
        const adminPassword = "FreightFlow@7788$";

        const existingAdmin = await Users.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log("✓ Super Admin already exists.");
            // console.log("--------------------------------------------------");
            return;
        }

        console.log("⚠ Super Admin not found.");
        console.log("🔐 Creating Default Super Admin...");

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await Users.create({
            full_name: "Super Admin",
            email: adminEmail,
            password: hashedPassword,
            status: "Active",
            role: "SUPER_ADMIN"
        });

        console.log("✓ Super Admin created successfully.");
        console.log("Email:");
        console.log(adminEmail);
        console.log("Password:");
        console.log(adminPassword);
        console.log("--------------------------------------------------");
    } catch (error) {
        console.error("❌ Error during Bootstrap Initialization:");
        console.error(error);
        console.log("--------------------------------------------------");
    }
};

module.exports = {
    runBootstrap
};
