import { z } from "zod";


export const loginBodySchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const createUserBodySchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  cpf: z.string(),
  endereco: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  senha_hash: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),

});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const userResponseSchema = z.object({
  id_usuario: z.number().int().positive(),
  nome: z.string(),
  email: z.string(),
  cpf: z.string(),
  chk_ativo: z.boolean(),
});


export const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;


export const listUsersResponseSchema = z.object({
  data: z.array(userResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});