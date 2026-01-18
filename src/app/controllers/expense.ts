/** biome-ignore-all lint/correctness/useParseIntRadix: parseInt */
/** biome-ignore-all lint/suspicious/noExplicitAny: type: any */
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { CreateExpenseBody } from "../../types/types";
import { validatorError } from "../../utils/validatorError";
import { Category } from "../schemas/categorySchema";
import { Expense } from "../schemas/expensesSchema";
import { User } from "../schemas/userSchema";

export const createExpense = async (
	req: FastifyRequest<{ Body: CreateExpenseBody }>,
	reply: FastifyReply,
) => {
	try {
		if (!req.user) {
			return reply.status(401).send({ message: "Unauthorized" });
		}

		const schema = z.object({
			name: z.string().min(1, "Expense name is required"),
			amount: z.number().min(0.01, "Amount must be greater than 0"),
			category: z
				.string()
				.regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format"),
			date: z.string().datetime().optional(), // Data opcional
		});

		const validatedSchema = schema.safeParse(req.body);

		if (!validatedSchema.success) {
			const error = validatorError(validatedSchema.error.issues);
			return reply.status(400).send({ message: error });
		}

		const categoryExists = await Category.findById(
			validatedSchema.data.category,
		);

		if (!categoryExists) {
			return reply.status(404).send({ message: "Category not found" });
		}

		const expense = await Expense.create({
			name: validatedSchema.data.name,
			amount: validatedSchema.data.amount,
			category: validatedSchema.data.category,
			user: req.user.userId,
			date: validatedSchema.data.date || new Date(),
		});

		const newExpense = await Expense.findById(expense._id).populate("category");

		return reply.status(201).send({ expense: newExpense });
	} catch (error) {
		console.error("Error creating expense:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const getExpenses = async (
	_req: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		const expenses = await Expense.find()
			.populate("category")
			.populate("user", "name email")
			.sort({ date: -1 });

		const total = await Expense.aggregate([
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
					totalExpenses: { $sum: 1 },
				},
			},
		]);

		return reply.status(200).send({
			expenses,
			summary: total[0] || { totalAmount: 0, totalExpenses: 0 },
		});
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const getUserExpenses = async (
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply,
) => {
	try {
		const { userId } = req.params;

		if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
			return reply.status(400).send({ message: "Invalid user ID format" });
		}

		const userExists = await User.findById(userId);

		if (!userExists) {
			return reply.status(404).send({ message: "User not found" });
		}

		const expenses = await Expense.find({ user: userId })
			.populate("category")
			.sort({ date: -1 });

		const totalAmount = expenses.reduce(
			(sum, expense) => sum + expense.amount,
			0,
		);

		return reply.status(200).send({
			expenses,
			summary: {
				totalExpenses: expenses.length,
				totalAmount: totalAmount,
			},
		});
	} catch (error) {
		console.error("Error fetching user expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const getMyExpenses = async (
	req: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		if (!req.user) {
			return reply.status(401).send({ message: "Unauthorized" });
		}

		// Pegar o mês e ano da query string (opcional)
		const { month, year } = req.query as { month?: string; year?: string };

		// Criar filtro base
		const filter: any = { user: req.user.userId };

		// Se mês e ano foram fornecidos, adicionar filtro de data
		if (month && year) {
			const monthNumber = parseInt(month);
			const yearNumber = parseInt(year);

			// Primeiro dia do mês
			const startDate = new Date(yearNumber, monthNumber - 1, 1);

			// Primeiro dia do próximo mês
			const endDate = new Date(yearNumber, monthNumber, 1);

			filter.date = {
				$gte: startDate,
				$lt: endDate,
			};
		}

		// Buscar despesas com o filtro
		const expenses = await Expense.find(filter)
			.populate("category")
			.sort({ date: -1 });

		// Calcular totais do período filtrado
		const totalAmount = expenses.reduce(
			(sum, expense) => sum + expense.amount,
			0,
		);

		// Buscar o total geral de despesas do usuário (sem filtro)
		const totalUserExpenses = await Expense.countDocuments({
			user: req.user.userId,
		});

		return reply.status(200).send({
			expenses,
			summary: {
				totalExpenses: expenses.length, // Total do período filtrado
				totalAmount: totalAmount, // Total em dinheiro do período
				totalUserExpenses: totalUserExpenses, // Total geral de despesas do usuário
				// Informações sobre o filtro aplicado
				filter:
					month && year
						? {
								month: parseInt(month),
								year: parseInt(year),
							}
						: null,
			},
		});
	} catch (error) {
		console.error("Error fetching my expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const updateExpense = async (
	req: FastifyRequest<{
		Params: { expenseId: string };
		Body: Partial<CreateExpenseBody>;
	}>,
	reply: FastifyReply,
) => {
	try {
		if (!req.user) {
			return reply.status(401).send({ message: "Unauthorized" });
		}

		const { expenseId } = req.params;

		if (!/^[0-9a-fA-F]{24}$/.test(expenseId)) {
			return reply.status(400).send({ message: "Invalid expense ID format" });
		}

		const expense = await Expense.findById(expenseId);

		if (!expense) {
			return reply.status(404).send({ message: "Expense not found" });
		}

		// Verificar se a despesa pertence ao usuário
		if (expense.user.toString() !== req.user.userId) {
			return reply
				.status(403)
				.send({ message: "You can only update your own expenses" });
		}

		const schema = z.object({
			name: z.string().min(1).optional(),
			amount: z.number().min(0.01).optional(),
			category: z
				.string()
				.regex(/^[0-9a-fA-F]{24}$/)
				.optional(),
			date: z.string().datetime().optional(),
		});

		const validatedSchema = schema.safeParse(req.body);

		if (!validatedSchema.success) {
			const error = validatorError(validatedSchema.error.issues);
			return reply.status(400).send({ message: error });
		}

		// Se está mudando a categoria, verificar se ela existe
		if (validatedSchema.data.category) {
			const categoryExists = await Category.findById(
				validatedSchema.data.category,
			);
			if (!categoryExists) {
				return reply.status(404).send({ message: "Category not found" });
			}
		}

		const updatedExpense = await Expense.findByIdAndUpdate(
			expenseId,
			validatedSchema.data,
			{ new: true },
		).populate("category");

		return reply.status(200).send({ expense: updatedExpense });
	} catch (error) {
		console.error("Error updating expense:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const deleteExpense = async (
	req: FastifyRequest<{ Params: { expenseId: string } }>,
	reply: FastifyReply,
) => {
	try {
		if (!req.user) {
			return reply.status(401).send({ message: "Unauthorized" });
		}

		const { expenseId } = req.params;

		if (!/^[0-9a-fA-F]{24}$/.test(expenseId)) {
			return reply.status(400).send({ message: "Invalid expense ID format" });
		}

		const expense = await Expense.findById(expenseId);

		if (!expense) {
			return reply.status(404).send({ message: "Expense not found" });
		}

		// Verificar se a despesa pertence ao usuário
		if (expense.user.toString() !== req.user.userId) {
			return reply
				.status(403)
				.send({ message: "You can only delete your own expenses" });
		}

		await Expense.findByIdAndDelete(expenseId);

		return reply.status(200).send({ message: "Expense deleted successfully" });
	} catch (error) {
		console.error("Error deleting expense:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const deleteAllMyExpenses = async (
	req: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		if (!req.user) {
			return reply.status(401).send({ message: "Unauthorized" });
		}

		// Buscar todas as despesas do usuário antes de deletar
		const userExpenses = await Expense.find({ user: req.user.userId });

		// Se não houver despesas, retornar mensagem informativa
		if (userExpenses.length === 0) {
			return reply.status(200).send({ 
				message: "No expenses to delete",
				deletedCount: 0 
			});
		}

		// Deletar todas as despesas do usuário
		const result = await Expense.deleteMany({ user: req.user.userId });

		return reply.status(200).send({ 
			message: "All expenses deleted successfully",
			deletedCount: result.deletedCount 
		});
	} catch (error) {
		console.error("Error deleting all expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};
