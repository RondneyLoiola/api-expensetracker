import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		date: {
			type: Date,
			default: Date.now,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		}
	},
	{
		timestamps: true,
	},
);

export const Expense = mongoose.model("Expense", expenseSchema);
