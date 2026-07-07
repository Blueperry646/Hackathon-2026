/**
 * PÁGINA DO COZINHEIRO
 * 
 * Esta página é o painel de controle diário do cozinheiro.
 * 
 * O que ela faz:
 * 1. Mostra o que precisa ser preparado hoje (cardápio).
 * 2. Permite conferir os ingredientes necessários para cada prato.
 * 3. Oferece um formulário para registrar quanto foi produzido e quanto sobrou.
 * 4. Mostra o histórico de tudo que já foi registrado no dia.
 */

import { useEffect, useState } from "react";
import axios from 'axios';
import "./style.css";
import LogoutButton from '../../components/LogoutButton';

/*
===============================================================================
CONFIGURAÇÕES E IMPORTAÇÕES
===============================================================================
Aqui carregamos as ferramentas (bibliotecas) necessárias:
- useState: Gerencia informações que mudam na tela (como dados do formulário).
- useEffect: Faz a página realizar ações automaticamente ao abrir.
- axios: Conecta nosso site com o banco de dados (o servidor).
- LogoutButton: Botão que desconecta o usuário.
===============================================================================
*/

function Cozinheiro() {

    // --- ESTADOS (O que a página "lembra" ou armazena) ---
    
    // Dados da escola e tempo
    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");

    // Controle do cardápio
    const [refeicoes, setRefeicoes] = useState([]);
    const [mostrarIngredientes, setMostrarIngredientes] = useState(false);

    // Dados que o cozinheiro vai preencher no formulário
    const [horaPreparo, setHoraPreparo] = useState("");
    const [kgProduzido, setKgProduzido] = useState("");
    const [kgSobra, setKgSobra] = useState("");
    const [salvando, setSalvando] = useState(false); // Bloqueia o botão enquanto salva

    // Histórico e controle de carregamento
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true); // Indica se estamos buscando dados no banco

    // Mensagens de aviso para o usuário
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // =========================================================================
    // CARREGAMENTO INICIAL
    // Quando a página abre, ela faz estas tarefas automaticamente:
    // 1. Pega a data de hoje.
    // 2. Verifica se o usuário está logado (se não, manda para a tela inicial).
    // 3. Busca o cardápio e o histórico de produção no servidor.
    // =========================================================================
    useEffect(() => {
        const hoje = new Date();
        setDataAtual(
            hoje.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        );

        const usuarioStr = localStorage.getItem('usuario');

        if (!usuarioStr) {
            setMensagem({ texto: 'Usuário não está logado! Redirecionando...', tipo: 'erro' });
            setTimeout(() => { window.location.href = '/'; }, 2000);
            return;
        }

        try {
            const usuario = JSON.parse(usuarioStr);
            if (!usuario || !usuario.id) {
                setMensagem({ texto: 'Sessão inválida! Redirecionando...', tipo: 'erro' });
                setTimeout(() => { window.location.href = '/'; }, 2000);
                return;
            }

            const buscarDados = async () => {
                try {
                    setLoading(true);
                    if (usuario.escola) setEscola(usuario.escola);

                    const escolaId = usuario.escolaId || 1;
                    
                    // Busca o cardápio do dia
                    const cardapioRes = await axios.get(`http://localhost:5000/cozinheiro/cardapio/dia?escolaId=${escolaId}`);
                    setRefeicoes(cardapioRes.data);

                    // Busca o histórico do dia
                    const historicoRes = await axios.get(`http://localhost:5000/cozinheiro/historico?usuarioId=${usuario.id}`);
                    setHistorico(historicoRes.data);

                    if (cardapioRes.data.length === 0) {
                        setMensagem({ texto: 'Nenhuma refeição programada para hoje.', tipo: 'info' });
                    }
                } catch (error) {
                    setMensagem({ texto: 'Erro ao carregar dados. Verifique se o servidor está rodando.', tipo: 'erro' });
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

    // =========================================================================
    // LIMPEZA DE MENSAGENS
    // Remove qualquer aviso na tela após 5 segundos para não poluir o visual.
    // =========================================================================
    useEffect(() => {
        if (mensagem.texto) {
            const timer = setTimeout(() => { setMensagem({ texto: '', tipo: '' }); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    // =========================================================================
    // SALVAR PRODUÇÃO
    // Valida os campos preenchidos e envia para o servidor salvar.
    // =========================================================================
    async function salvarRegistro() {
        const usuarioStr = localStorage.getItem('usuario');
        const usuario = JSON.parse(usuarioStr);

        // Verificações de segurança antes de enviar
        if (!horaPreparo || !kgProduzido || parseFloat(kgProduzido) <= 0) {
            setMensagem({ texto: 'Por favor, preencha o horário e a quantidade produzida corretamente.', tipo: 'erro' });
            return;
        }

        setSalvando(true);
        try {
            const response = await axios.post('http://localhost:5000/cozinheiro/producao', {
                cardapioId: refeicoes[0]?.id,
                usuarioId: usuario.id,
                horaPreparo: horaPreparo,
                kgProduzido: parseFloat(kgProduzido),
                kgSobra: kgSobra ? parseFloat(kgSobra) : 0
            });

            if (response.status === 201) {
                setMensagem({ texto: 'Produção registrada com sucesso!', tipo: 'sucesso' });
                setHoraPreparo('');
                setKgProduzido('');
                setKgSobra('');
                
                // Atualiza o histórico para mostrar o novo registro
                const historicoRes = await axios.get(`http://localhost:5000/cozinheiro/historico?usuarioId=${usuario.id}`);
                setHistorico(historicoRes.data);
            }
        } catch (error) {
            setMensagem({ texto: 'Erro ao salvar. Tente novamente.', tipo: 'erro' });
        } finally {
            setSalvando(false);
        }
    }

    // =========================================================================
    // FORMATAR HORÁRIO
    // Transforma dados de data/hora vindos do computador em um formato fácil de ler.
    // =========================================================================
    function formatarHorario(valor) {
        if (!valor) return '--:--';
        if (typeof valor === 'string' && valor.length === 5) return valor;
        try {
            const date = new Date(valor);
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        } catch { return valor; }
    }

    // Se estiver carregando, mostra apenas uma tela simples de espera
    if (loading) {
        return <div className="cook-page"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}><h3>Carregando...</h3></div></div>;
    }

    // RENDERIZAÇÃO DA PÁGINA (O que o usuário vê)
    return (
        <div className="cook-page">
            <header className="cook-header">
                <div className="header-left"><h1>{escola === "" ? "ESCOLA MUNICIPAL" : escola}</h1></div>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>{dataAtual}</h2>
                    <LogoutButton />
                </div>
            </header>

            {/* Exibe avisos se houver */}
            {mensagem.texto && (
                <div style={{ padding: '12px', margin: '10px auto', textAlign: 'center', fontWeight: 'bold' }}>
                    {mensagem.texto}
                </div>
            )}

            <main className="cook-main">
                {/* Painel de Refeições */}
                <section className="left-panel">
                    <h2 className="panel-title">REFEIÇÕES PROGRAMADAS</h2>
                    {refeicoes.map((refeicao) => (
                        <div className="meal-card" key={refeicao.id}>
                            <h3>{formatarHorario(refeicao.horario)}</h3>
                            <p><strong>Prato:</strong> {refeicao.prato}</p>
                            <p><strong>Porções:</strong> {refeicao.porcoes}</p>
                        </div>
                    ))}
                </section>

                {/* Painel de Ingredientes e Registro */}
                <aside className="right-panel">
                    <button className="ingredientes-button" onClick={() => setMostrarIngredientes(!mostrarIngredientes)}>
                        {mostrarIngredientes ? '🔽 OCULTAR INGREDIENTES' : '🔼 EXIBIR INGREDIENTES'}
                    </button>

                    {mostrarIngredientes && (
                        <div className="ingredientes-box">
                            {refeicoes.map((refeicao) => (
                                <div key={refeicao.id}>
                                    <h3>{refeicao.prato}</h3>
                                    <ul>{refeicao.ingredientes?.map((ing, i) => <li key={i}>{ing.nome} ({ing.quantidade} kg)</li>)}</ul>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-section">
                        <h2 className="panel-title">REGISTRAR PRODUÇÃO</h2>
                        <div className="form-box">
                            <label>Horário de preparo</label>
                            <input type="time" value={horaPreparo} onChange={(e) => setHoraPreparo(e.target.value)} disabled={salvando} />
                            
                            <label>Kg produzidos</label>
                            <input type="number" step="0.01" value={kgProduzido} onChange={(e) => setKgProduzido(e.target.value)} disabled={salvando} />
                            
                            <label>Kg sobra (opcional)</label>
                            <input type="number" step="0.01" value={kgSobra} onChange={(e) => setKgSobra(e.target.value)} disabled={salvando} />

                            <button className="save-button" onClick={salvarRegistro} disabled={salvando}>
                                {salvando ? '⏳ SALVANDO...' : 'SALVAR'}
                            </button>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Histórico */}
            <section className="historico-section">
                <h2>HISTÓRICO DE PRODUÇÃO DO DIA</h2>
                <table className="historico-table">
                    <thead><tr><th>Horário</th><th>Prato</th><th>Kg Produzidos</th><th>Kg Sobra</th></tr></thead>
                    <tbody>
                        {historico.map((item, index) => (
                            <tr key={index}>
                                <td>{formatarHorario(item.horaPreparo)}</td>
                                <td>{item.cardapio?.prato?.nome || 'N/A'}</td>
                                <td>{item.kgProduzido?.toFixed(2)}</td>
                                <td>{item.kgSobra?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Cozinheiro;