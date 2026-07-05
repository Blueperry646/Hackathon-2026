import { useEffect, useState } from "react";
import axios from 'axios';
import "./style.css";
import LogoutButton from '../../components/LogoutButton';

/**
 * Página do Administrador
 * 
 * Funcionalidades:
 * - Gerenciar cardápios (CRUD)
 * - Gerenciar estoque (CRUD + movimentações)
 * - Visualizar análises e indicadores
 * - Gerenciar turmas, pratos e ingredientes
 */
function AdminPage() {
    // ===========================
    // ESTADOS DO HEADER
    // ===========================

    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");
    const [usuario, setUsuario] = useState(null);

    // ===========================
    // ESTADOS DO MENU
    // ===========================

    const [menuAtivo, setMenuAtivo] = useState("cardapio");
    const [loading, setLoading] = useState(true);

    // ===========================
    // DADOS DO BACKEND
    // ===========================

    // Cardápio
    const [cardapios, setCardapios] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [pratos, setPratos] = useState([]);
    const [restricoes, setRestricoes] = useState([]);

    // Estoque
    const [estoque, setEstoque] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);

    // Análises
    const [analises, setAnalises] = useState({
        totalRefeicoes: 0,
        totalProduzido: 0,
        totalSobra: 0,
        desperdicio: 0
    });

    // ===========================
    // ESTADOS DO FORMULÁRIO (CARDÁPIO)
    // ===========================

    const [formCardapio, setFormCardapio] = useState({
        dataRefeicao: '',
        horario: '',
        turmaId: '',
        pratoId: '',
        restricaoId: ''
    });
    const [editandoCardapio, setEditandoCardapio] = useState(null);

    // ===========================
    // ESTADOS DO FORMULÁRIO (ESTOQUE)
    // ===========================

    const [formEstoque, setFormEstoque] = useState({
        ingredienteId: '',
        quantidade: '',
        validade: '',
        tipoMovimentacao: 'ENTRADA'
    });
    const [editandoEstoque, setEditandoEstoque] = useState(null);

    // ===========================
    // MENSAGENS DE FEEDBACK
    // ===========================

    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // ===========================
    // CARREGAMENTO INICIAL
    // ===========================

    useEffect(() => {
        // ============================================
        // 1. FORMATAR DATA ATUAL
        // ============================================
        const hoje = new Date();
        setDataAtual(
            hoje.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        );

        // ============================================
        // 2. VERIFICAR SESSÃO DO USUÁRIO
        // ============================================
        const usuarioStr = localStorage.getItem('usuario');

        if (!usuarioStr) {
            setMensagem({
                texto: 'Usuário não está logado! Redirecionando...',
                tipo: 'erro'
            });
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        try {
            const user = JSON.parse(usuarioStr);
            setUsuario(user);

            if (user.escola) {
                setEscola(user.escola);
            }

            // ============================================
            // 3. BUSCAR DADOS DO BACKEND
            // ============================================
            const buscarDados = async () => {
                try {
                    setLoading(true);
                    setMensagem({ texto: '', tipo: '' });

                    const escolaId = user.escolaId || 1;

                    // Buscar cardápios
                    const cardapioRes = await axios.get(
                        `http://localhost:5000/admin/cardapio`
                    );
                    setCardapios(cardapioRes.data);

                    // Buscar estoque
                    const estoqueRes = await axios.get(
                        `http://localhost:5000/admin/estoque?escolaId=${escolaId}`
                    );
                    setEstoque(estoqueRes.data);

                    // Buscar ingredientes
                    const ingredientesRes = await axios.get(
                        'http://localhost:5000/ingredientes'
                    );
                    setIngredientes(ingredientesRes.data);

                    // Buscar turmas
                    const turmasRes = await axios.get(
                        `http://localhost:5000/contador/turmas?escolaId=${escolaId}`
                    );
                    setTurmas(turmasRes.data);

                    // Buscar restrições
                    const restricoesRes = await axios.get(
                        'http://localhost:5000/contador/restricoes'
                    );
                    setRestricoes(restricoesRes.data);

                    // Calcular análises
                    calcularAnalises(cardapioRes.data, estoqueRes.data);

                } catch (error) {
                    console.error('Erro ao buscar dados:', error);
                    setMensagem({
                        texto: 'Erro ao carregar dados. Verifique se o backend está rodando.',
                        tipo: 'erro'
                    });
                } finally {
                    setLoading(false);
                }
            };

            buscarDados();

        } catch (error) {
            console.error('Erro ao processar usuário:', error);
            setMensagem({
                texto: 'Erro ao carregar dados do usuário.',
                tipo: 'erro'
            });
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }

    }, []);

    // ===========================
    // FUNÇÃO: CALCULAR ANÁLISES
    // ===========================

    function calcularAnalises(cardapios, estoqueItems) {
        // Exemplo de cálculos simples
        const totalRefeicoes = cardapios.length;
        const totalEstoque = estoqueItems.reduce((acc, item) => acc + Number(item.quantidade), 0);

        setAnalises({
            totalRefeicoes,
            totalEstoque,
            totalPratos: cardapios.length,
            totalIngredientes: estoqueItems.length
        });
    }

    // ===========================
    // FUNÇÃO: LIMPAR MENSAGEM
    // ===========================

    useEffect(() => {
        if (mensagem.texto) {
            const timer = setTimeout(() => {
                setMensagem({ texto: '', tipo: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    // ===========================
    // FUNÇÕES: CARDÁPIO (CRUD)
    // ===========================

    // Listar cardápios
    async function listarCardapios() {
        try {
            const res = await axios.get('http://localhost:5000/admin/cardapio');
            setCardapios(res.data);
        } catch (error) {
            console.error('Erro ao listar cardápios:', error);
            setMensagem({ texto: 'Erro ao listar cardápios.', tipo: 'erro' });
        }
    }

    // Criar cardápio
    async function criarCardapio(e) {
        e.preventDefault();

        if (!formCardapio.turmaId || !formCardapio.pratoId || !formCardapio.dataRefeicao) {
            setMensagem({ texto: 'Preencha todos os campos obrigatórios.', tipo: 'erro' });
            return;
        }

        try {
            const payload = {
                ...formCardapio,
                escolaId: usuario?.escolaId || 1,
                dataRefeicao: new Date(formCardapio.dataRefeicao).toISOString(),
                horario: formCardapio.horario
            };

            await axios.post('http://localhost:5000/admin/cardapio', payload);

            setMensagem({ texto: 'Cardápio criado com sucesso!', tipo: 'sucesso' });
            setFormCardapio({ dataRefeicao: '', horario: '', turmaId: '', pratoId: '', restricaoId: '' });
            listarCardapios();

        } catch (error) {
            console.error('Erro ao criar cardápio:', error);
            setMensagem({ texto: '❌ Erro ao criar cardápio.', tipo: 'erro' });
        }
    }

    // Excluir cardápio
    async function excluirCardapio(id) {
        if (!window.confirm('Tem certeza que deseja excluir este cardápio?')) return;

        try {
            await axios.delete(`http://localhost:5000/admin/cardapio/${id}`);
            setMensagem({ texto: 'Cardápio excluído com sucesso!', tipo: 'sucesso' });
            listarCardapios();
        } catch (error) {
            console.error('Erro ao excluir cardápio:', error);
            setMensagem({ texto: 'Erro ao excluir cardápio.', tipo: 'erro' });
        }
    }

    // ===========================
    // FUNÇÕES: ESTOQUE (CRUD)
    // ===========================

    // Listar estoque
    async function listarEstoque() {
        try {
            const res = await axios.get(`http://localhost:5000/admin/estoque?escolaId=${usuario?.escolaId || 1}`);
            setEstoque(res.data);
        } catch (error) {
            console.error('Erro ao listar estoque:', error);
            setMensagem({ texto: 'Erro ao listar estoque.', tipo: 'erro' });
        }
    }

    // Registrar movimentação de estoque
    async function registrarMovimentacao(e) {
        e.preventDefault();

        if (!formEstoque.ingredienteId || !formEstoque.quantidade) {
            setMensagem({ texto: 'Preencha todos os campos obrigatórios.', tipo: 'erro' });
            return;
        }

        try {
            await axios.post('http://localhost:5000/admin/estoque/movimentacao', {
                estoqueId: parseInt(formEstoque.ingredienteId),
                tipo: formEstoque.tipoMovimentacao,
                quantidade: parseFloat(formEstoque.quantidade)
            });

            setMensagem({ texto: 'Movimentação registrada com sucesso!', tipo: 'sucesso' });
            setFormEstoque({ ingredienteId: '', quantidade: '', validade: '', tipoMovimentacao: 'ENTRADA' });
            listarEstoque();

        } catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            setMensagem({ texto: 'Erro ao registrar movimentação.', tipo: 'erro' });
        }
    }

    // ===========================
    // RENDERIZAÇÃO: LOADING
    // ===========================

    if (loading) {
        return (
            <div className="admin-page">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '20px' }}>
                        Carregando...
                    </div>
                    <div style={{ color: '#666' }}>
                        Preparando o painel administrativo
                    </div>
                </div>
            </div>
        );
    }

    // ===========================
    // RENDERIZAÇÃO DO CONTEÚDO
    // ===========================

    function renderContent() {
        switch (menuAtivo) {

            // ============================================
            // 1. MÓDULO: CARDÁPIO
            // ============================================

            case "cardapio":
                return (
                    <div className="content-box">
                        <h2>GERENCIAMENTO DE CARDÁPIO</h2>

                        {/* Mensagem de feedback */}
                        {mensagem.texto && mensagem.tipo === 'sucesso' && (
                            <div style={{ color: 'green', padding: '10px', background: '#d4edda', borderRadius: '4px', marginBottom: '15px' }}>
                                {mensagem.texto}
                            </div>
                        )}

                        {/* Formulário de criação */}
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <h3>Criar Novo Cardápio</h3>
                            <form onSubmit={criarCardapio} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label>Data</label>
                                    <input
                                        type="date"
                                        value={formCardapio.dataRefeicao}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, dataRefeicao: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Horário</label>
                                    <input
                                        type="time"
                                        value={formCardapio.horario}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, horario: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Turma</label>
                                    <select
                                        value={formCardapio.turmaId}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, turmaId: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Prato</label>
                                    <select
                                        value={formCardapio.pratoId}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, pratoId: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {pratos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label>Restrição (opcional)</label>
                                    <select
                                        value={formCardapio.restricaoId}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, restricaoId: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                    >
                                        <option value="">Nenhuma</option>
                                        {restricoes.map(r => (
                                            <option key={r.id} value={r.id}>{r.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <button type="submit" style={{
                                        padding: '10px 20px',
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        Criar Cardápio
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Lista de cardápios */}
                        <div>
                            <h3>Cardápios Cadastrados</h3>
                            {cardapios.length === 0 ? (
                                <p style={{ color: '#999' }}>Nenhum cardápio cadastrado.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f1f1' }}>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Data</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Horário</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Turma</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Prato</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cardapios.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {new Date(c.dataRefeicao).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {c.horario}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {c.turma?.nome || 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {c.prato?.nome || 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    <button
                                                        onClick={() => excluirCardapio(c.id)}
                                                        style={{
                                                            padding: '5px 10px',
                                                            background: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                );

            // ============================================
            // 2. MÓDULO: ANÁLISE
            // ============================================

            case "analise":
                return (
                    <div className="content-box">
                        <h2>ANÁLISE DE DADOS</h2>

                        {/* Cards de indicadores */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                background: '#e3f2fd',
                                padding: '20px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {analises.totalRefeicoes || 0}
                                </div>
                                <div style={{ color: '#666' }}>Total de Refeições</div>
                            </div>

                            <div style={{
                                background: '#e8f5e9',
                                padding: '20px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {analises.totalPratos || 0}
                                </div>
                                <div style={{ color: '#666' }}>Pratos Cadastrados</div>
                            </div>

                            <div style={{
                                background: '#fff3e0',
                                padding: '20px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {analises.totalIngredientes || 0}
                                </div>
                                <div style={{ color: '#666' }}>Ingredientes em Estoque</div>
                            </div>

                            <div style={{
                                background: '#fce4ec',
                                padding: '20px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {analises.totalEstoque || 0}kg
                                </div>
                                <div style={{ color: '#666' }}>Total em Estoque</div>
                            </div>
                        </div>

                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px'
                        }}>
                            <h3>Funcionalidades em Desenvolvimento:</h3>
                            <ul>
                                <li>Gráficos de refeições previstas vs realizadas</li>
                                <li>Análise de desperdício diário</li>
                                <li>Ranking de pratos mais populares</li>
                                <li>Filtros por turma e data</li>
                                <li>Relatórios mensais</li>
                            </ul>
                        </div>
                    </div>
                );

            // ============================================
            // 3. MÓDULO: ESTOQUE
            // ============================================

            case "estoque":
                return (
                    <div className="content-box">
                        <h2>GESTÃO DE ESTOQUE</h2>

                        {/* Mensagem de feedback */}
                        {mensagem.texto && mensagem.tipo === 'sucesso' && (
                            <div style={{ color: 'green', padding: '10px', background: '#d4edda', borderRadius: '4px', marginBottom: '15px' }}>
                                {mensagem.texto}
                            </div>
                        )}

                        {/* Formulário de movimentação */}
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <h3>Registrar Movimentação</h3>
                            <form onSubmit={registrarMovimentacao} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label>Ingrediente</label>
                                    <select
                                        value={formEstoque.ingredienteId}
                                        onChange={(e) => setFormEstoque({ ...formEstoque, ingredienteId: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {ingredientes.map(i => (
                                            <option key={i.id} value={i.id}>{i.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Tipo</label>
                                    <select
                                        value={formEstoque.tipoMovimentacao}
                                        onChange={(e) => setFormEstoque({ ...formEstoque, tipoMovimentacao: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    >
                                        <option value="ENTRADA">Entrada</option>
                                        <option value="SAIDA">Saída</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Quantidade (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formEstoque.quantidade}
                                        onChange={(e) => setFormEstoque({ ...formEstoque, quantidade: e.target.value })}
                                        style={{ width: '100%', padding: '8px' }}
                                        required
                                    />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <button type="submit" style={{
                                        padding: '10px 20px',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        Registrar Movimentação
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Lista de estoque */}
                        <div>
                            <h3>Estoque Atual</h3>
                            {estoque.length === 0 ? (
                                <p style={{ color: '#999' }}>Nenhum item no estoque.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f1f1' }}>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ingrediente</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Quantidade (kg)</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Validade</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estoque.map(item => {
                                            const hoje = new Date();
                                            const validade = new Date(item.validade);
                                            const estaVencido = validade < hoje;
                                            const vaiVencer = (validade - hoje) / (1000 * 60 * 60 * 24) < 7;

                                            return (
                                                <tr key={item.id}>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                        {item.ingrediente?.nome || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                        {item.quantidade}
                                                    </td>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                        {new Date(item.validade).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                        {estaVencido ? (
                                                            <span style={{ color: 'red', fontWeight: 'bold' }}>Vencido</span>
                                                        ) : vaiVencer ? (
                                                            <span style={{ color: 'orange', fontWeight: 'bold' }}>Vence em breve</span>
                                                        ) : (
                                                            <span style={{ color: 'green' }}>OK</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    // ===========================
    // RENDERIZAÇÃO PRINCIPAL
    // ===========================

    return (
        <div className="admin-page">
            {/* ================= HEADER ================= */}
            <header className="admin-header">
                <h1>{escola || "ESCOLA"}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>{dataAtual}</h2>
                    <LogoutButton />
                </div>
            </header>



            <hr />

            {/* ================= BODY ================= */}
            <div className="admin-body">
                {/* ================= SIDEBAR ================= */}
                <aside className="sidebar">
                    <h3>ADMINISTRADOR</h3>

                    <button
                        onClick={() => setMenuAtivo("cardapio")}
                        className={menuAtivo === "cardapio" ? "active" : ""}
                    >
                        Cardápio
                    </button>

                    <button
                        onClick={() => setMenuAtivo("analise")}
                        className={menuAtivo === "analise" ? "active" : ""}
                    >
                        Análise de Dados
                    </button>

                    <button
                        onClick={() => setMenuAtivo("estoque")}
                        className={menuAtivo === "estoque" ? "active" : ""}
                    >
                        Estoque
                    </button>

                    {/* Botão de Logout */}
                    <button
                        onClick={() => {
                            localStorage.removeItem('usuario');
                            window.location.href = '/';
                        }}
                        style={{
                            marginTop: '30px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Sair
                    </button>
                </aside>

                {/* ================= CONTENT ================= */}
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="admin-footer">
                Protótipo da página do administrador desenvolvido pela equipe Try Catcher - Hackathon 2026
            </footer>
        </div>
    );
}

export default AdminPage;