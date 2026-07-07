/**
 * SERVIDOR BACKEND (API)
 * 
 * Este arquivo centraliza todas as regras de negócio e comunicação com o banco de dados.
 * Ele recebe pedidos do site (frontend) e responde com os dados necessários.
 */

require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// =============================================================================
// 1. AUTENTICAÇÃO
// =============================================================================
app.post('/login', async (req, res) => {
  const { identificador, senha } = req.body;
  try {
    const user = await prisma.usuario.findFirst({
      where: { identificador, senha },
      include: { escola: true }
    });

    if (user) {
      res.json({ success: true, user: { id: user.id, nome: user.nome, perfil: user.perfil, escola: user.escola.nome, escolaId: user.escolaId } });
    } else {
      res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// =============================================================================
// 2. MÓDULO ADMINISTRADOR (Cardápios, Pratos e Estoque)
// =============================================================================

// Cardápio: Listar e Criar
app.get('/admin/cardapio', async (req, res) => {
  try {
    const cardapios = await prisma.cardapioSemanal.findMany({ include: { turma: true, prato: { include: { ingredientes: { include: { ingrediente: true } } } }, restricao: true } });
    res.json(cardapios.map(c => ({ ...c, horario: c.horario?.toISOString().substring(11, 16) })));
  } catch (e) { res.status(500).json({ error: "Erro ao buscar cardápios" }); }
});

app.post('/admin/cardapio', async (req, res) => {
  try {
    const { dataRefeicao, horario, escolaId, turmaId, pratoId, restricaoId } = req.body;
    const cardapio = await prisma.cardapioSemanal.create({
      data: {
        dataRefeicao: new Date(dataRefeicao),
        horario: new Date(`1993-12-10T${horario}:00Z`),
        escola: { connect: { id: parseInt(escolaId) } },
        turma: { connect: { id: parseInt(turmaId) } },
        prato: { connect: { id: parseInt(pratoId) } },
        restricao: restricaoId ? { connect: { id: parseInt(restricaoId) } } : undefined
      }
    });
    res.status(201).json(cardapio);
  } catch (e) { res.status(400).json({ error: "Erro ao criar cardápio" }); }
});

// Pratos: CRUD Completo
app.get('/admin/pratos', async (req, res) => {
  const pratos = await prisma.prato.findMany({ include: { ingredientes: { include: { ingrediente: true } } } });
  res.json(pratos);
});

app.post('/admin/pratos', async (req, res) => {
  const { nome, ingredientes } = req.body;
  const prato = await prisma.prato.create({
    data: { nome, ingredientes: { create: ingredientes.map(i => ({ ingredienteId: parseInt(i.ingredienteId), quantidade: parseFloat(i.quantidade) })) } }
  });
  res.status(201).json(prato);
});

// Estoque
app.get('/admin/estoque', async (req, res) => {
  const estoque = await prisma.estoque.findMany({ where: { escolaId: parseInt(req.query.escolaId) }, include: { ingrediente: true } });
  res.json(estoque);
});

app.post('/admin/estoque/movimentacao', async (req, res) => {
  const { estoqueId, tipo, quantidade } = req.body;
  const estoque = await prisma.estoque.update({
    where: { id: parseInt(estoqueId) },
    data: { quantidade: { [tipo === 'ENTRADA' ? 'increment' : 'decrement']: parseFloat(quantidade) } }
  });
  res.status(201).json(estoque);
});

// =============================================================================
// 3. MÓDULO CONTADOR (Confirmações)
// =============================================================================
app.post('/contador/confirmacao', async (req, res) => {
  const { turmaId, totalAlunos, restricoes } = req.body;
  const confirmacao = await prisma.confirmacaoRefeicao.create({
    data: { dataRefeicao: new Date(), quantidade: parseInt(totalAlunos), turmaId: parseInt(turmaId) }
  });
  res.status(201).json(confirmacao);
});

// =============================================================================
// 4. MÓDULO COZINHEIRO (Produção e Cardápio do dia)
// =============================================================================
app.get('/cozinheiro/cardapio/dia', async (req, res) => {
  const hoje = new Date();
  const inicio = new Date(hoje.setHours(0,0,0,0));
  const fim = new Date(hoje.setHours(23,59,59,999));
  
  const cardapios = await prisma.cardapioSemanal.findMany({
    where: { escolaId: parseInt(req.query.escolaId), dataRefeicao: { gte: inicio, lte: fim } },
    include: { prato: { include: { ingredientes: { include: { ingrediente: true } } } }, restricao: true }
  });
  res.json(cardapios);
});

app.post('/cozinheiro/producao', async (req, res) => {
  const { cardapioId, usuarioId, horaPreparo, kgProduzido, kgSobra } = req.body;
  const producao = await prisma.producaoRefeicao.create({
    data: { horaPreparo: new Date(`1970-01-01T${horaPreparo}:00Z`), kgProduzido: parseFloat(kgProduzido), kgSobra: parseFloat(kgSobra), cardapioId: parseInt(cardapioId), usuarioId: parseInt(usuarioId) }
  });
  res.status(201).json(producao);
});

// =============================================================================
// INICIAR SERVIDOR
// =============================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));