import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';
import logo from '../../Images/TIAMARI.png';

/**
 * Página de Login
 * 
 * Funcionalidades:
 * - Autenticação de usuários com identificador e senha
 * - Redirecionamento baseado no perfil (ADMIN, CONTADOR, COZINHEIRO)
 * - Persistência de sessão no localStorage
 * - Tratamento de erros com feedback ao usuário
 */

function Login() {
    // ===========================
    // ESTADOS DO COMPONENTE
    // ===========================

    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    // ===========================
    // NAVEGAÇÃO
    // ===========================

    const navigate = useNavigate();

    // ===========================
    // REDIRECIONAMENTO SE JÁ LOGADO
    // ===========================

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

    // ===========================
    // FUNÇÃO DE AUTENTICAÇÃO
    // ===========================

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
                
                const cargo = user.perfil;
                
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
                    setErro(message || 'Credenciais inválidas. Tente novamente.');
                } else if (status === 500) {
                    setErro('Erro no servidor. Tente novamente mais tarde.');
                } else {
                    setErro(message || 'Erro ao fazer login. Tente novamente.');
                }
            } else if (err.request) {
                setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
            } else {
                setErro('Ocorreu um erro inesperado. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ===========================
    // RENDERIZAÇÃO DA INTERFACE
    // ===========================

    return (
        <div className="login-page">

            {/* ================= LOGO ================= */}
            <div className="logo-area">
                <img src={logo} alt="Logo Caraguatatuba" />
            </div>

            {/* ================= FORMULÁRIO DE LOGIN ================= */}
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
                        className={loading ? 'loading' : ''}
                    >
                        {loading ? '⏳ ENTRANDO...' : 'ENVIAR'}
                    </button>
                </form>

                {/* ================= INDICADOR DE SEGURANÇA ================= */}
                <div className="security-badge">
                    <span className="security-dot"></span>
                    Conexão segura
                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="login-footer">
                Protótipo da página de login desenvolvido pela equipe <span>Try Catcher</span> - Hackathon 2026
            </div>

        </div>
    );
}

export default Login;