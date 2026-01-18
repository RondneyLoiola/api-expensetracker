import mongoose from "mongoose";
import { env } from "./env";

const DATA_BASE = env.MONGO_URL;

export const connectDB = async () => {
	console.log("Trying to connect to database...");

	try {
		mongoose.connect(DATA_BASE);
		console.log("✅ Database connected");
	} catch (error) {
		console.error(error, "❌ Database connection failed");
	}
};
