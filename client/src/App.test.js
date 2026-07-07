import { render, screen } from '@testing-library/react';
import App from './App';

/*
===============================================================================
SEÇÃO 1 — IMPORTAÇÕES
===============================================================================

Importa as funções utilizadas para testar componentes React e o componente App,
que será renderizado durante o teste.
===============================================================================
*/


test('renders learn react link', () => {
  // Renderiza o componente para que ele possa ser testado.
  render(<App />);

  // Procura um elemento contendo o texto "learn react".
  const linkElement = screen.getByText(/learn react/i);

  // Verifica se o elemento realmente foi encontrado na página.
  expect(linkElement).toBeInTheDocument();
});

/*
===============================================================================
SEÇÃO 2 — TESTE
===============================================================================

Este teste faz parte da configuração padrão criada pelo Create React App.

Seu objetivo é renderizar o componente App, localizar um elemento contendo o
texto "learn react" e verificar se ele está presente na interface. Caso esse
texto não exista, o teste falha.

Em muitos projetos esse arquivo é posteriormente alterado ou removido, pois ele
serve apenas como um exemplo inicial de como escrever testes automatizados.
===============================================================================
*/