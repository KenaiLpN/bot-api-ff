import { query } from "./db";
import { CreateUserBody } from "../schemas/userSchema";

export interface User {
  id_usuario: number;
  nome: string;
  email: string;
  cpf: string;
  chk_ativo: boolean;
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


async createUser(data: CreateUserBody): Promise<User> {
    const { nome, email, cpf } = data;

    const sql = `
      INSERT INTO "usuario" (nome, email, cpf)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const params = [nome, email, cpf];

    try {
      const result = await query(sql, params);

      const createdUser: User = {
        id_usuario: Number(result.rows[0].id_usuario),
        nome: result.rows[0].nome,
        email: result.rows[0].email,
        cpf: result.rows[0].cpf,
        chk_ativo: result.rows[0].chk_ativo,
      };

      return createdUser;
    } catch (error) {
      console.error("Erro ao inserir usuário no DB:", error);

      throw new Error("Falha ao salvar usuário no banco de dados.");
    }
  }
  



async getAllUsers(page: number, limit: number): Promise<PaginatedResult<User>> {
  const offset = (page - 1) * limit;


  const sqlData = `
      SELECT id_usuario, nome, email, cpf, chk_ativo 
      FROM usuario
      ORDER by id_usuario
      LIMIT $1 OFFSET $2;
    `;

    const sqlCount = `SELECT COUNT(*) as total FROM usuario;`;


  try {
      // Executa as duas queries
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
          totalPages
        }
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
