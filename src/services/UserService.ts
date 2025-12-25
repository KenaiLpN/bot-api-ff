import { query } from "./db";
import { CreateUserBody } from "../schemas/userSchema";
import bcrypt from "bcryptjs";

export interface User {
  id_usuario: number;
  nome: string;
  email: string;
  cpf: string;
  chk_ativo: boolean;
  endereco?: string | null;
  estado?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  cep?: string | null;
  telefone?: string | null;
  senha_hash?: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  async getUserByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM "usuario" WHERE email = $1`;
    try {
      const result = await query(sql, [email]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      throw new Error("Falha na autenticação.");
    }
  }

  async createUser(data: CreateUserBody): Promise<User> {

    const {
      nome,
      email,
      cpf,
      endereco,
      estado,
      cidade,
      bairro,
      cep,
      telefone,
      senha_hash,
    } = data;

    if (!senha_hash) {
      throw new Error("Senha é obrigatória para criar um usuário.");
    }

        const passwordHash = await bcrypt.hash(senha_hash, 10);


    const sql = `
      INSERT INTO "usuario" (
        nome, email, cpf, endereco, estado, 
        cidade, bairro, cep, telefone, passwordHash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const params = [
      nome,
      email,
      cpf,
      endereco,
      estado,
      cidade,
      bairro,
      cep,
      telefone,
      passwordHash,
    ];

    try {
      const result = await query(sql, params);

      const createdUser: User = {
        id_usuario: Number(result.rows[0].id_usuario),
        nome: result.rows[0].nome,
        email: result.rows[0].email,
        cpf: result.rows[0].cpf,
        chk_ativo: result.rows[0].chk_ativo,
        endereco: result.rows[0].endereco,
        estado: result.rows[0].estado,
        cidade: result.rows[0].cidade,
        bairro: result.rows[0].bairro,
        cep: result.rows[0].cep,
        telefone: result.rows[0].telefone,
      };

      return createdUser;
    } catch (error) {
      console.error("Erro ao inserir usuário no DB:", error);

      throw new Error("Falha ao salvar usuário no banco de dados.");
    }
  }

  async getAllUsers(
    page: number,
    limit: number
  ): Promise<PaginatedResult<User>> {
    const offset = (page - 1) * limit;

    const sqlData = `
      SELECT id_usuario, nome, email, cpf, chk_ativo 
      FROM usuario
      ORDER by id_usuario
      LIMIT $1 OFFSET $2;
    `;

    const sqlCount = `SELECT COUNT(*) as total FROM usuario;`;

    try {
      
      const resultData = await query(sqlData, [limit, offset]);
      const resultCount = await query(sqlCount);

      const total = Number(resultCount.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: resultData.rows,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Erro ao buscar usuários no DB:", error);
      throw new Error("Falha ao buscar usuários no banco de dados.");
    }
  }
}

// async getUserById(id_usuario: number): Promise<User[]> {
//   const sql = `
//     SELECT *
//     FROM "usuario"
//     WHERE id_usuario = $1;
//   `;
//   const params = [id_usuario];

// try {
//     const result = await query(sql, params);
//     if (result.rows.length === 0) {
//       return null; // Usuário não encontrado
//     } else {
//       return result.rows[0];
//     } catch (error) {
//     console.error("Erro ao buscar usuário no DB:", error);
//     throw new Error("Falha ao buscar usuário no banco de dados.");
//   }
// }
// } }
