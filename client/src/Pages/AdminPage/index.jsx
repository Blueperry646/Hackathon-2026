import { useEffect, useState } from "react";
import axios from 'axios';
import LogoutButton from '../../components/LogoutButton';
import "./style.css";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
);

/**
 * Página do Administrador
 * 
 * Funcionalidades:
 * - Gerenciar cardápios (CRUD completo)
 * - Gerenciar pratos (CRUD completo)
 * - Gerenciar estoque (movimentações)
 * - Visualizar análises e indicadores
 */
function AdminPage() {
    // ===========================
    // ESTADOS DO HEADER
    // ===========================

    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");
    const [usuario, setUsuario] = useState(null);
    const [nomeUsuario, setNomeUsuario] = useState("");

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

    // Análises
    const [analises, setAnalises] = useState({
        totalRefeicoes: 0,
        totalPratos: 0,
        totalIngredientes: 0,
        totalEstoque: 0
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
    // ESTADOS DO FORMULÁRIO (PRATOS)
    // ===========================

    const [formPrato, setFormPrato] = useState({
        nome: '',
        ingredientes: []
    });
    const [mostrarFormPrato, setMostrarFormPrato] = useState(false);

    // ===========================
    // ESTADOS DO FORMULÁRIO (ESTOQUE)
    // ===========================

    const [formEstoque, setFormEstoque] = useState({
        ingredienteId: '',
        quantidade: '',
        tipoMovimentacao: 'ENTRADA'
    });

    // ===========================
    // MENSAGENS DE FEEDBACK
    // ===========================

    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // ===========================
    // CARREGAMENTO INICIAL
    // ===========================

    useEffect(() => {
        // Formatar data atual
        const hoje = new Date();
        setDataAtual(
            hoje.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        );

        // Verificar sessão do usuário
        const usuarioStr = localStorage.getItem('usuario');

        if (!usuarioStr) {
            setMensagem({
                texto: 'Usuario nao esta logado! Redirecionando...',
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
            setNomeUsuario(user.nome || '');

            if (user.escola) {
                setEscola(user.escola);
            }

            // Buscar dados do backend
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

                    // Buscar pratos
                    const pratosRes = await axios.get(
                        'http://localhost:5000/admin/pratos'
                    );
                    setPratos(pratosRes.data);

                    // Calcular análises
                    calcularAnalises(cardapioRes.data, estoqueRes.data, pratosRes.data);

                } catch (error) {
                    console.error('Erro ao buscar dados:', error);
                    setMensagem({
                        texto: 'Erro ao carregar dados. Verifique se o backend esta rodando.',
                        tipo: 'erro'
                    });
                } finally {
                    setLoading(false);
                }
            };

            buscarDados();

        } catch (error) {
            console.error('Erro ao processar usuario:', error);
            setMensagem({
                texto: 'Erro ao carregar dados do usuario.',
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

    function calcularAnalises(cardapios, estoqueItems, pratosList) {
        const totalRefeicoes = cardapios.length;
        const totalPratos = pratosList.length;
        const totalIngredientes = estoqueItems.length;
        const totalEstoque = estoqueItems.reduce((acc, item) => acc + Number(item.quantidade), 0);

        setAnalises({
            totalRefeicoes,
            totalPratos,
            totalIngredientes,
            totalEstoque
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

    async function listarCardapios() {
        try {
            const res = await axios.get('http://localhost:5000/admin/cardapio');
            setCardapios(res.data);
        } catch (error) {
            console.error('Erro ao listar cardapios:', error);
            setMensagem({ texto: 'Erro ao listar cardapios.', tipo: 'erro' });
        }
    }

    async function criarCardapio(e) {
        e.preventDefault();

        if (!formCardapio.turmaId || !formCardapio.pratoId || !formCardapio.dataRefeicao) {
            setMensagem({ texto: 'Preencha todos os campos obrigatorios.', tipo: 'erro' });
            return;
        }

        try {
            const payload = {
                ...formCardapio,
                escolaId: usuario?.escolaId || 1,
                dataRefeicao: new Date(formCardapio.dataRefeicao).toISOString()
            };

            await axios.post('http://localhost:5000/admin/cardapio', payload);

            setMensagem({ texto: 'Cardapio criado com sucesso!', tipo: 'sucesso' });
            setFormCardapio({ dataRefeicao: '', horario: '', turmaId: '', pratoId: '', restricaoId: '' });
            listarCardapios();

        } catch (error) {
            console.error('Erro ao criar cardapio:', error);
            setMensagem({ texto: 'Erro ao criar cardapio.', tipo: 'erro' });
        }
    }

    async function excluirCardapio(id) {
        if (!window.confirm('Tem certeza que deseja excluir este cardapio?')) return;

        try {
            await axios.delete(`http://localhost:5000/admin/cardapio/${id}`);
            setMensagem({ texto: 'Cardapio excluido com sucesso!', tipo: 'sucesso' });
            listarCardapios();
        } catch (error) {
            console.error('Erro ao excluir cardapio:', error);
            setMensagem({ texto: 'Erro ao excluir cardapio.', tipo: 'erro' });
        }
    }

    // ===========================
    // FUNÇÕES: PRATOS (CRUD)
    // ===========================

    async function listarPratos() {
        try {
            const res = await axios.get('http://localhost:5000/admin/pratos');
            setPratos(res.data);
        } catch (error) {
            console.error('Erro ao listar pratos:', error);
            setMensagem({ texto: 'Erro ao listar pratos.', tipo: 'erro' });
        }
    }

    async function criarPrato(e) {
        e.preventDefault();

        if (!formPrato.nome || formPrato.ingredientes.length === 0) {
            setMensagem({ texto: 'Preencha o nome e adicione pelo menos um ingrediente.', tipo: 'erro' });
            return;
        }

        try {
            await axios.post('http://localhost:5000/admin/pratos', formPrato);
            setMensagem({ texto: 'Prato criado com sucesso!', tipo: 'sucesso' });
            setFormPrato({ nome: '', ingredientes: [] });
            setMostrarFormPrato(false);
            listarPratos();
        } catch (error) {
            console.error('Erro ao criar prato:', error);
            setMensagem({ texto: 'Erro ao criar prato.', tipo: 'erro' });
        }
    }

    async function excluirPrato(id) {
        if (!window.confirm('Tem certeza que deseja excluir este prato?')) return;

        try {
            await axios.delete(`http://localhost:5000/admin/pratos/${id}`);
            setMensagem({ texto: 'Prato excluido com sucesso!', tipo: 'sucesso' });
            listarPratos();
        } catch (error) {
            console.error('Erro ao excluir prato:', error);
            setMensagem({ texto: 'Erro ao excluir prato.', tipo: 'erro' });
        }
    }

    function adicionarIngrediente() {
        setFormPrato({
            ...formPrato,
            ingredientes: [
                ...formPrato.ingredientes,
                { ingredienteId: '', quantidade: '' }
            ]
        });
    }

    function removerIngrediente(index) {
        const novosIngredientes = formPrato.ingredientes.filter((_, i) => i !== index);
        setFormPrato({ ...formPrato, ingredientes: novosIngredientes });
    }

    function atualizarIngrediente(index, campo, valor) {
        const novosIngredientes = [...formPrato.ingredientes];
        novosIngredientes[index][campo] = valor;
        setFormPrato({ ...formPrato, ingredientes: novosIngredientes });
    }

    // ===========================
    // FUNÇÕES: ESTOQUE
    // ===========================

    async function listarEstoque() {
        try {
            const res = await axios.get(`http://localhost:5000/admin/estoque?escolaId=${usuario?.escolaId || 1}`);
            setEstoque(res.data);
        } catch (error) {
            console.error('Erro ao listar estoque:', error);
            setMensagem({ texto: 'Erro ao listar estoque.', tipo: 'erro' });
        }
    }

    async function registrarMovimentacao(e) {
        e.preventDefault();

        if (!formEstoque.ingredienteId || !formEstoque.quantidade) {
            setMensagem({ texto: 'Preencha o ingrediente e a quantidade.', tipo: 'erro' });
            return;
        }

        const itemNoEstoque = estoque.find(item =>
            item.ingredienteId === parseInt(formEstoque.ingredienteId)
        );

        if (!itemNoEstoque) {
            setMensagem({
                texto: 'Este ingrediente ainda não foi inicializado no estoque da sua escola.',
                tipo: 'erro'
            });
            return;
        }

        try {
            await axios.post('http://localhost:5000/admin/estoque/movimentacao', {
                estoqueId: itemNoEstoque.id,
                tipo: formEstoque.tipoMovimentacao,
                quantidade: parseFloat(formEstoque.quantidade)
            });

            setMensagem({ texto: 'Movimentação registrada com sucesso!', tipo: 'sucesso' });
            setFormEstoque({ ingredienteId: '', quantidade: '', tipoMovimentacao: 'ENTRADA' });
            listarEstoque();

        } catch (error) {
            console.error('Erro ao registrar:', error);
            setMensagem({ texto: 'Erro ao salvar. Verifique se o backend está rodando.', tipo: 'erro' });
        }
    }

    // ===========================
    // RENDERIZAÇÃO: LOADING
    // ===========================

    // Dados para os Gráficos
    const dadosEstoque = {
        labels: estoque.map(i => i.ingrediente?.nome || 'Item'),
        datasets: [{ 
            label: 'Qtd em KG', 
            data: estoque.map(i => i.quantidade), 
            backgroundColor: '#2E7D32',
            borderRadius: 4
        }]
    };

    const dadosPratos = {
        labels: pratos.slice(0, 5).map(p => p.nome),
        datasets: [{
            data: pratos.slice(0, 5).map(p => cardapios.filter(c => c.pratoId === p.id).length),
            backgroundColor: ['#2E7D32', '#1B5E20', '#FB8C00', '#E65100', '#4CAF50']
        }]
    };

    const dadosComplexidade = {
        labels: pratos.map(p => p.nome),
        datasets: [{
            fill: true, 
            label: 'Nº de Ingredientes', 
            data: pratos.map(p => p.ingredientes?.length || 0),
            borderColor: '#2E7D32', 
            backgroundColor: 'rgba(46, 125, 50, 0.1)', 
            tension: 0.4
        }]
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Carregando...</div>
                    <div className="loading-subtext">Preparando o painel administrativo</div>
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
            // 1. MODULO: CARDAPIO
            // ============================================

            case "cardapio":
                return (
                    <div className="content-box">
                        <h2>GERENCIAMENTO DE CARDÁPIO</h2>

                        <div className="form-section">
                            <h3>Criar Novo Cardápio</h3>
                            <form onSubmit={criarCardapio}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Data</label>
                                        <input
                                            type="date"
                                            value={formCardapio.dataRefeicao}
                                            onChange={(e) => setFormCardapio({ ...formCardapio, dataRefeicao: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Horário</label>
                                        <input
                                            type="time"
                                            value={formCardapio.horario}
                                            onChange={(e) => setFormCardapio({ ...formCardapio, horario: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Turma</label>
                                        <select
                                            value={formCardapio.turmaId}
                                            onChange={(e) => setFormCardapio({ ...formCardapio, turmaId: e.target.value })}
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {turmas.map(t => (
                                                <option key={t.id} value={t.id}>{t.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Prato</label>
                                        <select
                                            value={formCardapio.pratoId}
                                            onChange={(e) => setFormCardapio({ ...formCardapio, pratoId: e.target.value })}
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {pratos.map(p => (
                                                <option key={p.id} value={p.id}>{p.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Restrição (opcional)</label>
                                        <select
                                            value={formCardapio.restricaoId}
                                            onChange={(e) => setFormCardapio({ ...formCardapio, restricaoId: e.target.value })}
                                        >
                                            <option value="">Nenhuma</option>
                                            {restricoes.map(r => (
                                                <option key={r.id} value={r.id}>{r.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <br />
                                <button type="submit" className="btn-primary">
                                    Criar Cardápio
                                </button>
                            </form>
                        </div>

                        <div className="table-section">
                            <h3>Cardápios Cadastrados</h3>
                            {cardapios.length === 0 ? (
                                <p className="empty-message">Nenhum cardápio cadastrado.</p>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Horário</th>
                                                <th>Turma</th>
                                                <th>Prato</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cardapios.map(c => (
                                                <tr key={c.id}>
                                                    <td>
                                                        {new Date(c.dataRefeicao).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td>{c.horario}</td>
                                                    <td>{c.turma?.nome || 'N/A'}</td>
                                                    <td>{c.prato?.nome || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => excluirCardapio(c.id)}
                                                            className="btn-danger btn-sm"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );

            // ============================================
            // 2. MODULO: PRATOS
            // ============================================

            case "pratos":
                return (
                    <div className="content-box">
                        <h2>GERENCIAMENTO DE PRATOS</h2>

                        <button
                            onClick={() => setMostrarFormPrato(!mostrarFormPrato)}
                            className={`btn-${mostrarFormPrato ? 'secondary' : 'primary'}`}
                        >
                            {mostrarFormPrato ? '❌ Cancelar' : 'Novo Prato'}
                        </button>

                        {mostrarFormPrato && (
                            <div className="form-section">
                                <h3>Criar Novo Prato</h3>
                                <form onSubmit={criarPrato}>
                                    <div className="form-group">
                                        <label>Nome do Prato</label>
                                        <input
                                            type="text"
                                            value={formPrato.nome}
                                            onChange={(e) => setFormPrato({ ...formPrato, nome: e.target.value })}
                                            placeholder="Ex: Arroz com Feijão"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Ingredientes</label>
                                        {formPrato.ingredientes.map((ing, index) => (
                                            <div key={index} className="ingredient-row">
                                                <select
                                                    value={ing.ingredienteId}
                                                    onChange={(e) => atualizarIngrediente(index, 'ingredienteId', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Selecione</option>
                                                    {ingredientes.map(i => (
                                                        <option key={i.id} value={i.id}>{i.nome}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Quantidade (kg)"
                                                    value={ing.quantidade}
                                                    onChange={(e) => atualizarIngrediente(index, 'quantidade', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removerIngrediente(index)}
                                                    className="btn-danger btn-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={adicionarIngrediente}
                                            className="btn-success btn-sm"
                                        >
                                            Adicionar Ingrediente
                                        </button>
                                    </div>

                                    <button type="submit" className="btn-primary">
                                        Salvar Prato
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="table-section">
                            <h3>Pratos Cadastrados</h3>
                            {pratos.length === 0 ? (
                                <p className="empty-message">Nenhum prato cadastrado.</p>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Ingredientes</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pratos.map(p => (
                                                <tr key={p.id}>
                                                    <td><strong>{p.nome}</strong></td>
                                                    <td>
                                                        {p.ingredientes && p.ingredientes.length > 0 ? (
                                                            p.ingredientes.map(pi =>
                                                                `${pi.ingrediente?.nome || 'N/A'} (${pi.quantidade}kg)`
                                                            ).join(', ')
                                                        ) : (
                                                            <span className="text-muted">Sem ingredientes</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => excluirPrato(p.id)}
                                                            className="btn-danger btn-sm"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );

            // ============================================
            // 3. MODULO: ANALISE
            // ============================================

            case "analise":
                return (
                    <div className="content-box">
                        <h2>ANÁLISE DE DADOS</h2>

                        <div className="dashboard-cards">
                            <div className="dashboard-card">
                                <div className="card-icon"></div>
                                <div className="card-number">{analises.totalRefeicoes}</div>
                                <div className="card-label">Total de Refeições</div>
                            </div>
                            <div className="dashboard-card">
                                <div className="card-icon"></div>
                                <div className="card-number">{analises.totalPratos}</div>
                                <div className="card-label">Pratos Cadastrados</div>
                            </div>
                            <div className="dashboard-card">
                                <div className="card-icon"></div>
                                <div className="card-number">{analises.totalEstoque}kg</div>
                                <div className="card-label">Total em Estoque</div>
                            </div>
                            <div className="dashboard-card">
                                <div className="card-icon"></div>
                                <div className="card-number">{turmas.length}</div>
                                <div className="card-label">Turmas Ativas</div>
                            </div>
                        </div>

                        <div className="charts-grid">
                            <div className="chart-container">
                                <h3>Níveis de Estoque (KG)</h3>
                                <div className="chart-wrapper">
                                    <Bar data={dadosEstoque} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="chart-container">
                                <h3>Frequência de Pratos</h3>
                                <div className="chart-wrapper">
                                    <Doughnut data={dadosPratos} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="chart-container chart-full-width">
                                <h3>Complexidade (Ingredientes por Prato)</h3>
                                <div className="chart-wrapper">
                                    <Line data={dadosComplexidade} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            // ============================================
            // 4. MODULO: ESTOQUE
            // ============================================

            case "estoque":
                return (
                    <div className="content-box">
                        <h2>GESTÃO DE ESTOQUE</h2>

                        <div className="form-section">
                            <h3>Registrar Movimentação</h3>
                            <form onSubmit={registrarMovimentacao}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Ingrediente</label>
                                        <select
                                            value={formEstoque.ingredienteId}
                                            onChange={(e) => setFormEstoque({ ...formEstoque, ingredienteId: e.target.value })}
                                            required
                                        >
                                            <option value="">Selecione o ingrediente</option>
                                            {ingredientes.map(ing => (
                                                <option key={ing.id} value={ing.id}>
                                                    {ing.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo</label>
                                        <select
                                            value={formEstoque.tipoMovimentacao}
                                            onChange={(e) => setFormEstoque({ ...formEstoque, tipoMovimentacao: e.target.value })}
                                            required
                                        >
                                            <option value="ENTRADA">Entrada</option>
                                            <option value="SAIDA">Saída</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quantidade (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formEstoque.quantidade}
                                            onChange={(e) => setFormEstoque({ ...formEstoque, quantidade: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <br />
                                <button type="submit" className="btn-success">
                                    Registrar Movimentação
                                </button>
                            </form>
                        </div>

                        <div className="table-section">
                            <h3>Estoque Atual</h3>
                            {estoque.length === 0 ? (
                                <p className="empty-message">Nenhum item no estoque.</p>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Ingrediente</th>
                                                <th>Quantidade (kg)</th>
                                                <th>Validade</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estoque.map(item => {
                                                const hoje = new Date();
                                                const validade = new Date(item.validade);
                                                const estaVencido = validade < hoje;
                                                const vaiVencer = (validade - hoje) / (1000 * 60 * 60 * 24) < 7 && !estaVencido;

                                                return (
                                                    <tr key={item.id}>
                                                        <td><strong>{item.ingrediente?.nome || 'N/A'}</strong></td>
                                                        <td>{item.quantidade}</td>
                                                        <td>{new Date(item.validade).toLocaleDateString('pt-BR')}</td>
                                                        <td>
                                                            {estaVencido ? (
                                                                <span className="status-badge status-vencido">🔴 Vencido</span>
                                                            ) : vaiVencer ? (
                                                                <span className="status-badge status-alerta">🟡 Vence em breve</span>
                                                            ) : (
                                                                <span className="status-badge status-ok">🟢 OK</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    // ===========================
    // RENDERIZACAO PRINCIPAL
    // ===========================

    return (
        <div className="admin-page">
            {/* ================= HEADER ================= */}
            <header className="admin-header">
                <div className="header-left">
                    <h1>{escola || "ESCOLA MUNICIPAL"}</h1>
                </div>
                <div className="header-right">
                    <h2>{dataAtual}</h2>
                    <LogoutButton />
                </div>
            </header>

            {/* ================= MENSAGENS ================= */}
            {mensagem.texto && (
                <div className={`mensagem ${mensagem.tipo}`}>
                    {mensagem.texto}
                </div>
            )}

            {/* ================= BODY ================= */}
            <div className="admin-body">
                {/* ================= SIDEBAR ================= */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <span className="sidebar-icon"></span>
                        <h3>ADMIN</h3>
                    </div>

                    <button
                        onClick={() => setMenuAtivo("cardapio")}
                        className={menuAtivo === "cardapio" ? "active" : ""}
                    >
                        Cardápio
                    </button>

                    <button
                        onClick={() => setMenuAtivo("pratos")}
                        className={menuAtivo === "pratos" ? "active" : ""}
                    >
                        Pratos
                    </button>

                    <button
                        onClick={() => setMenuAtivo("analise")}
                        className={menuAtivo === "analise" ? "active" : ""}
                    >
                        Análise
                    </button>

                    <button
                        onClick={() => setMenuAtivo("estoque")}
                        className={menuAtivo === "estoque" ? "active" : ""}
                    >
                        Estoque
                    </button>
                </aside>

                {/* ================= CONTENT ================= */}
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="admin-footer">
                Protótipo da página do administrador desenvolvido pela equipe <span>Try Catcher</span> - Hackathon 2026
            </footer>
        </div>
    );
}

export default AdminPage;