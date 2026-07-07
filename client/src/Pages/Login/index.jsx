import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './style.css';
import logo from '../../Images/logo-caragua.png';

/*
===============================================================================
SEÇÃO 1 — IMPORTAÇÕES
===============================================================================

Importa as dependências necessárias para o funcionamento da página de login.

Além do React, são utilizados:
- useState: controla os estados da interface.
- useEffect: executa ações automaticamente durante o ciclo de vida do componente.
- useNavigate: realiza redirecionamentos entre páginas.
- axios: envia requisições HTTP ao servidor.
- style.css e logo: definem a aparência visual da página.
===============================================================================
*/


function Login() {

    // Estados utilizados para armazenar os dados da tela.
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    // Responsável pela navegação entre as páginas.
    const navigate = useNavigate();

    /*
    ===============================================================================
    SEÇÃO 2 — ESTADOS E NAVEGAÇÃO
    ===============================================================================

    Este componente utiliza quatro estados principais.

    • identificador: armazena o usuário informado.
    • senha: armazena a senha digitada.
    • loading: indica se o login está sendo processado.
    • erro: armazena mensagens exibidas ao usuário.

    Também é criada a função navigate(), responsável por redirecionar o usuário
    para outras páginas após o login.
    ===============================================================================
    */


    // Verifica automaticamente se já existe uma sessão salva.
    useEffect(() => {
        const usuarioStr = localStorage.getItem('usuario');

        if (usuarioStr) {
            try {
                const usuario = JSON.parse(usuarioStr);

                if (usuario.perfil === 'ADMIN') {
                    navigate('/admin-dashboard');
                } else if (usuario.perfil === 'CONTADOR') {
                    navigate('/contador');
                } else if (usuario.perfil === 'COZINHEIRO') {
                    navigate('/cozinheiro');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                localStorage.removeItem('usuario');
            }
        }
    }, [navigate]);

    /*
    ===============================================================================
    SEÇÃO 3 — VERIFICAÇÃO DE SESSÃO
    ===============================================================================

    Assim que a página é carregada, este efeito verifica se existe um usuário
    armazenado no localStorage.

    Caso exista, seus dados são recuperados e o perfil é analisado para
    redirecionar automaticamente o usuário à área correspondente.

    Se os dados armazenados estiverem corrompidos ou inválidos, eles são
    removidos para evitar comportamentos inesperados.
    ===============================================================================
    */


    // Processa o envio do formulário de login.
    const handleLogin = async (e) => {
        e.preventDefault();

        setErro('');

        if (!identificador.trim()) {
            setErro('Por favor, digite seu identificador.');
            return;
        }

        if (!senha.trim()) {
            setErro('Por favor, digite sua senha.');
            return;
        }

        setLoading(true);

        try {

            const response = await axios.post(
                'http://localhost:5000/login',
                {
                    identificador: identificador.trim(),
                    senha: senha.trim()
                }
            );

            if (response.data.success) {

                const user = response.data.user;

                localStorage.setItem('usuario', JSON.stringify(user));

                switch (user.perfil) {

                    case 'ADMIN':
                        navigate('/admin-dashboard');
                        break;

                    case 'CONTADOR':
                        navigate('/contador');
                        break;

                    case 'COZINHEIRO':
                        navigate('/cozinheiro');
                        break;

                    default:
                        setErro('Perfil de usuário inválido.');
                        navigate('/');
                }
            }

        } catch (err) {

            console.error('Erro no login:', err);

            if (err.response) {

                const status = err.response.status;
                const message = err.response.data?.message;

                if (status === 401) {
                    setErro(message || 'Credenciais inválidas.');
                } else if (status === 500) {
                    setErro('Erro no servidor.');
                } else {
                    setErro(message || 'Erro ao realizar login.');
                }

            } else if (err.request) {

                setErro('Não foi possível conectar ao servidor.');

            } else {

                setErro('Ocorreu um erro inesperado.');

            }

        } finally {

            setLoading(false);

        }
    };

    /*
    ===============================================================================
    SEÇÃO 4 — PROCESSO DE AUTENTICAÇÃO
    ===============================================================================

    Esta função é executada quando o formulário é enviado.

    O processo ocorre em quatro etapas:

    1. Valida se identificador e senha foram preenchidos.
    2. Envia uma requisição ao servidor utilizando o Axios.
    3. Caso o login seja bem-sucedido, salva os dados do usuário no
       localStorage e redireciona para a página correspondente ao seu perfil.
    4. Caso ocorra algum erro, identifica sua origem (credenciais inválidas,
       falha do servidor ou ausência de conexão) e apresenta uma mensagem
       apropriada ao usuário.

    Durante toda a requisição, o estado "loading" permanece ativo para impedir
    múltiplos envios simultâneos do formulário.
    ===============================================================================
    */


    return (
        <div className="login-page">

            <div className="logo-area">
                <img src={logo} alt="Logo Caraguatatuba" />
            </div>

            <div className="login-box">

                <h1>LOGIN</h1>
                <div className="line"></div>

                {erro && (
                    <div className="erro">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <div className="input-group">

                        <label>Identificador</label>

                        <input
                            type="text"
                            placeholder="Digite seu identificador"
                            value={identificador}
                            onChange={(e) => setIdentificador(e.target.value)}
                            disabled={loading}
                            autoFocus
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>Senha</label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            disabled={loading}
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'ENTRANDO...' : 'ENVIAR'}
                    </button>

                </form>

            </div>

            <div className="login-footer">
                Protótipo da página de login desenvolvido pela equipe
                <span> Try Catcher</span> - Hackathon 2026
            </div>

        </div>
    );

    /*
    ===============================================================================
    SEÇÃO 5 — INTERFACE DA PÁGINA
    ===============================================================================

    Esta parte define os elementos visuais da tela de login.

    A interface é composta por:

    • Área da logomarca.
    • Caixa contendo o formulário.
    • Campo para identificador.
    • Campo para senha.
    • Exibição de mensagens de erro.
    • Botão de envio, cujo texto muda durante o processamento.
    • Rodapé informativo.

    Os campos do formulário permanecem sincronizados com os estados do
    componente, garantindo que qualquer alteração feita pelo usuário seja
    imediatamente refletida na interface.
    ===============================================================================
    */
}

export default Login;