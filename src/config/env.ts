import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.string().transform(Number).default(3000),
	MONGO_URL: z.string().min(5, "DATABASE_URL é obrigatória"),
	JWT_SECRET: z.string().min(6, "JWT_SECRET é obrigatória")
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error(_env.error);
	process.exit(1);
}

export const env = _env.data;
