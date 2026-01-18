import bcrypt from "bcrypt";
import type { FastifyReply, FastifyRequest } from "fastify";
import  jwt from "jsonwebtoken";
import { z } from "zod";
import type { CreateUserBody } from "../../types/types.js";
import { validatorError } from "../../utils/validatorError.js";
import { User } from "../schemas/userSchema.js";

const generateToken = (userId: string, email: string): string => {
	const jwtSecret = process.env.JWT_SECRET || "secret-key";

	return jwt.sign({ userId, email }, jwtSecret, {
		expiresIn: "7d",
	});
};

export const createUser = async (
	req: FastifyRequest<{ Body: CreateUserBody }>,
	reply: FastifyReply,
) => {
	try {
		const schema = z
			.object({
				name: z.string().min(1, "Name is required"),
				email: z.email("Invalid email format"),
				password: z.string().min(8, "Password must be at least 6 characters"),
				confirmPassword: z.string(),
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: "Passwords do not match",
				path: ["confirmPassword"],
			});

		const validatedSchema = schema.safeParse(req.body);

		if (!validatedSchema.success) {
			const error = validatorError(validatedSchema.error.issues);

			return reply.status(400).send({ message: error });
		}

		const existingUser = await User.findOne({
			email: validatedSchema.data.email,
		});

		if (existingUser) {
			return reply.status(400).send({ message: "User already exists" });
		}

		const password_hash = await bcrypt.hash(validatedSchema.data.password, 10);

		const user = await User.create({
			name: validatedSchema.data.name,
			email: validatedSchema.data.email,
			password: password_hash,
		});

		const token = generateToken(user._id.toString(), user.email);

		return reply.status(201).send({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			token,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const getUsers = async (_req: FastifyRequest, reply: FastifyReply) => {
	try {
		const users = await User.aggregate([
			{
				$lookup: {
					// $lookup -> busca informações de outra coleção
					from: "expenses",
					localField: "_id",
					foreignField: "user",
					as: "expenses",
				},
			},
			{
				$project: {
					// $project -> seleciona os campos que serão exibidos
					_id: 1,
					name: 1,
					email: 1,
					createdAt: 1,
					updatedAt: 1,
					expensesCount: { $size: "$expenses" },
				},
			},
			{
				$sort: { name: 1 },
			},
		]);

		return reply.status(200).send({ users });
	} catch (error) {
		console.error("Error fetching users:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};
