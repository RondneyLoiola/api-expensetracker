import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";
import routes from "./routes";

const app: FastifyInstance = fastify({
	logger: false,
});

app.register(cors, {
	origin: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});

app.register(routes);

export default app;
