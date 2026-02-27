import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';

const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta';

// LISTAR USUÁRIOS (teste/admin)
export const listarUsuarios = async (req: Request, res: Response) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT id, nome, email, perfil, ativo, data_criacao
       FROM usuarios`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return res.status(500).json({
      erro: 'Erro ao listar usuários'
    });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        console.error('Erro ao fechar conexão:', e);
      }
    }
  }
};

// CRIAR USUÁRIO
export const criarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({
      erro: 'Todos os campos são obrigatórios.'
    });
  }

  let conn;

  try {
    const emailNormalizado = email.trim().toLowerCase();
    conn = await getConnection();

    // Verifica se já existe email
    const check = await conn.execute(
      `SELECT id FROM usuarios WHERE LOWER(email) = LOWER(:email)`,
      [emailNormalizado],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (check.rows && check.rows.length > 0) {
      return res.status(409).json({
        erro: 'Email já cadastrado.'
      });
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await conn.execute(
      `INSERT INTO usuarios (nome, email, senha, perfil)
       VALUES (:nome, :email, :senha, :perfil)
       RETURNING id INTO :id`,
      {
        nome,
        email: emailNormalizado,
        senha: senhaHash,
        perfil,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    // 🔹 Ajuste seguro para o TypeScript: tipando outBinds
    const outBinds = result.outBinds as { id: number[] } | undefined;
    const novoId = outBinds?.id[0];

    return res.status(201).json({
      id: novoId,
      nome,
      email: emailNormalizado,
      perfil,
      ativo: 'S'
    });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return res.status(500).json({
      erro: 'Erro ao criar usuário'
    });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        console.error('Erro ao fechar conexão:', e);
      }
    }
  }
};

// LOGIN
export const loginUsuario = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Email e senha são obrigatórios.'
    });
  }

  let conn;

  try {
    const emailNormalizado = email.trim().toLowerCase();

    conn = await getConnection();

    const result = await conn.execute(
      `SELECT id, nome, email, senha, perfil, ativo
       FROM usuarios
       WHERE LOWER(email) = LOWER(:email)`,
      [emailNormalizado],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos.'
      });
    }

    const usuario = result.rows[0] as any;

    if (usuario.ATIVO !== 'S') {
      return res.status(401).json({
        erro: 'Email ou senha inválidos.'
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.SENHA);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos.'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.ID,
        perfil: usuario.PERFIL,
        nome: usuario.NOME
      },
      JWT_SECRET,
      {
        expiresIn: '2h',
        issuer: 'controle-estoque-api',
        audience: 'controle-estoque-app'
      }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.ID,
        nome: usuario.NOME,
        email: usuario.EMAIL,
        perfil: usuario.PERFIL
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({
      erro: 'Erro interno ao fazer login.'
    });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        console.error('Erro ao fechar conexão:', e);
      }
    }
  }
};