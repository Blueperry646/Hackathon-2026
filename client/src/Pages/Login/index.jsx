import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';
import logo from '../../Images/logo-caragua.png';

function Login() {

    // ===========================
    // Estados do formulário
    // ===========================

    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');

    // ===========================
    // Navegação entre páginas
    // ===========================

    const navigate = useNavigate();

    // ===========================
    // Função de autenticação
    // ===========================

    const handleLogin = async (e) => {

        e.preventDefault();

        /*
            ======================================
            REQUISIÇÃO DE LOGIN PARA O BACKEND
            ======================================

            Envia email e senha para autenticação
            no servidor via POST.
        */

        try {

            const response = await axios.post('http://localhost:5000/login', {
                identificador,  // ← mudou
                senha           // ← mudou
            });

            /*
                ======================================
                RESPOSTA DO SERVIDOR
                ======================================

                Se login for bem-sucedido:
                - salva usuário no localStorage
                - redireciona conforme cargo
            */

            if (response.data.success) {

                const user = response.data.user;
                const cargo = user.cargo;

                // Armazena dados do usuário localmente
                localStorage.setItem('usuario', JSON.stringify(user));

                /*
                    ======================================
                    REDIRECIONAMENTO POR PERFIL
                    ======================================

                    ADMIN -> dashboard administrativo
                    CONTADOR -> área financeira
                    COZINHEIRO -> painel de produção
                */

                switch (cargo) {

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
                        navigate('/');
                }
            }

        } catch (err) {

            /*
                ======================================
                TRATAMENTO DE ERRO
                ======================================

                Exibe mensagem caso login falhe
            */

            alert("Erro ao logar: " + err.response.data.message);
        }
    };

    // Revisar
    const user = response.data.user;
    console.log(user.nome, user.perfil, user.escola);

    return (


        <div className="login-page">

            {/* ================= LOGO ================= */}

            <div className="logo-area">
                <img src={logo} alt="Caraguatatuba" />
            </div>

            {/* ================= FORMULÁRIO DE LOGIN ================= */}

            <div className="login-box">

                <h1>LOGIN</h1>

                <div className="line"></div>

                <form onSubmit={handleLogin}>

                    {/* Campo de email do usuário */}
                    <input
                        type="email"
                        placeholder="E-MAIL"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Campo de senha do usuário */}
                    <input
                        type="password"
                        placeholder="SENHA"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Botão de envio do formulário */}
                    <button type="submit">
                        ENVIAR
                    </button>

                </form>

            </div>

            <div className="encherLinguica"></div>

            {/* ================= FOOTER ================= */}

            <p className="footer">
                Protótipo da página de login feito pela equipe Try Catcher - Hackathon 2026
            </p>

        </div>
    );
}

export default Login;
