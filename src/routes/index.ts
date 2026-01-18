import type { FastifyInstance } from "fastify";
import { categoryRoutes } from "./category.routes";
import { expenseRoutes } from "./expense.routes";
import { sessionRoutes } from "./session.routes";
import { userRoutes } from "./user.routes";

async function routes(fastify: FastifyInstance) {
	fastify.get("/", () => {
		return "Hello World";
	});

	fastify.register(userRoutes);
	fastify.register(categoryRoutes);
	fastify.register(expenseRoutes);
	fastify.register(sessionRoutes);
}

export default routes;
