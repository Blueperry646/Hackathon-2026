// Função responsável por coletar métricas de desempenho da aplicação.
const reportWebVitals = onPerfEntry => {
  // Verifica se foi fornecida uma função para receber as métricas.
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

/*
===============================================================================
SEÇÃO 1 — COLETA DE MÉTRICAS DE DESEMPENHO
===============================================================================

Este arquivo define uma função responsável por medir o desempenho da aplicação
durante sua execução.

Inicialmente, é verificado se o parâmetro recebido (onPerfEntry) é uma função.
Caso contrário, nenhuma métrica será coletada.

Se a verificação for bem-sucedida, a biblioteca "web-vitals" é carregada
dinamicamente por meio do comando import(). Essa abordagem evita que a
biblioteca seja carregada quando não for utilizada, reduzindo o tamanho inicial
da aplicação.

Após o carregamento, são executadas cinco funções que medem diferentes aspectos
do desempenho da página. Cada uma delas envia seu resultado para a função
recebida como parâmetro.

As métricas coletadas são:

• CLS (Cumulative Layout Shift): mede alterações inesperadas no layout.
• FID (First Input Delay): mede o tempo de resposta à primeira interação do usuário.
• FCP (First Contentful Paint): mede quanto tempo leva para o primeiro conteúdo aparecer.
• LCP (Largest Contentful Paint): mede o tempo de carregamento do principal conteúdo da página.
• TTFB (Time To First Byte): mede o tempo que o servidor leva para responder à primeira requisição.

Na maioria dos projetos iniciados com Create React App, esse arquivo permanece
inalterado e serve apenas para possibilitar o monitoramento de desempenho quando
necessário.
===============================================================================
*/


export default reportWebVitals;

/*
===============================================================================
SEÇÃO 2 — EXPORTAÇÃO
===============================================================================

Exporta a função para que ela possa ser utilizada em outros arquivos do projeto,
como o index.js, onde normalmente é chamada para iniciar a coleta das métricas
de desempenho da aplicação.
===============================================================================
*/