import type { FastifyInstance } from "fastify";
import { createGoogleSession, createSession } from "../app/controllers/session";

export async function sessionRoutes(fastify: FastifyInstance) {
	fastify.post("/session", createSession);
	fastify.post("/session/google", createGoogleSession);
}
