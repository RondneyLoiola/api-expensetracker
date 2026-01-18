import type { FastifyReply, FastifyRequest } from "fastify";
import * as jwt from "jsonwebtoken";
import { User } from "../schemas/userSchema";

interface JwtPayload {
	userId: string;
	email: string;
}

declare module "fastify" {
	interface FastifyRequest {
		user?: {
			userId: string;
			email: string;
		};
	}
}

export const authMiddleware = async (
	req: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ message: "Token not provided" });
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			return reply.status(401).send({ message: "Token format invalid" });
		}

		const jwtSecret = process.env.JWT_SECRET;

		if (!jwtSecret) {
			console.error("JWT_SECRET is not defined");
			return reply.status(500).send({ message: "Internal server error" });
		}

		const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return reply.status(401).send({ message: "User not found" });
		}

		// adicionar informações do usuário na requisição
		req.user = {
			userId: decoded.userId,
			email: decoded.email,
		};

	} catch (error) {
		if(error instanceof jwt.JsonWebTokenError) {
			return reply.status(401).send({ message: "Invalid token" });
		}

		if(error instanceof jwt.TokenExpiredError) {
			return reply.status(401).send({ message: "Token expired" });
		}

		console.error("Error in auth middleware:", error);

		return reply.status(500).send({ message: "Internal server error" });
	}
};
