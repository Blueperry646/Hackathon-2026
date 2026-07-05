-- CreateTable
CREATE TABLE `escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `identificador` VARCHAR(20) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `perfil` ENUM('ADMIN', 'CONTADOR', 'COZINHEIRO') NOT NULL,
    `id_escola` INTEGER NOT NULL,

    UNIQUE INDEX `usuario_identificador_key`(`identificador`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turma` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(30) NOT NULL,
    `id_escola` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restricao_alimentar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingrediente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `unidade` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prato_ingrediente` (
    `id_prato` INTEGER NOT NULL,
    `id_ingrediente` INTEGER NOT NULL,
    `quantidade` DECIMAL(8, 2) NOT NULL,

    PRIMARY KEY (`id_prato`, `id_ingrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardapio_semanal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataRefeicao` DATE NOT NULL,
    `horario` TIME(0) NOT NULL,
    `id_escola` INTEGER NOT NULL,
    `id_turma` INTEGER NOT NULL,
    `id_prato` INTEGER NOT NULL,
    `id_restricao` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `confirmacao_refeicao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataRefeicao` DATE NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `id_turma` INTEGER NOT NULL,
    `id_restricao` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producao_refeicao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `horaPreparo` TIME(0) NULL,
    `kgProduzido` DECIMAL(8, 2) NULL,
    `kgSobra` DECIMAL(8, 2) NULL,
    `id_cardapio` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantidade` DECIMAL(10, 2) NOT NULL,
    `validade` DATE NULL,
    `id_escola` INTEGER NOT NULL,
    `id_ingrediente` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimentacao_estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `quantidade` DECIMAL(10, 2) NOT NULL,
    `dataMovimentacao` DATETIME(0) NOT NULL,
    `id_estoque` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_id_escola_fkey` FOREIGN KEY (`id_escola`) REFERENCES `escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turma` ADD CONSTRAINT `turma_id_escola_fkey` FOREIGN KEY (`id_escola`) REFERENCES `escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prato_ingrediente` ADD CONSTRAINT `prato_ingrediente_id_prato_fkey` FOREIGN KEY (`id_prato`) REFERENCES `prato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prato_ingrediente` ADD CONSTRAINT `prato_ingrediente_id_ingrediente_fkey` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingrediente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardapio_semanal` ADD CONSTRAINT `cardapio_semanal_id_escola_fkey` FOREIGN KEY (`id_escola`) REFERENCES `escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardapio_semanal` ADD CONSTRAINT `cardapio_semanal_id_turma_fkey` FOREIGN KEY (`id_turma`) REFERENCES `turma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardapio_semanal` ADD CONSTRAINT `cardapio_semanal_id_prato_fkey` FOREIGN KEY (`id_prato`) REFERENCES `prato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardapio_semanal` ADD CONSTRAINT `cardapio_semanal_id_restricao_fkey` FOREIGN KEY (`id_restricao`) REFERENCES `restricao_alimentar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `confirmacao_refeicao` ADD CONSTRAINT `confirmacao_refeicao_id_turma_fkey` FOREIGN KEY (`id_turma`) REFERENCES `turma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `confirmacao_refeicao` ADD CONSTRAINT `confirmacao_refeicao_id_restricao_fkey` FOREIGN KEY (`id_restricao`) REFERENCES `restricao_alimentar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producao_refeicao` ADD CONSTRAINT `producao_refeicao_id_cardapio_fkey` FOREIGN KEY (`id_cardapio`) REFERENCES `cardapio_semanal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producao_refeicao` ADD CONSTRAINT `producao_refeicao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estoque` ADD CONSTRAINT `estoque_id_escola_fkey` FOREIGN KEY (`id_escola`) REFERENCES `escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estoque` ADD CONSTRAINT `estoque_id_ingrediente_fkey` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingrediente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentacao_estoque` ADD CONSTRAINT `movimentacao_estoque_id_estoque_fkey` FOREIGN KEY (`id_estoque`) REFERENCES `estoque`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 1. Inserindo uma Escola (necessária para os usuários)
INSERT INTO `escola` (`nome`) VALUES ('Escola Municipal Padrão');

-- 2. Inserindo 5 Usuários (Garantindo um de cada perfil)
-- Senhas em texto simples para exemplo, em produção use hashes.
INSERT INTO `usuario` (`nome`, `identificador`, `senha`, `perfil`, `id_escola`) VALUES 
('Alice Administradora', 'admin.01', 'senha123', 'ADMIN', 1),
('Bruno Contador', 'cont.01', 'senha123', 'CONTADOR', 1),
('Carlos Cozinheiro', 'coz.01', 'senha123', 'COZINHEIRO', 1),
('Daniela Cozinheira', 'coz.02', 'senha123', 'COZINHEIRO', 1),
('Eduardo Contador', 'cont.02', 'senha123', 'CONTADOR', 1);

-- 3. Inserindo 5 Ingredientes
INSERT INTO `ingrediente` (`nome`, `unidade`) VALUES 
('Arroz Branco', 'kg'),
('Feijão Carioca', 'kg'),
('Peito de Frango', 'kg'),
('Óleo de Soja', 'Litro'),
('Sal Refinado', 'kg');

-- 4. Inserindo 3 Pratos
INSERT INTO `prato` (`nome`) VALUES 
('Arroz com Feijão Simples'),
('Canja de Galinha'),
('Frango Grelhado com Arroz');

-- 5. Opcional: Vinculando Ingredientes aos Pratos (Tabela prato_ingrediente)
-- Isso é necessário para que o sistema saiba o que compõe cada prato
INSERT INTO `prato_ingrediente` (`id_prato`, `id_ingrediente`, `quantidade`) VALUES 
(1, 1, 0.10), -- Arroz no 'Arroz com Feijão'
(1, 2, 0.08), -- Feijão no 'Arroz com Feijão'
(2, 3, 0.15), -- Frango na 'Canja'
(2, 1, 0.05), -- Arroz na 'Canja'
(3, 3, 0.20), -- Frango no 'Frango Grelhado'
(3, 1, 0.10); -- Arroz no 'Frango Grelhado'
