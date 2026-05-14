// -- Category -- //
export interface CreateCategoryBody {
    name: string;
    color: string;
}

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    percentage: number;
}

// -- Expense -- //
export interface CreateExpenseBody {
    name: string;
    amount: number;
    category: string;
}

export interface ExpenseFilter {
    user: string,
    date?: {
        $gte: Date,
        $lte: Date,
    },
    categoryId?: string
}

export interface ExpenseSummary {
    totalAmount: number;
    totalExpenses: number;
    expensesByCategory: CategorySummary[];
}

// -- User -- //
export interface CreateUserBody {
    name: string;
    email: string;
    password: string;
}

// -- Session -- //
export interface CreateSessionBody {
    email: string;
    password: string;
}

// -- Google -- //
export interface CreateGoogleSessionBody {
    email: string;
    name: string;
    photoURL?: string;
    uid: string;
}