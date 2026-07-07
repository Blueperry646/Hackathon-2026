import { Routes, Route } from "react-router-dom";

// Importa os componentes que representam as páginas da aplicação.
import Login from "../Pages/Login";
import AdminPage from "../Pages/AdminPage";
import Contador from "../Pages/Contador";
import Cozinheiro from "../Pages/Cozinheiro";

/*
===============================================================================
SEÇÃO 1 — IMPORTAÇÕES
===============================================================================

Este arquivo importa os componentes responsáveis pelas páginas da aplicação.

Cada componente representa uma tela diferente, como Login, Painel do
Administrador, Contador e Cozinheiro. Essas páginas serão associadas a
endereços (URLs) específicos por meio do sistema de rotas do React Router.
===============================================================================
*/


function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin-dashboard" element={<AdminPage />} />
            <Route path="/contador" element={<Contador />} />
            <Route path="/cozinheiro" element={<Cozinheiro />} />
        </Routes>
    );
}

/*
===============================================================================
SEÇÃO 2 — DEFINIÇÃO DAS ROTAS
===============================================================================

O componente AppRoutes concentra todas as rotas da aplicação.

O componente <Routes> funciona como um controlador de navegação. Sempre que a
URL do navegador é alterada, ele verifica qual rota corresponde ao endereço
acessado e renderiza o componente associado.

Cada componente <Route> possui duas propriedades principais:

• path: define o endereço (URL) da página.
• element: define qual componente será exibido quando esse endereço for acessado.

As rotas definidas neste arquivo são:

• "/" → Exibe a tela de Login.
• "/admin-dashboard" → Exibe o painel do administrador.
• "/contador" → Exibe a página destinada ao contador.
• "/cozinheiro" → Exibe a página destinada ao cozinheiro.

Dessa forma, toda a navegação da aplicação fica centralizada em um único
arquivo, facilitando a organização e a manutenção do sistema.
===============================================================================
*/


export default AppRoutes;

/*
===============================================================================
SEÇÃO 3 — EXPORTAÇÃO
===============================================================================

Exporta o componente AppRoutes para que ele possa ser utilizado pelo componente
App, tornando as rotas disponíveis para toda a aplicação.
===============================================================================
*/