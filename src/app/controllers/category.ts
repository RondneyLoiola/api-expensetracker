import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { CreateCategoryBody } from "../../types/types";
import { validatorError } from "../../utils/validatorError";
import { Category } from "../schemas/categorySchema";

export const createCategory = async (
	req: FastifyRequest<{ Body: CreateCategoryBody }>,
	reply: FastifyReply,
): Promise<void> => {
	const schema = z.object({
		name: z.string().min(1, "Category name is required"),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
	});

	const validatedSchema = schema.safeParse(req.body);

	if (!validatedSchema.success) {
		const error = validatorError(validatedSchema.error.issues);

		return reply.code(400).send({ message: error });
	}

	const categoryExists = await Category.findOne({
		name: validatedSchema.data.name,
	});

	if (categoryExists) {
		return reply.code(400).send({ message: "Category already exists" });
	}

	const category = await Category.create({
		name: validatedSchema.data.name,
		color: validatedSchema.data.color,
	});

	reply.code(201).send({ category: category });
};

export const getCategories = async (
	_req: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		const categories = await Category.find();

		return reply.status(200).send(categories);
	} catch (error) {
		console.log(error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};
