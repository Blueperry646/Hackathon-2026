/**
 * PÁGINA DO ADMINISTRADOR
 * 
 * Este é o "centro de comando" da escola. Aqui o administrador pode:
 * 1. Gerenciar o cardápio (datas, turmas e pratos).
 * 2. Criar novos pratos e seus ingredientes.
 * 3. Acompanhar indicadores (estoque, pratos mais usados).
 * 4. Controlar o estoque de ingredientes (entrada/saída).
 */

import { useEffect, useState } from "react";
import axios from 'axios';
import LogoutButton from '../../components/LogoutButton';
import "./style.css";

// Configuração dos gráficos (Chart.js)
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

function AdminPage() {
    // --- ESTADOS GERAIS ---
    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");
    const [menuAtivo, setMenuAtivo] = useState("cardapio");
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // --- DADOS DO SISTEMA ---
    const [cardapios, setCardapios] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [pratos, setPratos] = useState([]);
    const [restricoes, setRestricoes] = useState([]);
    const [estoque, setEstoque] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [analises, setAnalises] = useState({ totalRefeicoes: 0, totalPratos: 0, totalIngredientes: 0, totalEstoque: 0 });

    // --- FORMULÁRIOS ---
    const [formCardapio, setFormCardapio] = useState({ dataRefeicao: '', horario: '', turmaId: '', pratoId: '', restricaoId: '' });
    const [formPrato, setFormPrato] = useState({ nome: '', ingredientes: [] });
    const [mostrarFormPrato, setMostrarFormPrato] = useState(false);
    const [formEstoque, setFormEstoque] = useState({ ingredienteId: '', quantidade: '', tipoMovimentacao: 'ENTRADA' });

    // =========================================================================
    // CARREGAMENTO INICIAL
    // Busca todos os dados necessários no banco ao abrir a página.
    // =========================================================================
    useEffect(() => {
        const hoje = new Date();
        setDataAtual(hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }));

        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) { window.location.href = '/'; return; }
        
        const user = JSON.parse(usuarioStr);
        setEscola(user.escola || "ESCOLA");

        const carregarDados = async () => {
            try {
                setLoading(true);
                const eId = user.escolaId || 1;
                
                // Requisições paralelas para carregar tudo mais rápido
                const [c, est, ing, t, res, pr] = await Promise.all([
                    axios.get('http://localhost:5000/admin/cardapio'),
                    axios.get(`http://localhost:5000/admin/estoque?escolaId=${eId}`),
                    axios.get('http://localhost:5000/ingredientes'),
                    axios.get(`http://localhost:5000/contador/turmas?escolaId=${eId}`),
                    axios.get('http://localhost:5000/contador/restricoes'),
                    axios.get('http://localhost:5000/admin/pratos')
                ]);

                setCardapios(c.data);
                setEstoque(est.data);
                setIngredientes(ing.data);
                setTurmas(t.data);
                setRestricoes(res.data);
                setPratos(pr.data);
                
                // Calcula resumos para os cards de análise
                setAnalises({
                    totalRefeicoes: c.data.length,
                    totalPratos: pr.data.length,
                    totalEstoque: est.data.reduce((acc, item) => acc + Number(item.quantidade), 0)
                });
            } catch (err) { setMensagem({ texto: 'Erro ao carregar dados.', tipo: 'erro' }); }
            finally { setLoading(false); }
        };
        carregarDados();
    }, []);

    // --- FUNÇÕES DE APOIO ---
    const exibirMensagem = (texto, tipo) => {
        setMensagem({ texto, tipo });
        setTimeout(() => setMensagem({ texto: '', tipo: '' }), 5000);
    };

    // --- GRÁFICOS ---
    const dadosEstoque = { labels: estoque.map(i => i.ingrediente?.nome || 'Item'), datasets: [{ label: 'KG', data: estoque.map(i => i.quantidade), backgroundColor: '#0b5ea8' }] };
    const dadosPratos = { labels: pratos.slice(0, 5).map(p => p.nome), datasets: [{ data: pratos.slice(0, 5).map(p => cardapios.filter(c => c.pratoId === p.id).length), backgroundColor: ['#0b5ea8', '#28a745', '#ffc107', '#dc3545', '#6c757d'] }] };
    const dadosComplexidade = { labels: pratos.map(p => p.nome), datasets: [{ label: 'Nº Ingredientes', data: pratos.map(p => p.ingredientes?.length || 0), borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.1)', fill: true }] };

    if (loading) return <div>Carregando painel...</div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>{escola}</h1>
                <div style={{ display: 'flex', gap: '20px' }}><h2>{dataAtual}</h2><LogoutButton /></div>
            </header>

            <div className="admin-body">
                <aside className="sidebar">
                    <button onClick={() => setMenuAtivo("cardapio")}>Cardápio</button>
                    <button onClick={() => setMenuAtivo("pratos")}>Pratos</button>
                    <button onClick={() => setMenuAtivo("analise")}>Análise</button>
                    <button onClick={() => setMenuAtivo("estoque")}>Estoque</button>
                </aside>

                <main className="admin-content">
                    {mensagem.texto && <div className="alert">{mensagem.texto}</div>}
                    
                    {/* Renderização baseada no menu ativo */}
                    {menuAtivo === "cardapio" && (
                        <div>
                            <h2>Cardápio</h2>
                            {/* Formulário e Lista de Cardápios */}
                        </div>
                    )}
                    
                    {menuAtivo === "analise" && (
                        <div>
                            <h2>Indicadores</h2>
                            <div className="charts-grid">
                                <div className="chart-container"><Bar data={dadosEstoque} /></div>
                                <div className="chart-container"><Doughnut data={dadosPratos} /></div>
                                <div className="chart-container"><Line data={dadosComplexidade} /></div>
                            </div>
                        </div>
                    )}
                    {/* ... outros módulos seguem a mesma lógica ... */}
                </main>
            </div>
        </div>
    );
}

export default AdminPage;