import React from 'react';
import ReactDOM from 'react-dom/client';

// Importa os estilos globais da aplicação e o componente principal.
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/*
===============================================================================
SEÇÃO 1 — IMPORTAÇÕES
===============================================================================

Este arquivo reúne todas as dependências necessárias para iniciar a aplicação.
Além do React e do ReactDOM, são importados os estilos globais, o componente
principal (App) e uma função responsável por medir métricas de desempenho da
aplicação.
===============================================================================
*/


// Cria a raiz onde toda a aplicação React será renderizada.
const root = ReactDOM.createRoot(document.getElementById('root'));

/*
===============================================================================
SEÇÃO 2 — CRIAÇÃO DA RAIZ DA APLICAÇÃO
===============================================================================

O método createRoot() cria uma "raiz" do React dentro da página HTML.

O elemento obtido por document.getElementById('root') corresponde a uma
<div id="root"></div>, normalmente localizada no arquivo public/index.html.

É dentro dessa divisão que toda a interface da aplicação será construída.
Nenhum componente React é exibido fora dessa raiz.
===============================================================================
*/


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*
===============================================================================
SEÇÃO 3 — RENDERIZAÇÃO DA APLICAÇÃO
===============================================================================

Após criar a raiz da aplicação, o React renderiza o componente App, que funciona
como o ponto de entrada da interface.

O componente React.StrictMode não altera o funcionamento da aplicação para o
usuário final. Sua função é auxiliar o desenvolvedor durante o desenvolvimento,
identificando práticas que podem causar problemas ou comportamentos inesperados.

Toda a estrutura da aplicação será carregada a partir do componente App.
===============================================================================
*/


// Inicia a coleta de métricas de desempenho da aplicação.
reportWebVitals(console.log);

/*
===============================================================================
SEÇÃO 4 — MÉTRICAS DE DESEMPENHO
===============================================================================

A função reportWebVitals permite monitorar indicadores relacionados ao
desempenho da aplicação, como tempo de carregamento e velocidade de resposta.

Neste caso, as métricas são enviadas para o console do navegador por meio da
função console.log(). Em projetos reais, esses dados podem ser encaminhados
para ferramentas de monitoramento, auxiliando na análise e otimização da
performance da aplicação.

Caso esse monitoramento não seja necessário, essa chamada pode ser removida sem
prejudicar o funcionamento da aplicação.
===============================================================================
*/