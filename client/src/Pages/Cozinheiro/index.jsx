import { useEffect, useState } from "react";
import axios from 'axios';
import "./style.css";
import LogoutButton from '../../components/LogoutButton';

/**
 * Página do Cozinheiro
 * 
 * Funcionalidades:
 * - Visualizar refeições programadas para o dia
 * - Ver ingredientes de cada prato
 * - Registrar produção (horário, kg produzido, kg sobra)
 * - Visualizar histórico de produção do dia
 */

function Cozinheiro() {
    // ===========================
    // ESTADOS DO COMPONENTE
    // ===========================

    // Dados da escola e data
    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");

    // Refeições e ingredientes
    const [refeicoes, setRefeicoes] = useState([]);
    const [mostrarIngredientes, setMostrarIngredientes] = useState(false);

    // Formulário de produção
    const [horaPreparo, setHoraPreparo] = useState("");
    const [kgProduzido, setKgProduzido] = useState("");
    const [kgSobra, setKgSobra] = useState("");
    const [salvando, setSalvando] = useState(false);

    // Histórico
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mensagens de feedback
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
            const usuario = JSON.parse(usuarioStr);

            if (!usuario || !usuario.id) {
                setMensagem({
                    texto: 'Sessão inválida! Redirecionando...',
                    tipo: 'erro'
                });
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }

            // ============================================
            // 3. BUSCAR DADOS DO BACKEND
            // ============================================
            const buscarDados = async () => {
                try {
                    setLoading(true);
                    setMensagem({ texto: '', tipo: '' });

                    // Buscar nome da escola
                    if (usuario.escola) {
                        setEscola(usuario.escola);
                    }

                    // Buscar cardápio do dia (usando o escolaId do usuário)
                    const escolaId = usuario.escolaId || 1;
                    const cardapioRes = await axios.get(
                        `http://localhost:5000/cozinheiro/cardapio/dia?escolaId=${escolaId}`
                    );
                    setRefeicoes(cardapioRes.data);

                    // Buscar histórico de produção do dia
                    const historicoRes = await axios.get(
                        `http://localhost:5000/cozinheiro/historico?usuarioId=${usuario.id}`
                    );
                    setHistorico(historicoRes.data);

                    if (cardapioRes.data.length === 0) {
                        setMensagem({
                            texto: 'Nenhuma refeição programada para hoje.',
                            tipo: 'info'
                        });
                    }

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
    // LIMPAR MENSAGEM APÓS 5 SEGUNDOS
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
    // FUNÇÃO: SALVAR REGISTRO DE PRODUÇÃO
    // ===========================

    async function salvarRegistro() {
        // ============================================
        // 1. VALIDAÇÕES
        // ============================================

        const usuarioStr = localStorage.getItem('usuario');

        if (!usuarioStr) {
            setMensagem({ texto: 'Usuário não está logado!', tipo: 'erro' });
            return;
        }

        const usuario = JSON.parse(usuarioStr);

        if (!usuario || !usuario.id) {
            setMensagem({ texto: 'Sessão inválida!', tipo: 'erro' });
            return;
        }

        if (!refeicoes || refeicoes.length === 0) {
            setMensagem({ texto: 'Não há refeições programadas para hoje!', tipo: 'erro' });
            return;
        }

        if (!horaPreparo) {
            setMensagem({ texto: 'Por favor, selecione o horário de preparo.', tipo: 'erro' });
            return;
        }

        if (!kgProduzido || parseFloat(kgProduzido) <= 0) {
            setMensagem({ texto: 'Por favor, informe a quantidade produzida (kg).', tipo: 'erro' });
            return;
        }

        // ============================================
        // 2. ENVIAR DADOS PARA O BACKEND
        // ============================================

        setSalvando(true);
        setMensagem({ texto: 'Salvando produção...', tipo: 'info' });

        try {
            const response = await axios.post('http://localhost:5000/cozinheiro/producao', {
                cardapioId: refeicoes[0]?.id,
                usuarioId: usuario.id,
                horaPreparo: horaPreparo,
                kgProduzido: parseFloat(kgProduzido),
                kgSobra: kgSobra ? parseFloat(kgSobra) : 0
            });

            if (response.status === 201) {
                setMensagem({
                    texto: 'Produção registrada com sucesso!',
                    tipo: 'sucesso'
                });

                // Limpar campos do formulário
                setHoraPreparo('');
                setKgProduzido('');
                setKgSobra('');

                // Recarregar histórico
                const historicoRes = await axios.get(
                    `http://localhost:5000/cozinheiro/historico?usuarioId=${usuario.id}`
                );
                setHistorico(historicoRes.data);
            }

        } catch (error) {
            console.error('Erro ao registrar produção:', error);

            let mensagemErro = 'Erro ao registrar produção. ';

            if (error.response) {
                mensagemErro += error.response.data?.error || 'Tente novamente.';
            } else if (error.request) {
                mensagemErro += 'Verifique se o backend está rodando.';
            } else {
                mensagemErro += 'Tente novamente mais tarde.';
            }

            setMensagem({ texto: `${mensagemErro}`, tipo: 'erro' });
        } finally {
            setSalvando(false);
        }
    }

    // ===========================
    // FUNÇÃO: FORMATAR HORÁRIO
    // ===========================

function formatarHorario(valor) {
    if (!valor) return '--:--';
    
    // Se já for uma string curta de hora, retorna direto
    if (typeof valor === 'string' && valor.length === 5) return valor;

    try {
        const date = new Date(valor);
        if (isNaN(date.getTime())) return valor;
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    } catch {
        return valor;
    }
}

    // ===========================
    // RENDERIZAÇÃO: LOADING
    // ===========================

    if (loading) {
        return (
            <div className="cook-page">
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
                        Preparando os dados da cozinha
                    </div>
                </div>
            </div>
        );
    }

    // ===========================
    // RENDERIZAÇÃO PRINCIPAL
    // ===========================

    return (
        <div className="cook-page">
            {/* ================= HEADER ================= */}
            <header className="cook-header">
                <div className="header-left">
                    <h1>{escola === "" ? "ESCOLA MUNICIPAL" : escola}</h1>
                </div>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>{dataAtual}</h2>
                    <LogoutButton /> {/* ← ADICIONAR */}
                </div>
            </header>

            {/* ================= MENSAGENS DE FEEDBACK ================= */}
            {mensagem.texto && (
                <div style={{
                    padding: '12px 20px',
                    margin: '10px auto',
                    maxWidth: '1200px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor:
                        mensagem.tipo === 'sucesso' ? '#d4edda' :
                            mensagem.tipo === 'erro' ? '#f8d7da' :
                                mensagem.tipo === 'info' ? '#d1ecf1' : '#f8f9fa',
                    color:
                        mensagem.tipo === 'sucesso' ? '#155724' :
                            mensagem.tipo === 'erro' ? '#721c24' :
                                mensagem.tipo === 'info' ? '#0c5460' : '#383d41',
                    border: '1px solid',
                    borderColor:
                        mensagem.tipo === 'sucesso' ? '#c3e6cb' :
                            mensagem.tipo === 'erro' ? '#f5c6cb' :
                                mensagem.tipo === 'info' ? '#bee5eb' : '#d6d8db'
                }}>
                    {mensagem.texto}
                </div>
            )}

            {/* ================= CORPO PRINCIPAL ================= */}
            <main className="cook-main">

                {/* ================= PAINEL ESQUERDO: REFEIÇÕES ================= */}
                <section className="left-panel">
                    <h2 className="panel-title">REFEIÇÕES PROGRAMADAS</h2>

                    {refeicoes.length === 0 ? (
                        <div className="meal-card empty-card">
                            <h3>Nenhuma refeição programada</h3>
                            <p>As refeições cadastradas para hoje aparecerão aqui.</p>
                        </div>
                    ) : (
                        refeicoes.map((refeicao) => (
                            <div className="meal-card" key={refeicao.id}>
                                <div className="meal-header">
                                    <h3>{formatarHorario(refeicao.horario)}</h3>
                                </div>
                                <div className="meal-info">
                                    <p><strong>Prato:</strong> {refeicao.prato}</p>
                                    <p><strong>Porções:</strong> {refeicao.porcoes}</p>
                                    <p><strong>Especiais:</strong> {refeicao.especiais || 'Nenhum'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {/* ================= PAINEL DIREITO: INGREDIENTES + FORMULÁRIO ================= */}
                <aside className="right-panel">

                    {/* Botão de Ingredientes */}
                    <button
                        className="ingredientes-button"
                        onClick={() => setMostrarIngredientes(!mostrarIngredientes)}
                    >
                        {mostrarIngredientes ? '🔽 OCULTAR PRATOS E INGREDIENTES' : '🔼 EXIBIR PRATOS E INGREDIENTES'}
                    </button>

                    {/* Lista de Ingredientes */}
                    {mostrarIngredientes && (
                        <div className="ingredientes-box">
                            {refeicoes.length === 0 ? (
                                <div className="sem-pratos">Nenhum prato cadastrado.</div>
                            ) : (
                                refeicoes.map((refeicao) => (
                                    <div key={refeicao.id} className="prato-box">
                                        <h3>{refeicao.prato}</h3>
                                        <ul>
                                            {refeicao.ingredientes && refeicao.ingredientes.length > 0 ? (
                                                refeicao.ingredientes.map((ingrediente, index) => (
                                                    <li key={index}>
                                                        {ingrediente.nome}
                                                        {ingrediente.quantidade && ` (${ingrediente.quantidade} kg)`}
                                                    </li>
                                                ))
                                            ) : (
                                                <li style={{ color: '#999' }}>Sem ingredientes cadastrados</li>
                                            )}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ================= FORMULÁRIO DE PRODUÇÃO ================= */}
                    <div className="form-section">
                        <h2 className="panel-title">REGISTRAR PRODUÇÃO</h2>
                        <div className="form-box">

                            <label htmlFor="horaPreparo">Horário de preparo</label>
                            <input
                                id="horaPreparo"
                                type="time"
                                value={horaPreparo}
                                onChange={(e) => setHoraPreparo(e.target.value)}
                                disabled={salvando}
                            />

                            <label htmlFor="kgProduzido">Kg produzidos</label>
                            <input
                                id="kgProduzido"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ex: 10.50"
                                value={kgProduzido}
                                onChange={(e) => setKgProduzido(e.target.value)}
                                disabled={salvando}
                            />

                            <label htmlFor="kgSobra">Kg sobrou (opcional)</label>
                            <input
                                id="kgSobra"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ex: 2.30"
                                value={kgSobra}
                                onChange={(e) => setKgSobra(e.target.value)}
                                disabled={salvando}
                            />

                            <button
                                className="save-button"
                                onClick={salvarRegistro}
                                disabled={salvando}
                                style={{
                                    opacity: salvando ? 0.7 : 1,
                                    cursor: salvando ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {salvando ? '⏳ SALVANDO...' : 'SALVAR'}
                            </button>

                        </div>
                    </div>

                </aside>

            </main>

            {/* ================= HISTÓRICO ================= */}
            <section className="historico-section">
                <h2>HISTÓRICO DE PRODUÇÃO DO DIA</h2>

                {historico.length === 0 ? (
                    <p className="empty-history">
                        Nenhum registro realizado ainda.
                        <br />
                        <span style={{ fontSize: '14px', color: '#999' }}>
                            Comece registrando uma produção acima.
                        </span>
                    </p>
                ) : (
                    <table className="historico-table">
                        <thead>
                            <tr>
                                <th>Horário</th>
                                <th>Prato</th>
                                <th>Kg Produzidos</th>
                                <th>Kg Sobra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historico.map((item, index) => (
                                <tr key={index}>
                                    <td>{formatarHorario(item.horaPreparo)}</td>
                                    <td>{item.cardapio?.prato?.nome || 'N/A'}</td>
                                    <td>{item.kgProduzido ? item.kgProduzido.toFixed(2) : '0.00'}</td>
                                    <td>{item.kgSobra ? item.kgSobra.toFixed(2) : '0.00'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="cook-footer">
                Protótipo da página do cozinheiro desenvolvido pela equipe Try Catcher - Hackathon 2026
            </footer>
        </div>
    );
}

export default Cozinheiro;