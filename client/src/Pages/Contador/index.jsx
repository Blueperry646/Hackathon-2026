/**
 * PÁGINA DO CONTADOR
 * 
 * Esta página permite que o responsável (contador) informe à cozinha
 * quantos alunos de cada turma irão se alimentar no dia e se há 
 * estudantes com alguma restrição alimentar.
 */

import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import LogoutButton from '../../components/LogoutButton';

/*
===============================================================================
SEÇÃO 1: CONFIGURAÇÕES E ESTADOS
===============================================================================
Aqui definimos as variáveis que a página usa para guardar informações temporárias:
- turmas/restrições: Lista de opções que vêm do banco de dados.
- turmaSelecionada/totalAlunos: Dados preenchidos pelo usuário.
- valoresRestricoes: Um conjunto de números que guarda o total por cada tipo de restrição.
- loading/enviando: Indicadores de que o sistema está trabalhando.
- mensagem: Feedback visual para o usuário (sucesso ou erro).
===============================================================================
*/

function Contador() {
    // --- ESTADOS ---
    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");
    const [turmas, setTurmas] = useState([]);
    const [restricoes, setRestricoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    const [totalAlunos, setTotalAlunos] = useState("");
    const [valoresRestricoes, setValoresRestricoes] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // =========================================================================
    // CARREGAMENTO INICIAL
    // Ao abrir a página, o sistema busca automaticamente a data, valida o login
    // e carrega a lista de turmas e restrições cadastradas.
    // =========================================================================
    useEffect(() => {
        const hoje = new Date();
        setDataAtual(hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }));

        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) {
            setMensagem({ texto: 'Usuário não está logado! Redirecionando...', tipo: 'erro' });
            setTimeout(() => { window.location.href = '/'; }, 2000);
            return;
        }

        try {
            const usuario = JSON.parse(usuarioStr);
            const buscarDados = async () => {
                try {
                    setLoading(true);
                    if (usuario.escola) setEscola(usuario.escola);

                    const escolaId = usuario.escolaId || 1;
                    
                    // Busca lista de turmas e tipos de restrições do servidor
                    const turmasRes = await axios.get(`http://localhost:5000/contador/turmas?escolaId=${escolaId}`);
                    setTurmas(turmasRes.data);

                    const restricoesRes = await axios.get('http://localhost:5000/contador/restricoes');
                    setRestricoes(restricoesRes.data);

                    // Prepara o formulário de restrições iniciando tudo em 0
                    const inicial = {};
                    restricoesRes.data.forEach(r => { inicial[r.id] = 0; });
                    setValoresRestricoes(inicial);

                } catch (error) {
                    setMensagem({ texto: 'Erro ao carregar dados. Verifique o servidor.', tipo: 'erro' });
                } finally {
                    setLoading(false);
                }
            };
            buscarDados();
        } catch (error) {
            setMensagem({ texto: 'Erro ao carregar dados do usuário.', tipo: 'erro' });
            setTimeout(() => { window.location.href = '/'; }, 2000);
        }
    }, []);

    // Limpa mensagens da tela após 5 segundos
    useEffect(() => {
        if (mensagem.texto) {
            const timer = setTimeout(() => { setMensagem({ texto: '', tipo: '' }); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    // Atualiza o valor de uma restrição específica quando o usuário digita
    function handleRestricaoChange(id, valor) {
        setValoresRestricoes(prev => ({
            ...prev,
            [id]: valor === "" ? 0 : Number(valor)
        }));
    }

    // =========================================================================
    // ENVIAR CONFIRMAÇÃO
    // Valida se os campos estão corretos e envia os dados consolidados para o servidor.
    // =========================================================================
    async function enviarConfirmacao() {
        const usuarioStr = localStorage.getItem('usuario');
        const usuario = JSON.parse(usuarioStr);

        // Validação básica
        if (!turmaSelecionada) { setMensagem({ texto: 'Por favor, selecione uma turma.', tipo: 'erro' }); return; }
        if (!totalAlunos || parseInt(totalAlunos) <= 0) { setMensagem({ texto: 'Informe o total de alunos.', tipo: 'erro' }); return; }

        const totalRestricoes = Object.values(valoresRestricoes).reduce((a, b) => a + b, 0);
        if (totalRestricoes > parseInt(totalAlunos)) {
            setMensagem({ texto: `O total de alunos com restrições não pode ser maior que o total de alunos (${totalAlunos}).`, tipo: 'erro' });
            return;
        }

        // Preparar os dados para o envio
        const restricoesArray = restricoes
            .map(r => ({ restricaoId: r.id, quantidade: valoresRestricoes[r.id] || 0 }))
            .filter(r => r.quantidade > 0);

        setEnviando(true);
        try {
            const response = await axios.post('http://localhost:5000/contador/confirmacao', {
                turmaId: parseInt(turmaSelecionada),
                totalAlunos: parseInt(totalAlunos),
                restricoes: restricoesArray
            });

            if (response.status === 201) {
                setMensagem({ texto: 'Confirmação enviada com sucesso!', tipo: 'sucesso' });
                setTurmaSelecionada("");
                setTotalAlunos("");
                // Reseta as restrições para 0
                const reset = {};
                restricoes.forEach(r => { reset[r.id] = 0; });
                setValoresRestricoes(reset);
            }
        } catch (error) {
            setMensagem({ texto: 'Erro ao enviar. Tente novamente.', tipo: 'erro' });
        } finally {
            setEnviando(false);
        }
    }

    if (loading) return <div className="contador-page"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}><h3>Carregando...</h3></div></div>;

    return (
        <div className="contador-page">
            <header className="contador-header">
                <h1>{escola || "ESCOLA"}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>{dataAtual}</h2>
                    <LogoutButton />
                </div>
            </header>

            <hr />

            {/* Exibe mensagens de feedback */}
            {mensagem.texto && (
                <div style={{ padding: '12px', margin: '10px auto', textAlign: 'center', fontWeight: 'bold' }}>
                    {mensagem.texto}
                </div>
            )}

            <div className="contador-body">
                <div className="contador-card">
                    {/* Seleção de Turma */}
                    <div className="contador-row">
                        <span className="contador-label">TURMA</span>
                        <select value={turmaSelecionada} onChange={(e) => setTurmaSelecionada(e.target.value)} disabled={enviando}>
                            <option value="">Selecione uma turma</option>
                            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                    </div>

                    {/* Total de Alunos */}
                    <div className="contador-row">
                        <span className="contador-label">IRÃO COMER</span>
                        <input type="number" min="0" placeholder="Inserir número" value={totalAlunos} onChange={(e) => setTotalAlunos(e.target.value)} disabled={enviando} />
                    </div>

                    {/* Restrições Alimentares */}
                    <div className="restricoes">
                        <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '14px' }}>Alunos com restrições</div>
                        {restricoes.map(r => (
                            <div className="restricao-item" key={r.id}>
                                <label>{r.nome.toUpperCase()}</label>
                                <input type="number" min="0" value={valoresRestricoes[r.id] || 0} onChange={(e) => handleRestricaoChange(r.id, e.target.value)} disabled={enviando} />
                            </div>
                        ))}
                    </div>

                    {/* Resumo Final e Botão de Envio */}
                    <button className="contador-btn" onClick={enviarConfirmacao} disabled={enviando}>
                        {enviando ? '⏳ ENVIANDO...' : 'ENVIAR'}
                    </button>
                </div>
            </div>

            <footer className="contador-footer">
                Protótipo da página do contador - Hackathon 2026
            </footer>
        </div>
    );
}

export default Contador;