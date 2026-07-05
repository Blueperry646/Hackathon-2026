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
                        Preparando os dados do contador
                    </div>
                </div>
            </div>
        );
    }

    // ===========================
    // RENDERIZAÇÃO PRINCIPAL
    // ===========================

    return (
        <div className="contador-page">
            {/* ================= HEADER ================= */}
            <header className="contador-header">
                <h1>{escola || "ESCOLA"}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>{dataAtual}</h2>
                    <LogoutButton /> {/* ← ADICIONAR */}
                </div>
            </header>

            <hr />

            {/* ================= MENSAGENS DE FEEDBACK ================= */}
            {mensagem.texto && (
                <div style={{
                    padding: '12px 20px',
                    margin: '10px auto',
                    maxWidth: '800px',
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

            {/* ================= CONTEÚDO PRINCIPAL ================= */}
            <div className="contador-body">
                <div className="contador-card">

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
                            placeholder="Inserir número"
                            value={totalAlunos}
                            onChange={(e) => setTotalAlunos(e.target.value)}
                            disabled={enviando}
                        />
                    </div>

                    {/* ================= RESTRIÇÕES ALIMENTARES ================= */}
                    <div className="restricoes">
                        <div style={{
                            width: '100%',
                            textAlign: 'center',
                            marginBottom: '15px',
                            fontSize: '14px',
                            color: '#ffffffff'
                        }}>
                            Alunos com restrições alimentares
                        </div>

                        {restricoes.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#ffffffff',
                                padding: '20px'
                            }}>
                                Nenhuma restrição cadastrada.
                            </div>
                        ) : (
                            restricoes.map(r => (
                                <div className="restricao-item" key={r.id}>
                                    <label>
                                        {r.nome.toUpperCase()}
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

                    {/* ================= TOTALIZADOR ================= */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginTop: '10px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>
                            Total de alunos:
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                            {totalAlunos || 0}
                        </span>
                    </div>

                    {Object.values(valoresRestricoes).reduce((a, b) => a + b, 0) > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '5px 20px',
                            fontSize: '14px',
                            color: '#ffffffff'
                        }}>
                            <span>
                                Com restrições:
                            </span>
                            <span style={{ color: '#e74c3c' }}>
                                {Object.values(valoresRestricoes).reduce((a, b) => a + b, 0)}
                            </span>
                        </div>
                    )}

                    {/* ================= BOTÃO DE ENVIO ================= */}
                    <button
                        className="contador-btn"
                        onClick={enviarConfirmacao}
                        disabled={enviando || turmas.length === 0}
                        style={{
                            opacity: (enviando || turmas.length === 0) ? 0.7 : 1,
                            cursor: (enviando || turmas.length === 0) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {enviando ? '⏳ ENVIANDO...' : 'ENVIAR'}
                    </button>

                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="contador-footer">
                Protótipo da página do contador feito pela equipe Try Catcher - Hackathon 2026
            </footer>
        </div>
    );
}

export default Contador;