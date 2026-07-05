import { useEffect, useState } from "react";
import "./style.css";

function Cozinheiro() {

    // ===========================
    // ESTADOS DO COMPONENTE
    // ===========================

    // Nome da escola exibido no topo da interface
    const [escola, setEscola] = useState("");

    // Data atual formatada para exibição no cabeçalho
    const [dataAtual, setDataAtual] = useState("");

    // Lista de refeições programadas para o dia
    const [refeicoes, setRefeicoes] = useState([]);

    // Controla exibição ou ocultação dos ingredientes/pratos
    const [mostrarIngredientes, setMostrarIngredientes] = useState(false);

    // ===========================
    // CAMPOS DO FORMULÁRIO
    // ===========================

    // Horário em que a produção foi realizada
    const [horaPreparo, setHoraPreparo] = useState("");

    // Quantidade de comida produzida (em kg)
    const [kgProduzido, setKgProduzido] = useState("");

    // Quantidade de sobra (em kg)
    const [kgSobra, setKgSobra] = useState("");

    // Histórico de produções realizadas no dia
    const [historico, setHistorico] = useState([]);

    // ===========================
    // CARREGAMENTO INICIAL DA PÁGINA
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

        /*
            ======================================
            BUSCA DE DADOS NO BACKEND (PLACEHOLDER)
            ======================================

            Aqui seriam feitas requisições para API
            para carregar dados iniciais da tela.
        */

        /*
            BUSCAR NOME DA ESCOLA
            axios.get("/cozinheiro/escola")
            setEscola(...)
        */

        /*
            BUSCAR REFEIÇÕES PROGRAMADAS DO DIA
            axios.get("/cozinheiro/refeicoes")
            setRefeicoes(...)
        */

        /*
            BUSCAR HISTÓRICO DE PRODUÇÃO DO DIA
            axios.get("/cozinheiro/historico")
            setHistorico(...)
        */

    }, []);

    // ===========================
    // REGISTRO DE PRODUÇÃO
    // ===========================

    function salvarRegistro() {

        /*
            ======================================
            ENVIO DE DADOS PARA O BACKEND
            ======================================

            Dados que seriam enviados:
            - horaPreparo
            - kgProduzido
            - kgSobra

            axios.post("/cozinheiro/registro", {...})
        */

    }

    // ===========================
    // RENDERIZAÇÃO DA INTERFACE
    // ===========================

    return (

        <div className="cook-page">

            {/* ================= HEADER ================= */}

            <header className="cook-header">

                <div className="header-left">
                    <h1>
                        {/* Exibe nome da escola ou fallback padrão */}
                        {escola === "" ? "(FAZ O L, NÓIS NÃO TEM BANCO-DE-DADOS)" : escola}
                    </h1>
                </div>

                <div className="header-right">
                    <h2>{dataAtual}</h2>
                </div>

            </header>

            {/* ================= CORPO PRINCIPAL ================= */}

            <main className="cook-main">

                {/* ================= PAINEL ESQUERDO ================= */}

                <section className="left-panel">

                    <h2 className="panel-title">
                        REFEIÇÕES PROGRAMADAS
                    </h2>

                    {
                        refeicoes.length === 0 ?
                        (
                            /* Estado vazio quando não há refeições */
                            <div className="meal-card empty-card">
                                <h3>
                                    Nenhuma refeição programada.
                                </h3>
                                <p>
                                    As refeições cadastradas para hoje aparecerão aqui.
                                </p>
                            </div>
                        )
                        :
                        (
                            /* Lista de refeições programadas */
                            refeicoes.map((refeicao) => (
                                <div
                                    className="meal-card"
                                    key={refeicao.id}
                                >

                                    <div className="meal-header">
                                        <h3>
                                            {refeicao.horario}
                                        </h3>
                                    </div>

                                    <div className="meal-info">

                                        <p>
                                            <strong>Porções:</strong>{" "}
                                            {refeicao.porcoes}
                                        </p>

                                        <p>
                                            <strong>Especiais:</strong>{" "}
                                            {refeicao.especiais}
                                        </p>

                                    </div>

                                </div>
                            ))
                        )
                    }

                </section>

                {/* ================= PAINEL DIREITO ================= */}

                <aside className="right-panel">

                    {/* Botão que alterna visibilidade dos ingredientes */}
                    <button
                        className="ingredientes-button"
                        onClick={() =>
                            setMostrarIngredientes(!mostrarIngredientes)
                        }
                    >
                        {
                            mostrarIngredientes
                            ? "OCULTAR PRATOS E INGREDIENTES"
                            : "EXIBIR PRATOS E INGREDIENTES"
                        }
                    </button>

                    {
                        mostrarIngredientes &&
                        (
                            <div className="ingredientes-box">

                                {
                                    refeicoes.length === 0 ?
                                    (
                                        <div className="sem-pratos">
                                            Nenhum prato cadastrado.
                                        </div>
                                    )
                                    :
                                    refeicoes.map((refeicao) => (
                                        <div
                                            key={refeicao.id}
                                            className="prato-box"
                                        >

                                            <h3>
                                                {refeicao.prato}
                                            </h3>

                                            <ul>
                                                {
                                                    refeicao.ingredientes.map(
                                                        (ingrediente, index) => (
                                                            <li key={index}>
                                                                {ingrediente.nome}
                                                            </li>
                                                        )
                                                    )
                                                }
                                            </ul>

                                        </div>
                                    ))
                                }

                            </div>
                        )
                    }

                    {/* ================= FORMULÁRIO ================= */}

                    <div className="form-section">

                        <h2 className="panel-title">
                            REGISTRAR PRODUÇÃO
                        </h2>

                        <div className="form-box">

                            <label>Horário de preparo</label>
                            <input
                                type="time"
                                value={horaPreparo}
                                onChange={(e) => setHoraPreparo(e.target.value)}
                            />

                            <label>Kg produzidos</label>
                            <input
                                type="number"
                                value={kgProduzido}
                                onChange={(e) => setKgProduzido(e.target.value)}
                            />

                            <label>Kg sobrou</label>
                            <input
                                type="number"
                                value={kgSobra}
                                onChange={(e) => setKgSobra(e.target.value)}
                            />

                            <button
                                className="save-button"
                                onClick={salvarRegistro}
                            >
                                SALVAR
                            </button>

                        </div>

                    </div>

                </aside>

            </main>

            {/* ================= HISTÓRICO ================= */}

            <section className="historico-section">

                <h2>
                    HISTÓRICO DE PRODUÇÃO DO DIA
                </h2>

                {
                    historico.length === 0 ? (
                        /* Caso não existam registros */
                        <p className="empty-history">
                            Nenhum registro realizado ainda.
                        </p>
                    ) : (
                        /* Tabela com histórico de produção */
                        <table className="historico-table">

                            <thead>
                                <tr>
                                    <th>Horário</th>
                                    <th>Kg Produzidos</th>
                                    <th>Kg Sobra</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    historico.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.horario}</td>
                                            <td>{item.produzido}</td>
                                            <td>{item.sobra}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>

                        </table>
                    )
                }

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="cook-footer">
                Protótipo da página do cozinheiro desenvolvido pela equipe Try Catcher - Hackathon 2026
            </footer>

        </div>
    );
}

export default Cozinheiro;