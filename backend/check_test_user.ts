import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "./src/models/userModel";

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const email = "stymvvip@gmail.com";
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log(`FOUND: User with email ${email} exists.`);
      console.log(`CustomId: ${user.customId}`);
    } else {
      console.log(`NOT FOUND: User with email ${email} does not exist.`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error checking user:", error);
    process.exit(1);
  }
};

checkUser();
