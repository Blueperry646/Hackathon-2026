import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

// importe sua logo
import logo from '../../Images/logo-caragua.png';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:5000/login',
                { email, password }
            );
            if (response.data.success) {
                const user = response.data.user;
                const cargo = user.cargo;
                localStorage.setItem('usuario', JSON.stringify(user));
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
            alert("Erro ao logar: " + err.response.data.message);
        }
    };
    return (
        <div className="login-page">
            <div className="logo-area">
                <img src={logo} alt="Caraguatatuba" />
            </div>

            <div className="login-box">
                <h1>LOGIN</h1>
                <div className="line"></div>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="IDENTIFICAÇÃO DO USUÁRIO"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="SENHA"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">
                        ENVIAR
                    </button>
                </form>
            </div>

            <p className="footer">
                Protótipo da página de login feito pela equipe Try Catcher - Hackathon 2026
            </p>

        </div>
    );
}

export default Login;