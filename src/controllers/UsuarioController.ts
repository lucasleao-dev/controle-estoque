import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta';

export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT id, nome, email, perfil, ativo, data_criacao FROM usuarios`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar usuários', detalhes: err });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, perfil } = req.body;
  if (!nome || !email || !senha || !perfil)
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });

  try {
    const conn = await getConnection();
    const check = await conn.execute(
      `SELECT id FROM usuarios WHERE email = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (check.rows && check.rows.length > 0) {
      await conn.close();
      return res.status(409).json({ erro: 'Email já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await conn.execute(
      `INSERT INTO usuarios (nome, email, senha, perfil)
       VALUES (:nome, :email, :senha, :perfil) RETURNING id INTO :id`,
      {
        nome,
        email,
        senha: senhaHash,
        perfil,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const novoId = (result.outBinds as { id: number[] }).id[0];
    await conn.close();

    res.status(201).json({ id: novoId, nome, email, perfil, ativo: 1 });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: err });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });

  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM usuarios WHERE email = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();

    if (!result.rows || result.rows.length === 0)
      return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const usuario = result.rows[0] as any;
    if (usuario.ATIVO === 0) return res.status(403).json({ erro: 'Usuário inativo.' });

    const senhaValida = await bcrypt.compare(senha, usuario.SENHA);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });

    const token = jwt.sign({ id: usuario.ID, perfil: usuario.PERFIL }, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      usuario: { id: usuario.ID, nome: usuario.NOME, email: usuario.EMAIL, perfil: usuario.PERFIL }
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao fazer login', detalhes: err });
  }
};