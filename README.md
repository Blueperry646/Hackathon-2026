HACKATHON-2026
Guia de Instalação e Utilização do projeto TIAMARI

======================================================================
1. REQUISITOS
======================================================================

Antes de iniciar a instalação do projeto, certifique-se de possuir os seguintes programas instalados em seu computador:

* Git
* Node.js (inclui o gerenciador de pacotes npm)
* MySQL Server

Downloads:

Git:
https://git-scm.com/downloads

Node.js:
https://nodejs.org/en/download/current

Também é recomendado utilizar o MySQL Workbench para facilitar a criação e gerenciamento do banco de dados.

======================================================================
2. CLONANDO O PROJETO
======================================================================

Após instalar o Git, abra um terminal e execute o comando:

git clone https://github.com/Blueperry646/Hackathon-2026.git

Esse comando fará o download de todo o projeto para seu computador, criando uma pasta chamada "Hackathon-2026".

Entre nessa pasta utilizando:

cd Hackathon-2026

Dentro dela existirão duas subpastas:

client
server

A pasta "server" contém o servidor e toda a lógica do sistema.
A pasta "client" contém a interface do website.

======================================================================
3. CONFIGURANDO O SERVIDOR
======================================================================

Entre na pasta "server":

cd server

Agora instale todas as dependências do projeto executando:

npm i

Esse comando fará o download de todas as bibliotecas necessárias para o funcionamento do servidor. Ao final da instalação será criada uma pasta chamada "node_modules".

Em seguida execute:

npx prisma generate

Esse comando gera automaticamente os arquivos necessários para que o Prisma consiga realizar a comunicação entre a aplicação e o banco de dados.

======================================================================
4. CONFIGURANDO O BANCO DE DADOS
======================================================================

Agora, dentro da pasta:

Hackathon-2026/server

crie um arquivo chamado:

.env

Dentro desse arquivo escreva:

DATABASE_URL="mysql://username:password@localhost:3306/mydb"
DATABASE_USER="username"
DATABASE_PASSWORD="password"
DATABASE_NAME="mydb"
DATABASE_HOST="localhost"
DATABASE_PORT=3306

Substitua:

username -> nome do usuário do MySQL.

password -> senha do usuário do MySQL.

mydb -> nome do banco desejado.

Essas informações serão utilizadas pelo servidor para estabelecer conexão com o banco de dados.

======================================================================
5. CRIANDO AS TABELAS DO BANCO
======================================================================

Após criar e configurar o arquivo ".env", execute:

npx prisma migrate deploy

Esse comando criará automaticamente todas as tabelas necessárias para o funcionamento do sistema dentro do banco de dados informado.

Quando esse processo terminar, o servidor estará completamente configurado.

======================================================================
6. INICIANDO O SERVIDOR
======================================================================

Para iniciar o backend execute:

node index.js

O servidor ficará em execução aguardando conexões.

IMPORTANTE:
Mantenha essa janela do terminal aberta durante todo o tempo em que estiver utilizando o website.

======================================================================
7. CONFIGURANDO O CLIENTE
======================================================================

Volte para a pasta principal do projeto:

cd ..

Agora entre na pasta do cliente:

cd client

Instale as dependências executando:

npm i

Esse comando instalará todas as bibliotecas necessárias para executar a interface do sistema.

======================================================================
8. INICIANDO O WEBSITE
======================================================================

Após a instalação terminar execute:

npm start

Esse comando iniciará o website. Aguarde alguns segundos até que ele seja aberto no navegador ou acesse o endereço informado no terminal.

======================================================================
9. USUÁRIOS DE TESTE
======================================================================

O sistema possui três usuários de demonstração para testar cada nível de acesso.

---

## Administrador

Identificador:
admin.01

Senha:
senha123

O administrador possui acesso completo ao sistema. Ele pode cadastrar refeições da semana, definir refeições para cada turma e horário, controlar o estoque e visualizar relatórios e estatísticas em tempo real.

---

## Contador

Identificador:
cont.01

Senha:
senha123

O contador é responsável por registrar diariamente a quantidade de pessoas que irão realizar as refeições. Também informa o número de refeições especiais quando necessário.

---

## Cozinheiro

Identificador:
coz.01

Senha:
senha123

O cozinheiro possui acesso às refeições programadas para o dia, aos horários em que serão servidas, à quantidade de porções necessárias e ao número de refeições especiais. Após o preparo, também registra a quantidade de alimento preparada e a quantidade de alimento restante ao final de cada turno.

======================================================================
10. FUNCIONAMENTO DO SISTEMA
======================================================================

Cada usuário possui acesso apenas às funcionalidades correspondentes ao seu cargo.

Contador:

* Registrar a quantidade de pessoas que irão realizar as refeições.
* Selecionar a turma correspondente.
* Informar a quantidade de refeições especiais quando existirem.

Cozinheiro:

* Consultar o cardápio diário.
* Visualizar horários das refeições.
* Consultar a quantidade de porções que deverão ser preparadas.
* Registrar a quantidade de alimento preparada.
* Registrar a quantidade de alimento restante após cada turno.

Administrador:

* Gerenciar as refeições da semana.
* Criar novas refeições para cada turma e horário.
* Gerenciar as movimentações de estoque.
* Visualizar relatórios e planilhas informativas em tempo real.
* Acompanhar todos os dados do sistema.

======================================================================
11. ADICIONANDO VALORES AO BANCO DE DADOS
======================================================================

O arquivo base de exemplo só poussui 5 usuários, alguns ingredientes, pratos e uma única escola; 
Mas para a utilização completa de nosso protótipo é necessário varias outros valores em outras tabelas como Estoque de ingredientes, outras escolas, turmas, etc.
O método mais fácil de fazer isso (entretanto limitado a sua máquina [ou seja, ao mudar de computador não seguiram]) é utilizando o comando:
npx prisma studio 
na pasta /Hackathon-2026/server
após executar esse comando será levado à uma página web com um menu com todas as tabelas de nosso protótipo, clique na que deseja adicionar valores e, em seguida, clique em "Add record" na tool bar localizada no topo da página;
insira os valores desejado e clique em "Save (X) change(s)".