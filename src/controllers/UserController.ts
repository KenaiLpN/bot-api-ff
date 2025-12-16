import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UserService } from "../services/UserService";
import {
  createUserBodySchema,
  userResponseSchema,
  listUsersResponseSchema,
  CreateUserBody,
  listUsersQuerySchema,
  ListUsersQuery
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
      const { nome, email, cpf } = request.body as CreateUserBody;

      try {
        const newUser = await userService.createUser({ nome, email, cpf });

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
        summary: "Lista usuários com paginação",
        querystring: listUsersQuerySchema, // Adicione validação da Query String
        response: {
          200: listUsersResponseSchema, // Atualize para o novo formato de resposta
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit } = request.query as ListUsersQuery;

      try {
        const result = await userService.getAllUsers(page, limit);
        return reply.status(200).send(result);
      } catch (error) {
        // ... (mantenha o tratamento de erro igual)
        if (error instanceof Error) {
           console.error(error.message);
           return reply.status(500).send({ message: "Erro interno." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    }
  );
  
}
