require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// 1. AUTENTICAÇÃO (LOGIN)
// ============================================

app.post('/login', async (req, res) => {
  const { identificador, senha } = req.body;

  try {
    // Busca usuário pelo identificador (matrícula/email) e senha
    const user = await prisma.usuario.findFirst({
      where: {
        identificador: identificador,
        senha: senha, // Protótipo - depois implementar hash
      },
      include: {
        escola: true // Inclui dados da escola
      }
    });

    if (user) {
      res.json({
        success: true,
        user: {
          id: user.id,
          nome: user.nome,
          identificador: user.identificador,
          perfil: user.perfil,
          escola: user.escola.nome
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Identificador ou senha inválidos"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ============================================
// 2. ADMIN - CARDÁPIO
// ============================================

// Listar cardápios com filtros
app.get('/admin/cardapio', async (req, res) => {
  const { turmaId, data } = req.query;

  try {
    const where = {};

    if (turmaId) where.turmaId = parseInt(turmaId);
    if (data) {
      const dataFilter = new Date(data);
      where.dataRefeicao = {
        gte: new Date(dataFilter.setHours(0, 0, 0, 0)),
        lt: new Date(dataFilter.setHours(23, 59, 59, 999))
      };
    }

    const cardapios = await prisma.cardapioSemanal.findMany({
      where,
      include: {
        turma: true,
        prato: {
          include: {
            ingredientes: {
              include: {
                ingrediente: true
              }
            }
          }
        },
        restricao: true,
        escola: true
      }
    });
        const cardapiosFormatados = cardapios.map(item => ({
      ...item,
      horario: item.horario 
        ? item.horario.toISOString().substring(11, 16) 
        : null
    }));
    res.json(cardapiosFormatados); //se tudo der certo é praquela data lá nn aparecer no site...
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cardápios" });
  }
});

// Criar novo cardápio
app.post('/admin/cardapio', async (req, res) => {
  const { dataRefeicao, horario, escolaId, turmaId, pratoId, restricaoId } = req.body;

  try {
    const horarioFormatado = new Date(`1993-12-10T${horario}:00Z`); //data ficticia só pra não dá erro de date invalid; btw, dia que doom 1 lanço
    const parsedRestricaoId = parseInt(restricaoId);
    const temRestricao = !isNaN(parsedRestricaoId); //se nn escrever nada na Id ele vai achar que é NULL e ai nn vai ser int... eu acho???
    const cardapio = await prisma.cardapioSemanal.create({
      data: {
        dataRefeicao: new Date(dataRefeicao),
        horario: horarioFormatado,
        escola: {connect:{ id: parseInt(escolaId)} },
        turma: {connect:{ id: parseInt(turmaId)} },
        prato: {connect:{ id: parseInt(pratoId)} },
        ...(temRestricao ? { restricao: { connect: { id: parsedRestricaoId } } } : {}),
      },
      include: {
        turma: true,
        prato: true,
        restricao: true
      }
    });

    res.status(201).json(cardapio);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao criar cardápio" });
  }
});

// ATUALIZAR cardápio (NOVO) sei lá pra que isso serve
app.put('/admin/cardapio/:id', async (req, res) => {
  const { id } = req.params;
  const { dataRefeicao, horario, turmaId, pratoId, restricaoId } = req.body;

  try {
    const cardapio = await prisma.cardapioSemanal.update({
      where: { id: parseInt(id) },
      data: {
        dataRefeicao: dataRefeicao ? new Date(dataRefeicao) : undefined,
        horario: horario,
        turmaId: turmaId ? parseInt(turmaId) : undefined,
        pratoId: pratoId ? parseInt(pratoId) : undefined,
        restricaoId: restricaoId ? parseInt(restricaoId) : null
      },
      include: {
        turma: true,
        prato: true,
        restricao: true
      }
    });

    res.json(cardapio);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao atualizar cardápio" });
  }
});

// EXCLUIR cardápio (NOVO) meio obvio não?
app.delete('/admin/cardapio/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Primeiro exclui as produções relacionadas
    await prisma.producaoRefeicao.deleteMany({
      where: { cardapioId: parseInt(id) }
    });

    // Depois exclui o cardápio
    await prisma.cardapioSemanal.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: "Cardápio excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao excluir cardápio" });
  }
});

// ============================================
// 2. CRUD COMPLETO DE PRATOS (NOVO)
// ============================================

// Listar todos os pratos
app.get('/admin/pratos', async (req, res) => {
  try {
    const pratos = await prisma.prato.findMany({
      include: {
        ingredientes: {
          include: {
            ingrediente: true
          }
        }
      }
    });
    res.json(pratos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pratos" });
  }
});

// Criar prato
app.post('/admin/pratos', async (req, res) => {
  const { nome, ingredientes } = req.body;

  try {
    const prato = await prisma.prato.create({
      data: {
        nome: nome,
        ingredientes: {
          create: ingredientes.map(ing => ({
            ingredienteId: parseInt(ing.ingredienteId),
            quantidade: parseFloat(ing.quantidade)
          }))
        }
      },
      include: {
        ingredientes: {
          include: {
            ingrediente: true
          }
        }
      }
    });

    res.status(201).json(prato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao criar prato" });
  }
});

// Atualizar prato
app.put('/admin/pratos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, ingredientes } = req.body;

  try {
    // Remove ingredientes antigos
    await prisma.pratoIngrediente.deleteMany({
      where: { pratoId: parseInt(id) }
    });

    // Atualiza prato com novos ingredientes
    const prato = await prisma.prato.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome,
        ingredientes: {
          create: ingredientes.map(ing => ({
            ingredienteId: parseInt(ing.ingredienteId),
            quantidade: parseFloat(ing.quantidade)
          }))
        }
      },
      include: {
        ingredientes: {
          include: {
            ingrediente: true
          }
        }
      }
    });

    res.json(prato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao atualizar prato" });
  }
});

// Excluir prato
app.delete('/admin/pratos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Remove ingredientes
    await prisma.pratoIngrediente.deleteMany({
      where: { pratoId: parseInt(id) }
    });

    // Remove referências em cardápios
    await prisma.cardapioSemanal.updateMany({
      where: { pratoId: parseInt(id) },
      data: { pratoId: null }
    });

    // Exclui prato
    await prisma.prato.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: "Prato excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao excluir prato" });
  }
});

// ============================================
// 3. BUSCAR CONFIRMAÇÕES POR TURMA (NOVO)
// ============================================

app.get('/contador/confirmacoes', async (req, res) => {
  const { turmaId, data } = req.query;

  try {
    const where = {};
    if (turmaId) where.turmaId = parseInt(turmaId);
    if (data) {
      const dataFilter = new Date(data);
      where.dataRefeicao = {
        gte: new Date(dataFilter.setHours(0, 0, 0, 0)),
        lt: new Date(dataFilter.setHours(23, 59, 59, 999))
      };
    }

    const confirmacoes = await prisma.confirmacaoRefeicao.findMany({
      where,
      include: {
        turma: true,
        restricao: true
      }
    });

    res.json(confirmacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar confirmações" });
  }
});

// ============================================
// 4. BUSCAR DADOS PARA O COZINHEIRO (ATUALIZADO)
// ============================================

app.get('/cozinheiro/cardapio/dia', async (req, res) => {
  const { escolaId } = req.query;

  try {
    const hoje = new Date();
    const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
    const fimDia = new Date(hoje.setHours(23, 59, 59, 999));

    const cardapios = await prisma.cardapioSemanal.findMany({
      where: {
        escolaId: parseInt(escolaId),
        dataRefeicao: {
          gte: inicioDia,
          lte: fimDia
        }
      },
      include: {
        turma: {
          include: {
            confirmacoes: {
              where: {
                dataRefeicao: {
                  gte: inicioDia,
                  lte: fimDia
                }
              }
            }
          }
        },
        prato: {
          include: {
            ingredientes: {
              include: {
                ingrediente: true
              }
            }
          }
        },
        restricao: true
      }
    });

    // Calcula total de porções baseado nas confirmações
    const refeicoes = cardapios.map(c => {
      const totalPorcoes = c.turma.confirmacoes.reduce((acc, conf) => {
        return acc + conf.quantidade;
      }, 0);

      return {
        id: c.id,
        horario: c.horario,
        prato: c.prato.nome,
        porcoes: totalPorcoes || 0,
        especiais: c.restricao?.nome || "Nenhuma",
        ingredientes: c.prato.ingredientes.map(pi => ({
          nome: pi.ingrediente.nome,
          quantidade: pi.quantidade
        }))
      };
    });

    res.json(refeicoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cardápio do dia" });
  }
});


// ============================================
// 3. ADMIN - ESTOQUE
// ============================================

// Listar estoque
app.get('/admin/estoque', async (req, res) => {
  const { escolaId } = req.query;

  try {
    const estoque = await prisma.estoque.findMany({
      where: {
        escolaId: parseInt(escolaId)
      },
      include: {
        ingrediente: true,
        movimentacoes: true
      }
    });

    res.json(estoque);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar estoque" });
  }
});

// Registrar movimentação de estoque // Então, por algum motivo nn tem como criar estoque no site
app.post('/admin/estoque/movimentacao', async (req, res) => {
  const { estoqueId, tipo, quantidade } = req.body;

  try {
    // Atualiza quantidade no estoque
    const estoque = await prisma.estoque.update({
      where: { id: parseInt(estoqueId) },
      data: {
        quantidade: {
          [tipo === 'ENTRADA' ? 'increment' : 'decrement']: parseFloat(quantidade)
        }
      }
    });

    // Registra movimentação... se deus permitir
    const movimentacao = await prisma.movimentacaoEstoque.create({
      data: {
        tipo: tipo,
        quantidade: parseFloat(quantidade),
        dataMovimentacao: new Date(),
        estoqueId: parseInt(estoqueId)
      }
    });

    res.status(201).json({ estoque, movimentacao });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao registrar movimentação" });
  }
});

// ============================================
// 4. CONTADOR - CONFIRMAÇÃO DE REFEIÇÕES
// ============================================

// Listar turmas
app.get('/contador/turmas', async (req, res) => {
  const { escolaId } = req.query;

  try {
    const turmas = await prisma.turma.findMany({
      where: {
        escolaId: parseInt(escolaId)
      },
      include: {
        confirmacoes: true
      }
    });

    res.json(turmas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar turmas" });
  }
});

// Listar restrições alimentares
app.get('/contador/restricoes', async (req, res) => {
  try {
    const restricoes = await prisma.restricaoAlimentar.findMany();
    res.json(restricoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar restrições" });
  }
});

// Registrar confirmação de refeição
app.post('/contador/confirmacao', async (req, res) => {
  const { turmaId, totalAlunos, restricoes } = req.body;

  try {
    // 1. Registra confirmação principal
    const confirmacao = await prisma.confirmacaoRefeicao.create({
      data: {
        dataRefeicao: new Date(),
        quantidade: parseInt(totalAlunos),
        turmaId: parseInt(turmaId)
      }
    });

    // 2. Registra restrições (se houver)
    if (restricoes && restricoes.length > 0) {
      // Aqui você pode criar uma tabela de relação
      // ou atualizar as restrições já existentes
      // Por simplicidade, vamos apenas atualizar a confirmação
      // com a primeira restrição (exemplo)

      const restricao = restricoes.find(r => r.quantidade > 0);
      if (restricao) {
        await prisma.confirmacaoRefeicao.update({
          where: { id: confirmacao.id },
          data: {
            restricaoId: parseInt(restricao.restricaoId)
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Confirmação registrada com sucesso",
      confirmacao
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao registrar confirmação" });
  }
});

// ============================================
// 5. COZINHEIRO - PRODUÇÃO
// ============================================

// Cardápio do dia
app.get('/cozinheiro/cardapio/dia', async (req, res) => {
  const { escolaId } = req.query;

  try {
    const hoje = new Date();
    // Ajuste para garantir que pegamos o dia correto sem problemas de fuso horário
    // const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
    // const fimDia = new Date(hoje.setHours(23, 59, 59, 999));

    const cardapios = await prisma.cardapioSemanal.findMany({
      where: {
        escolaId: parseInt(escolaId),
        dataRefeicao: {
          gte: inicioDia,
          lte: fimDia
        }
      },
      include: {
        turma: {
          include: { confirmacoes: true } // ADICIONADO: Necessário para o reduce funcionar
        },
        prato: {
          include: {
            ingredientes: { include: { ingrediente: true } }
          }
        },
        restricao: true
      }
    });

    const refeicoes = cardapios.map(c => ({
      id: c.id,
      // Formatando a hora para evitar o "1970-01-01..." no frontend
      horario: c.horario ? c.horario.toISOString().substring(11, 16) : '--:--',
      prato: c.prato.nome,
      porcoes: c.turma.confirmacoes?.reduce((acc, conf) => acc + conf.quantidade, 0) || 0,
      especiais: c.restricao?.nome || "Nenhuma",
      ingredientes: c.prato.ingredientes.map(pi => ({
        nome: pi.ingrediente.nome,
        quantidade: pi.quantidade
      }))
    }));

    res.json(refeicoes);
  } catch (error) {
    console.error("Erro no Cardápio do Dia:", error);
    res.status(500).json({ error: "Erro ao buscar cardápio" });
  }
});

// Registrar produção
app.post('/cozinheiro/producao', async (req, res) => {
  const { cardapioId, usuarioId, horaPreparo, kgProduzido, kgSobra } = req.body;

  try {
    // CONVERSÃO DA HORA (igual fizemos no Admin)
    const horaFormatada = new Date(`1970-01-01T${horaPreparo}:00Z`);

    const producao = await prisma.producaoRefeicao.create({
      data: {
        horaPreparo: horaFormatada, // Usa o objeto Date
        kgProduzido: parseFloat(kgProduzido),
        kgSobra: parseFloat(kgSobra) || 0,
        cardapioId: parseInt(cardapioId),
        usuarioId: parseInt(usuarioId)
      },
      include: {
        cardapio: { include: { prato: true } },
        usuario: true
      }
    });

    res.status(201).json(producao);
  } catch (error) {
    console.error("Erro ao registrar produção:", error);
    res.status(400).json({ error: "Erro ao registrar produção" });
  }
});

// Histórico de produção do dia
app.get('/cozinheiro/historico', async (req, res) => {
  const { usuarioId } = req.query;

  try {
    const hoje = new Date();
    const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
    const fimDia = new Date(hoje.setHours(23, 59, 59, 999));

    const historico = await prisma.producaoRefeicao.findMany({
      where: {
        usuarioId: parseInt(usuarioId),
        horaPreparo: {
          gte: inicioDia,
          lte: fimDia
        }
      },
      include: {
        cardapio: {
          include: {
            prato: true
          }
        }
      },
      orderBy: {
        horaPreparo: 'desc'
      }
    });

    res.json(historico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

// ============================================
// 6. ROTAS AUXILIARES
// ============================================

// Buscar escola do usuário
app.get('/usuario/escola/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        escola: true
      }
    });

    res.json(usuario?.escola || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar escola" });
  }
});

// Listar todos os ingredientes
app.get('/ingredientes', async (req, res) => {
  try {
    const ingredientes = await prisma.ingrediente.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    res.json(ingredientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar ingredientes" });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📋 Rotas disponíveis:');
  console.log('  POST /login');
  console.log('  GET  /admin/cardapio');
  console.log('  POST /admin/cardapio');
  console.log('  GET  /admin/estoque');
  console.log('  POST /admin/estoque/movimentacao');
  console.log('  GET  /contador/turmas');
  console.log('  GET  /contador/restricoes');
  console.log('  POST /contador/confirmacao');
  console.log('  GET  /cozinheiro/cardapio/dia');
  console.log('  POST /cozinheiro/producao');
  console.log('  GET  /cozinheiro/historico');
  console.log('  GET  /ingredientes');
});