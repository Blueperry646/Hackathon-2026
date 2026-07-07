Projeto TIAMARI - Hackathon 2026

Sistema inteligente de gestão escolar voltado para a operação de cozinhas,
otimizando o fluxo entre o planejamento administrativo, a contagem de refeições
e a produção culinária.

Requisitos

Antes de começar, certifique-se de ter instalado:

  - Git
  - Node.js (v18+ recomendado)
  - MySQL Server

Downloads:

  - Git: https://git-scm.com/downloads
  - Node.js: https://nodejs.org/en/download/current

Instalação

1.  Clone o repositório:

    Abra o terminal e execute os seguintes comandos nesta ordem, um após o outro:

    git clone https://github.com/Blueperry646/Hackathon-2026.git
    cd Hackathon-2026

2.  Configuração do Servidor (Backend):

    Entre na pasta server usando:

    cd server

    A seguir execute os seguintes comandos nesta ordem, um após o outro:

    npm i
    npx prisma generate

    Estes comandos gerarão automáticamente os arquivos necessários para que o Prisma consiga realizar a comunicação entre a aplicação e o banco de dados.

3.  Configuração do Banco de Dados:

      - Crie um arquivo .env dentro da pasta server e copie e cole dentro dele as seguintes linhas:

    DATABASE_URL="mysql://username:password@localhost:3306/mydb" 
    DATABASE_USER="username" 
    DATABASE_PASSWORD="password" 
    DATABASE_NAME="mydb" 
    DATABASE_HOST="localhost" 
    DATABASE_PORT=3306

      - Substitua:

    username -> nome do usuário do MySQL.
    password -> senha do usuário do MySQL.
    mydb -> nome do banco desejado.

      - Aplique as tabelas no banco:

    npx prisma migrate deploy

    Estes comandos criaram automaticamente todas as tabelas necessárias para o funcionamento do sistema dentro do banco de dados informado.

    Quando esse processo terminar, o servidor estará completamente configurado.

      - Inicie o servidor:

    Para iniciar o backend execute:

    node index.js

    O servidor ficará em execução aguardando conexões.

    **IMPORTANTE:** Mantenha essa janela do terminal aberta durante todo o tempo em que estiver utilizando o website.

4.  Configuração do Cliente (Frontend):

    Volte para a pasta principal do projeto:

    cd ..

    Agora entre na pasta do cliente:

    cd client

    Instale as dependências executando:

    npm i

    Esse comando instalará todas as bibliotecas necessárias para executar a interface do sistema.

Como Executar

Para rodar o projeto, você precisará de dois terminais abertos simultaneamente:

  - Terminal 1. (Servidor - o que abrimos no final do passo 3). Caso não o tenha aberto, entre na pasta server e execute:

    node index.js

  - Terminal 2. (Cliente - para inicar de fato o site) Abra a pasta client e execute:

    npm start

Acessos de Teste

| Perfil         | Identificador | Senha      | Funcionalidades                         |
| :------------- | :------------ | :--------- | :-------------------------------------- |
| **Admin**      | `admin.01`    | `senha123` | Gestão total, estoque e relatórios.     |
| **Contador**   | `cont.01`     | `senha123` | Registro de demanda de alunos.          |
| **Cozinheiro** | `coz.01`      | `senha123` | Cardápio, preparo e controle de sobras. |

Dicas de Administração (Prisma Studio)

Para preencher o banco de dados facilmente (estoque, escolas, turmas), use a
interface visual do Prisma:

1.  Na pasta /server, execute: npx prisma studio
2.  O navegador abrirá uma página. Escolha a tabela desejada, clique em "Add
    record", preencha os dados e salve.
      - Nota: Para o estoque funcionar, garanta que os ingredientes estejam
        cadastrados, mesmo com quantidade 0.

Arquitetura do Sistema

  - Frontend: React.js
  - Backend: Node.js + Express
  - ORM: Prisma
  - Banco de Dados: MySQL
