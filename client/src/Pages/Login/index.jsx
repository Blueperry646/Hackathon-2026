import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      
    if (response.data.success) {
        const user = response.data.user;
        const cargo = user.cargo; // Aqui está o seu Enum (ex: 'ADMIN', 'CLIENTE', etc)

      // Salva no localStorage para saber quem está logado
    localStorage.setItem('usuario', JSON.stringify(user));

      // Redirecionamento condicional
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
        <form onSubmit={handleLogin}>
            <h1>Prototype Login</h1>
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;