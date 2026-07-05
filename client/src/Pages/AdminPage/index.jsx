import { useEffect, useState } from "react";
import "./style.css";

function AdminPage() {

    // =========================
    // HEADER
    // =========================

    const [escola, setEscola] = useState("");
    const [dataAtual, setDataAtual] = useState("");

    // =========================
    // MENU
    // =========================

    const [menuAtivo, setMenuAtivo] = useState("cardapio");

    // =========================
    // DADOS FUTUROS (BACKEND)
    // =========================

    const [turmas, setTurmas] = useState([]);
    const [pratos, setPratos] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [estoque, setEstoque] = useState([]);

    // =========================
    // LOAD INICIAL
    // =========================

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

        /*
        =========================================
        BUSCAR ESCOLA DO ADMIN
        =========================================
        axios.get("/admin/escola")
            .then(res => setEscola(res.data.nome));
        */

        /*
        =========================================
        CARREGAR DADOS INICIAIS
        =========================================
        axios.get("/admin/turmas")
        axios.get("/admin/pratos")
        axios.get("/admin/ingredientes")
        axios.get("/admin/estoque")
        */

    }, []);

    // =========================
    // RENDERIZAÇÃO DO CONTEÚDO
    // =========================

    function renderContent() {

        switch (menuAtivo) {

            // ================= CARDÁPIO =================

            case "cardapio":

                return (

                    <div className="content-box">

                        <h2>GERENCIAMENTO DE CARDÁPIO</h2>

                        {/* FUTURO CRUD CARDÁPIO */}

                        {/*

                        - selecionar turma
                        - selecionar dia
                        - selecionar horário
                        - selecionar prato
                        - associar ingredientes
                        - definir restrições

                        POST /cardapio

                        */}

                        <p>
                            Aqui será o CRUD de cardápios semanais.
                        </p>

                    </div>

                );

            // ================= ANÁLISE =================

            case "analise":

                return (

                    <div className="content-box">

                        <h2>ANÁLISE DE DADOS</h2>

                        {/* FUTURO:
                            gráficos + indicadores + exportação
                        */}

                        <ul>

                            <li>Refeições previstas vs realizadas</li>

                            <li>Desperdício diário</li>

                            <li>Ranking de pratos</li>

                            <li>Filtros por turma e data</li>

                        </ul>

                    </div>

                );

            // ================= ESTOQUE =================

            case "estoque":

                return (

                    <div className="content-box">

                        <h2>GESTÃO DE ESTOQUE</h2>

                        {/* FUTURO CRUD ESTOQUE */}

                        <ul>

                            <li>Cadastro de alimentos</li>

                            <li>Entrada e saída de produtos</li>

                            <li>Controle de validade</li>

                            <li>Alertas automáticos</li>

                        </ul>

                    </div>

                );

            default:
                return null;

        }

    }

    return (

        <div className="admin-page">

            {/* ================= HEADER ================= */}

            <header className="admin-header">

                <h1>{escola || "ESCOLA"}</h1>

                <h2>{dataAtual}</h2>

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
                        Cardápio
                    </button>

                    <button
                        onClick={() => setMenuAtivo("analise")}
                        className={menuAtivo === "analise" ? "active" : ""}
                    >
                        Análise de Dados
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

                Protótipo da página do administrador desenvolvido pela equipe Try Catcher - Hackathon 2026

            </footer>

        </div>

    );

}

export default AdminPage;