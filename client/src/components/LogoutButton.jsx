import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Botão de Logout
 * Remove o usuário do localStorage e redireciona para o login
 */
function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Confirmação antes de sair
        if (window.confirm('Tem certeza que deseja sair?')) {
            // Remove o usuário do localStorage
            localStorage.removeItem('usuario');
            // Redireciona para o login
            navigate('/');
        }
    };

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
            🚪 Sair
        </button>
    );
}

export default LogoutButton;