import { z } from "zod";

export const createUserBodySchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const userResponseSchema = z.object({
  id_usuario: z.number().int().positive(),
  nome: z.string(),
  email: z.string(),
  cpf: z.string(),
  chk_ativo: z.boolean(),
});

export const listUsersResponseSchema = z.array(userResponseSchema);
