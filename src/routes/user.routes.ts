import type { FastifyInstance } from "fastify";
import {createUser, getUsers} from '../app/controllers/user';

export async function userRoutes(fastify: FastifyInstance) {
    fastify.post("/user", createUser)
    fastify.get("/users", getUsers)
}