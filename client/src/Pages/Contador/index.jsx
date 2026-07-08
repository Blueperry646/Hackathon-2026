import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import LogoutButton from '../../components/LogoutButton';

/**
 * Página do Contador
 * 
 * Funcionalidades:
 * - Selecionar turma para confirmação de refeições
 * - Informar quantidade total de alunos que irão comer
 * - Registrar quantidade de alunos com restrições alimentares
 * - Enviar confirmação para o backend
 */

function Contador() {
    // ===========================
    // ESTADOS DO CABEÇALHO
    // ===========================

    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");

    // ===========================
    // DADOS DO BACKEND
    // ===========================

    const [turmas, setTurmas] = useState([]);
    const [restricoes, setRestricoes] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===========================
    // ESTADOS DO FORMULÁRIO
    // ===========================

    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    const [totalAlunos, setTotalAlunos] = useState("");
    const [valoresRestricoes, setValoresRestricoes] = useState({});
    const [enviando, setEnviando] = useState(false);

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

                    // Buscar turmas (usando escolaId do usuário)
                    const escolaId = usuario.escolaId || 1;
                    const turmasRes = await axios.get(
                        `http://localhost:5000/contador/turmas?escolaId=${escolaId}`
                    );
                    setTurmas(turmasRes.data);

                    // Buscar restrições alimentares
                    const restricoesRes = await axios.get(
                        'http://localhost:5000/contador/restricoes'
                    );
                    setRestricoes(restricoesRes.data);

                    // Inicializar valores das restrições com 0
                    const inicial = {};
                    restricoesRes.data.forEach(r => {
                        inicial[r.id] = 0;
                    });
                    setValoresRestricoes(inicial);

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
    // FUNÇÃO: ATUALIZAR RESTRIÇÃO
    // ===========================

    function handleRestricaoChange(id, valor) {
        setValoresRestricoes(prev => ({
            ...prev,
            [id]: valor === "" ? 0 : Number(valor)
        }));
    }

    // ===========================
    // FUNÇÃO: ENVIAR CONFIRMAÇÃO
    // ===========================

    async function enviarConfirmacao() {
        // ============================================
        // 1. VALIDAÇÕES
        // ============================================

        // Verificar se o usuário está logado
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

        // Verificar se uma turma foi selecionada
        if (!turmaSelecionada) {
            setMensagem({ texto: 'Por favor, selecione uma turma.', tipo: 'erro' });
            return;
        }

        // Verificar se o total de alunos foi informado
        if (!totalAlunos || parseInt(totalAlunos) <= 0) {
            setMensagem({ texto: 'Por favor, informe o total de alunos que irão comer.', tipo: 'erro' });
            return;
        }

        // Verificar se o total de alunos é maior que as restrições
        const totalRestricoes = Object.values(valoresRestricoes).reduce((a, b) => a + b, 0);
        if (totalRestricoes > parseInt(totalAlunos)) {
            setMensagem({
                texto: `O total de alunos com restrições (${totalRestricoes}) não pode ser maior que o total de alunos (${totalAlunos}).`,
                tipo: 'erro'
            });
            return;
        }

        // ============================================
        // 2. MONTAR PAYLOAD
        // ============================================

        const restricoesArray = restricoes
            .map(r => ({
                restricaoId: r.id,
                quantidade: valoresRestricoes[r.id] || 0
            }))
            .filter(r => r.quantidade > 0);

        const payload = {
            turmaId: parseInt(turmaSelecionada),
            totalAlunos: parseInt(totalAlunos),
            restricoes: restricoesArray
        };

        // ============================================
        // 3. ENVIAR PARA O BACKEND
        // ============================================

        setEnviando(true);
        setMensagem({ texto: 'Enviando confirmação...', tipo: 'info' });

        try {
            const response = await axios.post(
                'http://localhost:5000/contador/confirmacao',
                payload
            );

            if (response.status === 201) {
                setMensagem({
                    texto: 'Confirmação enviada com sucesso!',
                    tipo: 'sucesso'
                });

                // ============================================
                // 4. RESETAR FORMULÁRIO
                // ============================================
                setTurmaSelecionada("");
                setTotalAlunos("");

                // Resetar restrições para 0
                const resetRestricoes = {};
                restricoes.forEach(r => {
                    resetRestricoes[r.id] = 0;
                });
                setValoresRestricoes(resetRestricoes);
            }

        } catch (error) {
            console.error('Erro ao enviar confirmação:', error);

            let mensagemErro = 'Erro ao enviar confirmação. ';

            if (error.response) {
                mensagemErro += error.response.data?.error || 'Tente novamente.';
            } else if (error.request) {
                mensagemErro += 'Verifique se o backend está rodando.';
            } else {
                mensagemErro += 'Tente novamente mais tarde.';
            }

            setMensagem({ texto: `${mensagemErro}`, tipo: 'erro' });
        } finally {
            setEnviando(false);
        }
    }

    // ===========================
    // RENDERIZAÇÃO: LOADING
    // ===========================

    if (loading) {
        return (
            <div className="contador-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Carregando...</div>
                    <div className="loading-subtext">Preparando os dados do contador</div>
                </div>
            </div>
        );
    }

    // ===========================
    // RENDERIZAÇÃO PRINCIPAL
    // ===========================

    const totalRestricoes = Object.values(valoresRestricoes).reduce((a, b) => a + b, 0);
    const totalAlunosNum = parseInt(totalAlunos) || 0;

    return (
        <div className="contador-page">
            {/* ================= HEADER ================= */}
            <header className="contador-header">
                <div className="header-left">
                    <h1>{escola || "ESCOLA MUNICIPAL"}</h1>
                </div>
                <div className="header-right">
                    <h2>{dataAtual}</h2>
                    <LogoutButton />
                </div>
            </header>

            {/* ================= MENSAGENS DE FEEDBACK ================= */}
            {mensagem.texto && (
                <div className={`mensagem ${mensagem.tipo}`}>
                    {mensagem.texto}
                </div>
            )}

            {/* ================= CONTEÚDO PRINCIPAL ================= */}
            <div className="contador-body">
                <div className="contador-card">

                    {/* ================= TÍTULO DO CARD ================= */}
                    <div className="card-title">
                        CONFIRMAÇÃO DE REFEIÇÕES
                    </div>

                    {/* ================= SELEÇÃO DE TURMA ================= */}
                    <div className="contador-row">
                        <span className="contador-label">
                            TURMA
                        </span>

                        <select
                            value={turmaSelecionada}
                            onChange={(e) => setTurmaSelecionada(e.target.value)}
                            disabled={enviando}
                        >
                            <option value="">
                                Selecione uma turma
                            </option>

                            {turmas.length === 0 ? (
                                <option value="" disabled>
                                    Nenhuma turma disponível
                                </option>
                            ) : (
                                turmas.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nome}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* ================= TOTAL DE ALUNOS ================= */}
                    <div className="contador-row">
                        <span className="contador-label">
                            IRÃO COMER
                        </span>

                        <input
                            type="number"
                            min="0"
                            placeholder="Digite o total de alunos"
                            value={totalAlunos}
                            onChange={(e) => setTotalAlunos(e.target.value)}
                            disabled={enviando}
                        />
                    </div>

                    {/* ================= RESTRIÇÕES ALIMENTARES ================= */}
                    <div className="restricoes-section">
                        <div className="restricoes-header">
                            <span className="restricoes-icon"></span>
                            <span>ALUNOS COM RESTRIÇÕES ALIMENTARES</span>
                        </div>

                        <div className="restricoes-grid">
                            {restricoes.length === 0 ? (
                                <div className="no-restricoes">
                                    Nenhuma restrição cadastrada.
                                </div>
                            ) : (
                                restricoes.map(r => (
                                    <div className="restricao-item" key={r.id}>
                                        <label>
                                            {r.nome}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={valoresRestricoes[r.id] || 0}
                                            onChange={(e) =>
                                                handleRestricaoChange(r.id, e.target.value)
                                            }
                                            disabled={enviando}
                                            placeholder="0"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ================= TOTALIZADOR ================= */}
                    <div className="totalizador">
                        <div className="totalizador-item">
                            <span className="totalizador-label">Total de alunos</span>
                            <span className="totalizador-valor principal">
                                {totalAlunosNum}
                            </span>
                        </div>

                        {totalRestricoes > 0 && (
                            <div className="totalizador-item">
                                <span className="totalizador-label">Com restrições</span>
                                <span className="totalizador-valor destaque">
                                    {totalRestricoes}
                                </span>
                            </div>
                        )}

                        <div className="totalizador-item">
                            <span className="totalizador-label">Sem restrições</span>
                            <span className="totalizador-valor secundario">
                                {totalAlunosNum - totalRestricoes}
                            </span>
                        </div>
                    </div>

                    {/* ================= BOTÃO DE ENVIO ================= */}
                    <button
                        className={`contador-btn ${enviando ? 'loading' : ''}`}
                        onClick={enviarConfirmacao}
                        disabled={enviando || turmas.length === 0}
                    >
                        {enviando ? '⏳ ENVIANDO...' : 'ENVIAR CONFIRMAÇÃO'}
                    </button>

                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="contador-footer">
                Protótipo da página do contador feito pela equipe <span>Try Catcher</span> - Hackathon 2026
            </footer>
        </div>
    );
}

export default Contador;