const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função auxiliar para criar data com horário específico
function criarDataComHorario(dataBase, horaString) {
    const [horas, minutos] = horaString.split(':').map(Number);
    const novaData = new Date(dataBase);
    novaData.setHours(horas, minutos, 0, 0);
    return novaData;
}

async function main() {
    console.log('🌱 Iniciando seed no MySQL...');

    try {
        // ============================================
        // 1. ESCOLA
        // ============================================
        const escola = await prisma.escola.upsert({
            where: { id: 1 },
            update: {},
            create: {
                nome: 'Escola Municipal de Caraguatatuba'
            }
        });
        console.log(`✅ Escola: ${escola.nome} (ID: ${escola.id})`);

        // ============================================
        // 2. TURMAS
        // ============================================
        const turmas = await Promise.all([
            prisma.turma.upsert({
                where: { id: 1 },
                update: {},
                create: { nome: 'Turma A - Manhã', escolaId: escola.id }
            }),
            prisma.turma.upsert({
                where: { id: 2 },
                update: {},
                create: { nome: 'Turma B - Tarde', escolaId: escola.id }
            }),
            prisma.turma.upsert({
                where: { id: 3 },
                update: {},
                create: { nome: 'Turma C - Noite', escolaId: escola.id }
            })
        ]);
        console.log(`✅ ${turmas.length} turmas criadas`);

        // ============================================
        // 3. USUÁRIOS - USANDO UPSERT
        // ============================================
        await Promise.all([
            prisma.usuario.upsert({
                where: { identificador: 'admin123' },
                update: {},
                create: {
                    nome: 'Administrador',
                    identificador: 'admin123',
                    senha: 'admin123',
                    perfil: 'ADMIN',
                    escolaId: escola.id
                }
            }),
            prisma.usuario.upsert({
                where: { identificador: 'contador123' },
                update: {},
                create: {
                    nome: 'Contador',
                    identificador: 'contador123',
                    senha: 'contador123',
                    perfil: 'CONTADOR',
                    escolaId: escola.id
                }
            }),
            prisma.usuario.upsert({
                where: { identificador: 'cozinheiro123' },
                update: {},
                create: {
                    nome: 'Cozinheiro',
                    identificador: 'cozinheiro123',
                    senha: 'cozinheiro123',
                    perfil: 'COZINHEIRO',
                    escolaId: escola.id
                }
            })
        ]);
        console.log(`✅ 3 usuários criados`);

        // ============================================
        // 4. RESTRIÇÕES
        // ============================================
        const restricoes = await Promise.all([
            prisma.restricaoAlimentar.upsert({
                where: { id: 1 },
                update: {},
                create: { nome: 'Glúten' }
            }),
            prisma.restricaoAlimentar.upsert({
                where: { id: 2 },
                update: {},
                create: { nome: 'Lactose' }
            }),
            prisma.restricaoAlimentar.upsert({
                where: { id: 3 },
                update: {},
                create: { nome: 'Açúcar' }
            }),
            prisma.restricaoAlimentar.upsert({
                where: { id: 4 },
                update: {},
                create: { nome: 'Frutos do Mar' }
            })
        ]);
        console.log(`✅ ${restricoes.length} restrições criadas`);

        // ============================================
        // 5. INGREDIENTES
        // ============================================
        const ingredientes = await Promise.all([
            prisma.ingrediente.upsert({
                where: { id: 1 },
                update: {},
                create: { nome: 'Arroz', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 2 },
                update: {},
                create: { nome: 'Feijão', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 3 },
                update: {},
                create: { nome: 'Carne Moída', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 4 },
                update: {},
                create: { nome: 'Frango', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 5 },
                update: {},
                create: { nome: 'Macarrão', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 6 },
                update: {},
                create: { nome: 'Tomate', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 7 },
                update: {},
                create: { nome: 'Cebola', unidade: 'kg' }
            }),
            prisma.ingrediente.upsert({
                where: { id: 8 },
                update: {},
                create: { nome: 'Alho', unidade: 'kg' }
            })
        ]);
        console.log(`✅ ${ingredientes.length} ingredientes criados`);

        // ============================================
        // 6. PRATOS
        // ============================================
        const pratos = await Promise.all([
            prisma.prato.upsert({
                where: { id: 1 },
                update: {},
                create: { nome: 'Arroz com Feijão' }
            }),
            prisma.prato.upsert({
                where: { id: 2 },
                update: {},
                create: { nome: 'Macarrão com Carne' }
            }),
            prisma.prato.upsert({
                where: { id: 3 },
                update: {},
                create: { nome: 'Frango Grelhado' }
            }),
            prisma.prato.upsert({
                where: { id: 4 },
                update: {},
                create: { nome: 'Salada de Tomate' }
            })
        ]);
        console.log(`✅ ${pratos.length} pratos criados`);

        // ============================================
        // 7. PRATO_INGREDIENTE
        // ============================================
        await prisma.pratoIngrediente.upsert({
            where: {
                pratoId_ingredienteId: {
                    pratoId: pratos[0].id,
                    ingredienteId: ingredientes[0].id
                }
            },
            update: { quantidade: 2.5 },
            create: {
                pratoId: pratos[0].id,
                ingredienteId: ingredientes[0].id,
                quantidade: 2.5
            }
        });
        await prisma.pratoIngrediente.upsert({
            where: {
                pratoId_ingredienteId: {
                    pratoId: pratos[0].id,
                    ingredienteId: ingredientes[1].id
                }
            },
            update: { quantidade: 1.0 },
            create: {
                pratoId: pratos[0].id,
                ingredienteId: ingredientes[1].id,
                quantidade: 1.0
            }
        });
        await prisma.pratoIngrediente.upsert({
            where: {
                pratoId_ingredienteId: {
                    pratoId: pratos[1].id,
                    ingredienteId: ingredientes[4].id
                }
            },
            update: { quantidade: 1.5 },
            create: {
                pratoId: pratos[1].id,
                ingredienteId: ingredientes[4].id,
                quantidade: 1.5
            }
        });
        await prisma.pratoIngrediente.upsert({
            where: {
                pratoId_ingredienteId: {
                    pratoId: pratos[1].id,
                    ingredienteId: ingredientes[2].id
                }
            },
            update: { quantidade: 1.0 },
            create: {
                pratoId: pratos[1].id,
                ingredienteId: ingredientes[2].id,
                quantidade: 1.0
            }
        });
        console.log(`✅ Ingredientes associados aos pratos`);

        // ============================================
        // 8. CARDÁPIOS
        // ============================================
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        await Promise.all([
            prisma.cardapioSemanal.upsert({
                where: { id: 1 },
                update: {},
                create: {
                    dataRefeicao: hoje,
                    horario: criarDataComHorario(hoje, '10:00'),
                    escolaId: escola.id,
                    turmaId: turmas[0].id,
                    pratoId: pratos[0].id
                }
            }),
            prisma.cardapioSemanal.upsert({
                where: { id: 2 },
                update: {},
                create: {
                    dataRefeicao: hoje,
                    horario: criarDataComHorario(hoje, '12:00'),
                    escolaId: escola.id,
                    turmaId: turmas[0].id,
                    pratoId: pratos[1].id
                }
            }),
            prisma.cardapioSemanal.upsert({
                where: { id: 3 },
                update: {},
                create: {
                    dataRefeicao: hoje,
                    horario: criarDataComHorario(hoje, '10:00'),
                    escolaId: escola.id,
                    turmaId: turmas[1].id,
                    pratoId: pratos[2].id
                }
            })
        ]);
        console.log(`✅ 3 cardápios criados`);

        // ============================================
        // 9. ESTOQUE
        // ============================================
        await Promise.all([
            prisma.estoque.upsert({
                where: { id: 1 },
                update: {},
                create: {
                    quantidade: 50,
                    validade: new Date(2026, 11, 31),
                    escolaId: escola.id,
                    ingredienteId: ingredientes[0].id
                }
            }),
            prisma.estoque.upsert({
                where: { id: 2 },
                update: {},
                create: {
                    quantidade: 30,
                    validade: new Date(2026, 11, 31),
                    escolaId: escola.id,
                    ingredienteId: ingredientes[1].id
                }
            }),
            prisma.estoque.upsert({
                where: { id: 3 },
                update: {},
                create: {
                    quantidade: 20,
                    validade: new Date(2026, 10, 15),
                    escolaId: escola.id,
                    ingredienteId: ingredientes[2].id
                }
            })
        ]);
        console.log(`✅ 3 itens no estoque`);

        console.log('\n🎉 SEED CONCLUÍDO COM SUCESSO!');
        console.log('\n🔑 CREDENCIAIS PARA TESTE:');
        console.log('  👤 Admin:      admin123 / admin123');
        console.log('  👤 Contador:   contador123 / contador123');
        console.log('  👤 Cozinheiro: cozinheiro123 / cozinheiro123');

    } catch (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Erro fatal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🔌 Conexão fechada');
    });