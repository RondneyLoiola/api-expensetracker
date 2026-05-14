/** biome-ignore-all lint/correctness/useParseIntRadix: parseInt */
/** biome-ignore-all lint/suspicious/noExplicitAny: type: any */
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type {
	CategorySummary,
	CreateExpenseBody,
	ExpenseFilter,
	ExpenseSummary,
} from "../../types/types";
import { validatorError } from "../../utils/validatorError";
import { Category } from "../schemas/categorySchema";
import { Expense } from "../schemas/expensesSchema";

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

		return reply.status(200).send({
			expenses,
		});
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const getMyExpenses = async (
	req: FastifyRequest<{ Querystring: { month: string; year: string } }>,
	reply: FastifyReply,
) => {
	try {
		if (!req.user) {
			return reply.status(401).send({ message: "Unauthorized" });
		}

		// Pegar o mês e ano da query string (opcional)
		const { month, year } = req.query as { month?: string; year?: string };

		// Criar filtro base
		const filter: ExpenseFilter = { user: req.user.userId };

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
				$lte: endDate,
			};
		}

		// Buscar despesas com o filtro
		const expenses = await Expense.find(filter)
			.populate("category")
			.sort({ date: -1 });

		return reply.status(200).send({
			expenses,
		});
	} catch (error) {
		console.error("Error fetching my expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

export const getExpenseSummary = async (
	req: FastifyRequest<{ Querystring: { month: string; year: string } }>,
	reply: FastifyReply,
): Promise<void> => {
	if (!req.user) {
		return reply.status(401).send({ message: "Unauthorized" });
	}

	const { month, year } = req.query;

	const filter: ExpenseFilter = { user: req.user.userId };

	if (month && year) {
		const monthNumber = parseInt(month);
		const yearNumber = parseInt(year);
		// Primeiro dia do mês
		const startDate = new Date(yearNumber, monthNumber - 1, 1);
		// Primeiro dia do próximo mês
		const endDate = new Date(yearNumber, monthNumber, 1);
		filter.date = {
			$gte: startDate,
			$lte: endDate,
		};
	} else {
		return reply.status(400).send({ message: "Month and year are required" });
	}

	try {
		const expenses = await Expense.find(filter).populate("category");

		let totalAmount = 0;
		let totalExpenses = 0;
		const groupedExpenses = new Map<string, CategorySummary>();

		for (const expense of expenses) {
			const populatedCategory = expense.category as unknown as {
				_id: { toString: () => string };
				name: string;
				color: string;
			};

			const categoryId = populatedCategory._id.toString();

			const existing = groupedExpenses.get(
				populatedCategory._id.toString(),
			) ?? {
				categoryId: populatedCategory._id.toString(),
				categoryName: populatedCategory.name,
				categoryColor: populatedCategory.color,
				amount: 0,
				percentage: 0,
			};

			existing.amount += expense.amount;
			totalAmount += expense.amount;
			totalExpenses++;

			groupedExpenses.set(categoryId, existing);
		}

		const summary: ExpenseSummary = {
			totalAmount,
			totalExpenses,
			expensesByCategory: Array.from(groupedExpenses.values())
				.map((expense) => ({
					...expense,
					percentage: Number.parseFloat(
						((expense.amount / totalAmount) * 100).toFixed(2),
					),
				}))
				.sort((a, b) => b.amount - a.amount),
		};

		return reply.status(200).send(summary);
	} catch (error) {
		console.log(error);
		return reply.status(500).send({ message: "Error fetching expenses" });
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
				deletedCount: 0,
			});
		}

		// Deletar todas as despesas do usuário
		const result = await Expense.deleteMany({ user: req.user.userId });

		return reply.status(200).send({
			message: "All expenses deleted successfully",
			deletedCount: result.deletedCount,
		});
	} catch (error) {
		console.error("Error deleting all expenses:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};
