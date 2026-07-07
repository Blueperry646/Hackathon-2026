import React from 'react';
import { useNavigate } from 'react-router-dom';

/*
===============================================================================
SEÇÃO 1 — IMPORTAÇÕES
===============================================================================

Este arquivo importa o React e o hook useNavigate, fornecido pelo React Router.

O useNavigate permite realizar a navegação entre páginas por meio de código,
sem que o usuário precise clicar em um link. Neste componente, ele será
utilizado para redirecionar o usuário à tela de login após o logout.
===============================================================================
*/


function LogoutButton() {
    // Obtém a função responsável pela navegação entre as páginas.
    const navigate = useNavigate();

    // Executa o processo de logout do usuário.
    const handleLogout = () => {
        // Solicita confirmação antes de encerrar a sessão.
        if (window.confirm('Tem certeza que deseja sair?')) {

            // Remove os dados do usuário armazenados localmente.
            localStorage.removeItem('usuario');

            // Retorna o usuário para a tela de login.
            navigate('/');
        }
    };

    /*
    ===========================================================================
    SEÇÃO 2 — LÓGICA DE LOGOUT
    ===========================================================================

    A função handleLogout é executada quando o botão é clicado.

    Inicialmente, é exibida uma caixa de confirmação para evitar que o usuário
    encerre sua sessão acidentalmente.

    Caso a confirmação seja aceita, o item "usuario" é removido do localStorage,
    que é um mecanismo de armazenamento permanente disponibilizado pelo
    navegador. Esse armazenamento é frequentemente utilizado para manter
    informações do usuário entre diferentes sessões.

    Após remover essas informações, o usuário é redirecionado para a rota "/",
    correspondente à tela de login, concluindo o processo de logout.
    ===========================================================================
    */


    return (
        <button
            onClick={handleLogout}
            style={{
                padding: '6px 14px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
            Sair
        </button>
    );
}

/*
===============================================================================
SEÇÃO 3 — RENDERIZAÇÃO DO BOTÃO
===============================================================================

Este componente retorna um botão que executa o logout quando clicado.

A propriedade onClick associa o botão à função handleLogout, iniciando o
processo de encerramento da sessão.

O objeto style define a aparência visual do botão diretamente no componente,
como cores, tamanho, bordas e espaçamento.

Além disso, os eventos onMouseEnter e onMouseLeave alteram temporariamente a
cor de fundo quando o cursor passa sobre o botão, criando um efeito visual que
indica ao usuário que o elemento é interativo.
===============================================================================
*/


export default LogoutButton;

/*
===============================================================================
SEÇÃO 4 — EXPORTAÇÃO
===============================================================================

Exporta o componente LogoutButton para que ele possa ser reutilizado em outras
páginas da aplicação, oferecendo um mecanismo padronizado para realizar o
logout do usuário.
===============================================================================
*/