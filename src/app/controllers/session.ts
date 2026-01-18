import * as bcrypt from "bcrypt";
import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type {
	CreateGoogleSessionBody,
	CreateSessionBody,
} from "../../types/types";
import { User } from "../schemas/userSchema";

const generateToken = (userId: string, email: string): string => {
	const jwtSecret = process.env.JWT_SECRET || "secret-key";

	return jwt.sign({ userId, email }, jwtSecret, {
		expiresIn: "7d",
	});
};

export const createSession = async (
	req: FastifyRequest<{ Body: CreateSessionBody }>,
	reply: FastifyReply,
) => {
	try {
		const schema = z.object({
			email: z.string().email("Invalid email format"),
			password: z.string().min(1, "Password is required"),
		});

		const emailOrPasswordIncorrect = () => {
			return reply.status(401).send({ error: "Email or password incorrect!" });
		};

		const validation = await schema.safeParseAsync(req.body);

		if (!validation.success) {
			return emailOrPasswordIncorrect();
		}

		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			return emailOrPasswordIncorrect();
		}

		// Verifica se o usuário tem senha (pode ser login apenas com Google)
		if (!user.password) {
			return reply.status(401).send({
				error: "This account uses Google login. Please sign in with Google.",
			});
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isPasswordCorrect) {
			return emailOrPasswordIncorrect();
		}

		const token = generateToken(user._id.toString(), user.email);

		return reply.status(200).send({
			id: user._id,
			name: user.name,
			token,
			user: {
				name: user.name,
				email: user.email,
				photoURL: user.photoURL,
			},
		});
	} catch (error) {
		console.error("Error creating session:", error);
		return reply.status(500).send({ message: "Internal server error" });
	}
};

// Nova função para login com Google
export const createGoogleSession = async (
	req: FastifyRequest<{ Body: CreateGoogleSessionBody }>,
	reply: FastifyReply,
) => {
	try {
		const schema = z.object({
			email: z.email("Invalid email format"),
			name: z.string().min(1, "Name is required"),
			photoURL: z.string().optional(),
			uid: z.string().min(1, "Google UID is required"),
		});

		const validation = await schema.safeParseAsync(req.body);

		if (!validation.success) {
			return reply.status(400).send({
				error: "Invalid data",
				details: validation.error.issues,
			});
		}

		const { email, name, photoURL, uid } = req.body;

		console.log("📸 Dados recebidos do Google:", {
			email,
			name,
			photoURL,
			uid,
		});

		// Verifica se o usuário já existe no banco de dados
		let user = await User.findOne({ email });

		// Se não existir, cria um novo usuário
		if (!user) {
			user = await User.create({
				email,
				name,
				photoURL: photoURL || "",
				googleUid: uid,
				// Usuários do Google não têm senha
			});
		} else {
			// Se o usuário já existe, atualiza os dados do Google
			let needsUpdate = false;

			if (!user.googleUid) {
				user.googleUid = uid;
				needsUpdate = true;
			}

			if (photoURL && user.photoURL !== photoURL) {
				user.photoURL = photoURL;
				needsUpdate = true;
			}

			if (needsUpdate) {
				await user.save();
			}
		}

		// Gera o token JWT
		const token = generateToken(user._id.toString(), user.email);

		// biome-ignore lint/suspicious/noExplicitAny: any
		const response: any = {
			id: user._id,
			name: user.name,
			token,
			user: {
				name: user.name,
				email: user.email,
			},
		};

		// Adiciona photoURL se o usuário tiver (caso tenha vinculado Google)
		if (user.photoURL) {
			response.user.photoURL = user.photoURL;
		}

		return reply.status(200).send(response);
	} catch (error) {
		console.error("Error creating Google session:", error);

		return reply.status(500).send({ message: "Internal server error" });
	}
};
