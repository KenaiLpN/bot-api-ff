import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UserService } from "../services/UserService";
import {
  createUserBodySchema,
  userResponseSchema,
  listUsersResponseSchema,
  CreateUserBody,
  listUsersQuerySchema,
  ListUsersQuery,
  loginBodySchema, 
  LoginBody
} from "../schemas/userSchema";
import { z } from "zod";
import { FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userService = new UserService();

export async function userRoutes(app: FastifyInstance) {


// ROTA DE LOGIN
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      schema: {
        tags: ["Autenticação"],
        summary: "Autentica o usuário e retorna um Token JWT",
        body: loginBodySchema, 
        response: {
          200: z.object({
            token: z.string(),
            user: z.object({
              nome: z.string(),
              email: z.string(),
            })
          }),
          401: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { email, senha } = request.body as LoginBody;

      console.log("--- DEBUG LOGIN ---");
  console.log("1. Email recebido:", email);
  console.log("2. Senha recebida (texto puro):", senha);

      try {
      
        const user = await userService.getUserByEmail(email);

        if (!user) {
          console.log("ERRO: Usuário não encontrado no banco.");
          return reply.status(401).send({ message: "E-mail ou senha inválidos." });
        }

        console.log("3. Hash vindo do Banco:", user.senha_hash);
    console.log("   Tamanho do Hash:", user.senha_hash?.length); // <--- O PULO DO GATO
       
        if (!user.senha_hash) {
            return reply.status(401).send({ message: "Usuário sem senha definida." });
        }
        
        const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);
        console.log("4. Resultado do bcrypt.compare:", isPasswordValid);

        if (!isPasswordValid) {
          return reply.status(401).send({ message: "E-mail ou senha inválidos." });
        }

       
        const token = jwt.sign(
          { id: user.id_usuario, nome: user.nome },
          "SEGREDO_SUPER_SECRETO", 
          { expiresIn: "1d" } 
        );

     
        return reply.status(200).send({
          token,
          user: {
            nome: user.nome,
            email: user.email
          }
        });

      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno no login." });
      }
    }
  );


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
      const { nome, email, cpf, endereco,  estado, cidade, bairro, cep, telefone, senha_hash } = request.body as CreateUserBody;

      try {
        const newUser = await userService.createUser({ nome, email, cpf, endereco,  estado, cidade, bairro, cep, telefone, senha_hash });

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
        querystring: listUsersQuerySchema,
        response: {
          200: listUsersResponseSchema, 
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
       
        if (error instanceof Error) {
           console.error(error.message);
           return reply.status(500).send({ message: "Erro interno." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    }
  );
  
}
