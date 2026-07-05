import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

function Contador() {

    // ===========================
    // ESTADOS DO CABEÇALHO
    // ===========================

    // Nome da escola exibido no header
    const [escola, setEscola] = useState("");

    // Data atual formatada
    const [dataAtual, setDataAtual] = useState("");

    // ===========================
    // DADOS VINDOS DO BACKEND
    // ===========================

    // Lista de turmas disponíveis
    const [turmas, setTurmas] = useState([]);

    // Lista de restrições alimentares cadastradas
    const [restricoes, setRestricoes] = useState([]);

    // ===========================
    // ESTADOS DO FORMULÁRIO
    // ===========================

    // Turma selecionada no formulário
    const [turmaSelecionada, setTurmaSelecionada] = useState("");

    // Número total de alunos que irão se alimentar
    const [totalAlunos, setTotalAlunos] = useState("");

    /*
        Objeto dinâmico que armazena a quantidade de alunos
        por tipo de restrição alimentar.

        Estrutura:
        {
            idRestricao: quantidade
        }
    */
    const [valoresRestricoes, setValoresRestricoes] = useState({});

    // ===========================
    // CARREGAMENTO INICIAL
    // ===========================

    useEffect(() => {

        // Obtém data atual do sistema
        const hoje = new Date();

        // Formata a data no padrão brasileiro
        setDataAtual(
            hoje.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        );

        const usuario = JSON.parse(localStorage.getItem('usuario'));

        /*
        =========================================
        BUSCA DADOS INICIAIS NO BACKEND
        =========================================
        */

        /*
            BUSCAR ESCOLA DO USUÁRIO
            (nome da instituição associada ao contador)
        */
        /*
        axios.get("/contador/escola")
            .then(res => setEscola(res.data.nome));
        */

        /*
            BUSCAR LISTA DE TURMAS
        */
        axios.get(`http://localhost:5000/contador/turmas?escolaId=1`).then(res => setTurmas(res.data));

        /*
            BUSCAR RESTRIÇÕES ALIMENTARES
            (ex: alergias, dietas especiais etc.)
        */
        axios.get('http://localhost:5000/contador/restricoes').then(res => {
            setRestricoes(res.data);
            const inicial = {};
            res.data.forEach(r => { inicial[r.id] = 0; });
            setValoresRestricoes(inicial);
        });

    }, []);

    // ===========================
    // ATUALIZAÇÃO DE RESTRIÇÕES
    // ===========================

    function handleRestricaoChange(id, valor) {

        /*
            Atualiza dinamicamente o valor de uma restrição específica
            mantendo o restante do objeto inalterado
        */

        setValoresRestricoes(prev => ({
            ...prev,
            [id]: valor === "" ? 0 : Number(valor)
        }));

    }

    // ===========================
    // ENVIO DOS DADOS
    // ===========================

    async function enviar() {
        try {
            const restricoesArray = restricoes.map(r => ({
                restricaoId: r.id,
                quantidade: valoresRestricoes[r.id] || 0
            })).filter(r => r.quantidade > 0);

            await axios.post('http://localhost:5000/contador/confirmacao', {
                turmaId: turmaSelecionada,
                totalAlunos: totalAlunos,
                restricoes: restricoesArray
            });

            alert('Confirmação enviada com sucesso!');
        } catch (error) {
            alert('Erro ao enviar confirmação');
        }
    }

    // ===========================
    // RENDERIZAÇÃO DA INTERFACE
    // ===========================

    return (

        <div className="contador-page">

            {/* ================= HEADER ================= */}

            <header className="contador-header">

                {/* Nome da escola ou fallback */}
                <h1>{escola || "ESCOLA"}</h1>

                {/* Data atual formatada */}
                <h2>{dataAtual}</h2>

            </header>

            <hr />

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
                            onChange={(e) =>
                                setTurmaSelecionada(e.target.value)
                            }
                        >

                            <option value="">
                                Selecione uma turma
                            </option>

                            {turmas.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.nome}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* ================= TOTAL DE ALUNOS ================= */}

                    <div className="contador-row">

                        <span className="contador-label">
                            IRÃO COMER
                        </span>

                        <input
                            type="number"
                            placeholder="Inserir número"
                            value={totalAlunos}
                            onChange={(e) =>
                                setTotalAlunos(e.target.value)
                            }
                        />

                    </div>

                    {/* ================= RESTRIÇÕES ALIMENTARES ================= */}

                    <div className="restricoes">

                        {restricoes.map(r => (

                            <div
                                className="restricao-item"
                                key={r.id}
                            >

                                {/* Nome da restrição */}
                                <label>
                                    {r.nome.toUpperCase()}
                                </label>

                                {/* Quantidade de alunos na restrição */}
                                <input
                                    type="number"
                                    value={valoresRestricoes[r.id] || 0}
                                    onChange={(e) =>
                                        handleRestricaoChange(
                                            r.id,
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        ))}

                    </div>

                    {/* ================= BOTÃO DE ENVIO ================= */}

                    <button
                        className="contador-btn"
                        onClick={enviar}
                    >
                        ENVIAR
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