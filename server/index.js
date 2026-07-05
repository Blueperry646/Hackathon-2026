const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

//login 
app.post('/login', async (req, res) => {
  const { identificador, senha } = req.body;

  try {
    // Look for a user where both email AND password match
    const user = await prisma.usuario.findFirst({
      where: {
        identificador: identificador,
        senha: senha, // Raw text match
      },
    });

    if (user) {
      // deu certo: Retorna nome, email, e  identificador
      res.json({ 
        success: true, 
        user: { identificador: user.identificador, email: user.email, name: user.name, cargo: user.perfil } 
      });
    } else {
      // Errado: Credenciais incorretas
      res.status(401).json({ success: false, message: "Senha ou Email Inválidos" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no Banco de Dados" });
  }
});


// mostrar todos usuarios
app.get('/users', async (req, res) => {
  const users = await prisma.usuario.findMany();
  res.json(users);
});

//registro de usuario
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const newUser = await prisma.usuario.create({
      data: { email, password, name }
    });
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: "User might already exist" });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));