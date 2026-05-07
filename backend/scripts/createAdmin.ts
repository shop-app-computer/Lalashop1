// One-shot script to provision the first super admin.
//
// Usage (from backend/):
//   npx ts-node scripts/createAdmin.ts <email> <password> [name]
//
// If no args are given, defaults to lalashop@gmail.com / passworde99 — the
// initial owner credential set up during platform bootstrap.

import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import User from "../src/models/userModel";

const DEFAULT_EMAIL = "lalashop@gmail.com";
const DEFAULT_PASSWORD = "passworde99";
const DEFAULT_NAME = "Lalashop Admin";

const main = async () => {
  const [, , argEmail, argPassword, argName] = process.argv;
  const email = (argEmail || DEFAULT_EMAIL).toLowerCase();
  const password = argPassword || DEFAULT_PASSWORD;
  const name = argName || DEFAULT_NAME;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in backend/.env");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB…`);
  await mongoose.connect(uri);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.isAdmin = true;
    existing.adminRole = "super";
    if (name) existing.name = existing.name || name;
    existing.password = password; // pre-save hook hashes this
    await existing.save();
    console.log(`✓ Promoted existing user to super admin: ${email}`);
  } else {
    const user = new User({
      email,
      name,
      password, // pre-save hook hashes this
      isAdmin: true,
      adminRole: "super",
    });
    await user.save();
    console.log(`✓ Created new super admin: ${email}`);
  }

  console.log(`
  Login at http://localhost:3001/login
    Email:    ${email}
    Password: ${password}
    Role:     super
`);

  await mongoose.disconnect();
  process.exit(0);
};

main().catch(async (err) => {
  console.error("Failed to create admin:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
