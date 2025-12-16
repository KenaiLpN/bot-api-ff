import { z } from "zod";

// ... (mantenha o createUserBodySchema e CreateUserBody como estão) ...

export const createUserBodySchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  cpf: z.string()
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const userResponseSchema = z.object({
  id_usuario: z.number().int().positive(),
  nome: z.string(),
  email: z.string(),
  cpf: z.string(),
  chk_ativo: z.boolean(),
});

// NOVO: Schema para os parâmetros de busca (Query String)
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// ATUALIZADO: Resposta agora contém os dados E o total de registros
export const listUsersResponseSchema = z.object({
  data: z.array(userResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});