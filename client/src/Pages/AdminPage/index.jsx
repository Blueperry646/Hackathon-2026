import { useEffect, useState } from "react";
import axios from 'axios';
import LogoutButton from '../../components/LogoutButton';
import "./style.css";

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
            setMensagem({ texto: 'Preencha todos os campos obrigatorios.', tipo: 'erro' });
            return;
        }

        try {
            await axios.post('http://localhost:5000/admin/estoque/movimentacao', {
                estoqueId: parseInt(formEstoque.ingredienteId),
                tipo: formEstoque.tipoMovimentacao,
                quantidade: parseFloat(formEstoque.quantidade)
            });

            setMensagem({ texto: 'Movimentacao registrada com sucesso!', tipo: 'sucesso' });
            setFormEstoque({ ingredienteId: '', quantidade: '', tipoMovimentacao: 'ENTRADA' });
            listarEstoque();

        } catch (error) {
            console.error('Erro ao registrar movimentacao:', error);
            setMensagem({ texto: 'Erro ao registrar movimentacao.', tipo: 'erro' });
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
            // 1. MODULO: CARDAPIO
            // ============================================

            case "cardapio":
                return (
                    <div className="content-box">
                        <h2>GERENCIAMENTO DE CARDAPIO</h2>

                        {mensagem.texto && mensagem.tipo === 'sucesso' && (
                            <div style={{ 
                                color: '#155724', 
                                padding: '12px 16px', 
                                background: '#d4edda', 
                                borderRadius: '4px', 
                                marginBottom: '15px' 
                            }}>
                                {mensagem.texto}
                            </div>
                        )}

                        <div style={{ 
                            background: '#f8fafc', 
                            padding: '20px', 
                            borderRadius: '6px',
                            border: '1px solid #e0e4e8',
                            marginBottom: '20px'
                        }}>
                            <h3>Criar Novo Cardapio</h3>
                            <form onSubmit={criarCardapio} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '15px',
                                marginTop: '15px'
                            }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Data</label>
                                    <input
                                        type="date"
                                        value={formCardapio.dataRefeicao}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, dataRefeicao: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Horario</label>
                                    <input
                                        type="time"
                                        value={formCardapio.horario}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, horario: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Turma</label>
                                    <select
                                        value={formCardapio.turmaId}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, turmaId: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Prato</label>
                                    <select
                                        value={formCardapio.pratoId}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, pratoId: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {pratos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Restricao (opcional)</label>
                                    <select
                                        value={formCardapio.restricaoId}
                                        onChange={(e) => setFormCardapio({ ...formCardapio, restricaoId: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
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
                                        background: '#0b5ea8', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}>
                                        Criar Cardapio
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <h3>Cardapios Cadastrados</h3>
                            {cardapios.length === 0 ? (
                                <p style={{ color: '#999' }}>Nenhum cardapio cadastrado.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Horario</th>
                                            <th>Turma</th>
                                            <th>Prato</th>
                                            <th>Acoes</th>
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
                                                        style={{ 
                                                            padding: '4px 12px', 
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
            // 2. MODULO: PRATOS
            // ============================================

            case "pratos":
                return (
                    <div className="content-box">
                        <h2>GERENCIAMENTO DE PRATOS</h2>

                        {mensagem.texto && mensagem.tipo === 'sucesso' && (
                            <div style={{ 
                                color: '#155724', 
                                padding: '12px 16px', 
                                background: '#d4edda', 
                                borderRadius: '4px', 
                                marginBottom: '15px' 
                            }}>
                                {mensagem.texto}
                            </div>
                        )}

                        <button
                            onClick={() => setMostrarFormPrato(!mostrarFormPrato)}
                            style={{
                                padding: '10px 20px',
                                background: '#0b5ea8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                alignSelf: 'flex-start',
                                marginBottom: '15px'
                            }}
                        >
                            {mostrarFormPrato ? 'Cancelar' : '+ Novo Prato'}
                        </button>

                        {mostrarFormPrato && (
                            <form onSubmit={criarPrato} style={{
                                background: '#f8fafc',
                                padding: '20px',
                                borderRadius: '6px',
                                border: '1px solid #e0e4e8',
                                marginBottom: '20px'
                            }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Nome do Prato</label>
                                    <input
                                        type="text"
                                        value={formPrato.nome}
                                        onChange={(e) => setFormPrato({ ...formPrato, nome: e.target.value })}
                                        placeholder="Ex: Arroz com Feijao"
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Ingredientes</label>
                                    {formPrato.ingredientes.map((ing, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                            <select
                                                value={ing.ingredienteId}
                                                onChange={(e) => atualizarIngrediente(index, 'ingredienteId', e.target.value)}
                                                style={{ flex: 2, padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
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
                                                style={{ flex: 1, padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removerIngrediente(index)}
                                                style={{
                                                    padding: '8px 14px',
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={adicionarIngrediente}
                                        style={{
                                            padding: '6px 14px',
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginTop: '8px'
                                        }}
                                    >
                                        + Adicionar Ingrediente
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        background: '#0b5ea8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        marginTop: '15px'
                                    }}
                                >
                                    Salvar Prato
                                </button>
                            </form>
                        )}

                        <div>
                            <h3>Pratos Cadastrados</h3>
                            {pratos.length === 0 ? (
                                <p style={{ color: '#999' }}>Nenhum prato cadastrado.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Ingredientes</th>
                                            <th>Acoes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pratos.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.nome}</td>
                                                <td>
                                                    {p.ingredientes && p.ingredientes.length > 0 ? (
                                                        p.ingredientes.map(pi => 
                                                            `${pi.ingrediente?.nome || 'N/A'} (${pi.quantidade}kg)`
                                                        ).join(', ')
                                                    ) : (
                                                        'Sem ingredientes'
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => excluirPrato(p.id)}
                                                        style={{
                                                            padding: '4px 12px',
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
            // 3. MODULO: ANALISE
            // ============================================

            case "analise":
                return (
                    <div className="content-box">
                        <h2>ANALISE DE DADOS</h2>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '20px', 
                                borderRadius: '6px',
                                textAlign: 'center',
                                border: '1px solid #e0e4e8'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0b5ea8' }}>
                                    {analises.totalRefeicoes || 0}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Total de Refeicoes</div>
                            </div>

                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '20px', 
                                borderRadius: '6px',
                                textAlign: 'center',
                                border: '1px solid #e0e4e8'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                                    {analises.totalPratos || 0}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Pratos Cadastrados</div>
                            </div>

                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '20px', 
                                borderRadius: '6px',
                                textAlign: 'center',
                                border: '1px solid #e0e4e8'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
                                    {analises.totalIngredientes || 0}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Ingredientes em Estoque</div>
                            </div>

                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '20px', 
                                borderRadius: '6px',
                                textAlign: 'center',
                                border: '1px solid #e0e4e8'
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
                                    {analises.totalEstoque || 0}kg
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Total em Estoque</div>
                            </div>
                        </div>

                        <div style={{ 
                            background: '#f8fafc', 
                            padding: '20px', 
                            borderRadius: '6px',
                            border: '1px solid #e0e4e8'
                        }}>
                            <h3>Funcionalidades em Desenvolvimento:</h3>
                            <ul>
                                <li>Graficos de refeicoes previstas vs realizadas</li>
                                <li>Analise de desperdicio diario</li>
                                <li>Ranking de pratos mais populares</li>
                                <li>Filtros por turma e data</li>
                                <li>Relatorios mensais</li>
                            </ul>
                        </div>
                    </div>
                );

            // ============================================
            // 4. MODULO: ESTOQUE
            // ============================================

            case "estoque":
                return (
                    <div className="content-box">
                        <h2>GESTAO DE ESTOQUE</h2>

                        {mensagem.texto && mensagem.tipo === 'sucesso' && (
                            <div style={{ 
                                color: '#155724', 
                                padding: '12px 16px', 
                                background: '#d4edda', 
                                borderRadius: '4px', 
                                marginBottom: '15px' 
                            }}>
                                {mensagem.texto}
                            </div>
                        )}

                        <div style={{ 
                            background: '#f8fafc', 
                            padding: '20px', 
                            borderRadius: '6px',
                            border: '1px solid #e0e4e8',
                            marginBottom: '20px'
                        }}>
                            <h3>Registrar Movimentacao</h3>
                            <form onSubmit={registrarMovimentacao} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr 1fr', 
                                gap: '15px',
                                marginTop: '15px'
                            }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Ingrediente</label>
                                    <select
                                        value={formEstoque.ingredienteId}
                                        onChange={(e) => setFormEstoque({ ...formEstoque, ingredienteId: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {ingredientes.map(i => (
                                            <option key={i.id} value={i.id}>{i.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Tipo</label>
                                    <select
                                        value={formEstoque.tipoMovimentacao}
                                        onChange={(e) => setFormEstoque({ ...formEstoque, tipoMovimentacao: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
                                        required
                                    >
                                        <option value="ENTRADA">Entrada</option>
                                        <option value="SAIDA">Saida</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Quantidade (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formEstoque.quantidade}
                                        onChange={(e) => setFormEstoque({ ...formEstoque, quantidade: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d4d8', borderRadius: '4px' }}
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
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}>
                                        Registrar Movimentacao
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <h3>Estoque Atual</h3>
                            {estoque.length === 0 ? (
                                <p style={{ color: '#999' }}>Nenhum item no estoque.</p>
                            ) : (
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
                                                    <td>{item.ingrediente?.nome || 'N/A'}</td>
                                                    <td>{item.quantidade}</td>
                                                    <td>{new Date(item.validade).toLocaleDateString('pt-BR')}</td>
                                                    <td>
                                                        {estaVencido ? (
                                                            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Vencido</span>
                                                        ) : vaiVencer ? (
                                                            <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Vence em breve</span>
                                                        ) : (
                                                            <span style={{ color: '#28a745' }}>OK</span>
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
    // RENDERIZACAO PRINCIPAL
    // ===========================

    return (
        <div className="admin-page">
            {/* ================= HEADER ================= */}
            <header className="admin-header">
                <h1>{escola || "ESCOLA MUNICIPAL"}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                        Cardapio
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
                        Analise de Dados
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
                Prototipo da pagina do administrador desenvolvido pela equipe Try Catcher - Hackathon 2026
            </footer>
        </div>
    );
}

export default AdminPage;