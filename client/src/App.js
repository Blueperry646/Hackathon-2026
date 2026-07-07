// Importa o sistema de roteamento do React e o componente que define as rotas.
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './Routes/AppRoutes';

/*
===============================================================================
SEÇÃO 1 — IMPORTAÇÕES
===============================================================================

Todo arquivo React normalmente começa importando as dependências necessárias.

O BrowserRouter, renomeado para Router, é o componente responsável por permitir
a navegação entre diferentes páginas da aplicação sem que o navegador precise
recarregar completamente o site. Em vez de solicitar uma nova página ao servidor
a cada clique, o React altera apenas os componentes exibidos na tela.

Já o AppRoutes é um componente criado pelo próprio projeto. Sua função é reunir
todas as rotas da aplicação, informando qual componente deve ser exibido para
cada endereço (URL) acessado pelo usuário.

Na prática, este arquivo não conhece quais páginas existem. Ele apenas prepara
o ambiente para que o AppRoutes faça esse trabalho.
===============================================================================
*/


function App() {
  return (
    // Todo o sistema de navegação fica disponível para os componentes internos.
    <Router>
      <AppRoutes />
    </Router>
  );
}

/*
===============================================================================
SEÇÃO 2 — COMPONENTE App
===============================================================================

Em React, praticamente toda interface é construída através de componentes.
Um componente nada mais é do que uma função JavaScript que retorna JSX, uma
sintaxe semelhante ao HTML utilizada para descrever a interface.

Neste caso, o componente App possui apenas uma responsabilidade: envolver toda
a aplicação dentro do Router.

Esse detalhe é extremamente importante. O Router monitora constantemente a URL
do navegador e informa ao React qual página deve ser exibida.

Sempre que a URL muda, por exemplo:

    /
    /login
    /produtos

o Router detecta essa alteração e solicita ao AppRoutes que renderize o
componente correspondente, sem que a página inteira seja recarregada.

Pode-se imaginar o Router como um "controlador de navegação" da aplicação.
Sem ele, recursos como Links, redirecionamentos e navegação entre páginas
simplesmente não funcionariam.
===============================================================================
*/


// Disponibiliza este componente para que outros arquivos possam utilizá-lo.
export default App;

/*
===============================================================================
SEÇÃO 3 — EXPORTAÇÃO
===============================================================================

A instrução "export default" torna este componente acessível para outros
arquivos do projeto.

Normalmente existe um arquivo chamado main.jsx ou index.js que importa o App
e o renderiza na página. Dessa forma, toda a aplicação começa sua execução por
este componente.

A hierarquia costuma ser semelhante à seguinte:

main.jsx
    │
    ▼
App
    │
    ▼
Router
    │
    ▼
AppRoutes
    │
    ▼
Página correspondente à URL

Por isso, embora este arquivo seja bastante pequeno, ele funciona como o ponto
de entrada da interface da aplicação.
===============================================================================
*/