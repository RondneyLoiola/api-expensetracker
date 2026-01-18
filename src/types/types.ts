export interface CreateCategoryBody {
    name: string;
    color: string;
}

export interface CreateExpenseBody {
    name: string;
    amount: number;
    category: string;
}

export interface CreateUserBody {
    name: string;
    email: string;
    password: string;
}

export interface CreateSessionBody {
    email: string;
    password: string;
}

export interface CreateGoogleSessionBody {
    email: string;
    name: string;
    photoURL?: string;
    uid: string;
}