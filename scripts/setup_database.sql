-- Script de Configuração do Banco de Dados FeedHope
-- Execute este script como usuário root do MySQL

-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS FeedHopeDB 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Criar usuário para a aplicação
CREATE USER IF NOT EXISTS 'feedhope_user'@'localhost' IDENTIFIED BY 'senha4417';

-- 3. Conceder privilégios
GRANT ALL PRIVILEGES ON FeedHopeDB.* TO 'feedhope_user'@'localhost';

-- 4. Aplicar mudanças
FLUSH PRIVILEGES;

-- 5. Usar o banco criado
USE FeedHopeDB;

-- 6. Verificar a criação
SELECT 'Banco de dados FeedHopeDB criado com sucesso!' AS Status;
SELECT CONCAT('Usuário feedhope_user criado com privilégios no banco ', DATABASE()) AS Configuracao;

-- 7. Mostrar informações do banco
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';

