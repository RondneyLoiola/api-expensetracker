import type { FastifyInstance } from "fastify";
import {
	createExpense,
	deleteAllMyExpenses,
	deleteExpense,
	getExpenseSummary,
	getExpenses,
	getMyExpenses,
	updateExpense,
} from "../app/controllers/expense";
import { authMiddleware } from "../app/middleware/auth";

export async function expenseRoutes(fastify: FastifyInstance) {
	fastify.addHook("preHandler", authMiddleware);

	fastify.post("/expenses", createExpense);
	fastify.get("/expenses/me", getMyExpenses);
	fastify.get("/expenses/summary/me", getExpenseSummary);
	fastify.get("/expenses", getExpenses);
	fastify.put("/expenses/:expenseId", updateExpense);
	fastify.delete("/expenses/:expenseId", deleteExpense);
	fastify.delete("/expenses/me/all", deleteAllMyExpenses);
}
