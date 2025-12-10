import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UserService } from "../services/UserService";
import {
  createUserBodySchema,
  userResponseSchema,
  listUsersResponseSchema,
  CreateUserBody,
} from "../schemas/userSchema";
import { z } from "zod";
import { FastifyReply } from "fastify";

const userService = new UserService();

export async function userRoutes(app: FastifyInstance) {


  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Cria um novo usuário (cliente) no sistema",
        body: createUserBodySchema,
        response: {
          201: userResponseSchema,
          409: z.object({ message: z.string() }),
        },
      },
    },

    async (request, reply: FastifyReply) => {
      const { nome, email } = request.body as CreateUserBody;

      try {
        const newUser = await userService.createUser({ nome, email });

        return reply.status(201).send(newUser);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({
            message: "Erro interno ao processar a requisição.",
          });
        }
        return reply.status(500).send({
          message: "Um erro desconhecido ocorreu.",
        });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Lista todos os usuários (clientes) cadastrados no sistema",
        response: {
          200: listUsersResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      try {
        const users = await userService.getAllUsers();
        return reply.status(200).send(users);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({
            message: "Erro interno ao processar a requisição.",
          });
        }
        return reply.status(500).send({
          message: "Um erro desconhecido ocorreu.",
        });
      }
    }
  );
  
}
