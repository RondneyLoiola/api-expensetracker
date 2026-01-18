import type { FastifyInstance } from "fastify";
import { createCategory, getCategories } from "../app/controllers/category";

export async function categoryRoutes(fastify: FastifyInstance) {
	fastify.get("/categories", getCategories);
	fastify.post("/categories", createCategory);
}
