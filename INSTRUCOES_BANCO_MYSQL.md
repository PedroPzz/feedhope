# Instruções para Configuração do Banco de Dados MySQL - FeedHope

## Pré-requisitos

- Sistema operacional: Windows, Linux ou macOS
- .NET 6.0 SDK instalado
- MySQL Server 8.0 ou superior

## 1. Instalação do MySQL Server

### Windows
1. Baixe o MySQL Installer do site oficial: https://dev.mysql.com/downloads/installer/
2. Execute o instalador e escolha "Developer Default"
3. Configure a senha do usuário root durante a instalação
4. Anote a porta (padrão: 3306)

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

## 2. Configuração do Banco de Dados

### 2.1 Conectar ao MySQL como root
```bash
mysql -u root -p
```

### 2.2 Criar o banco de dados
```sql
CREATE DATABASE FeedHopeDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.3 Criar usuário específico para a aplicação
```sql
CREATE USER 'feedhope_user'@'localhost' IDENTIFIED BY 'senha4417';
GRANT ALL PRIVILEGES ON FeedHopeDB.* TO 'feedhope_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2.4 Verificar a criação
```sql
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'feedhope_user';
EXIT;
```

## 3. Configuração da Aplicação

### 3.1 String de Conexão
A string de conexão já está configurada no arquivo `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=FeedHopeDB;Uid=feedhope_user;Pwd=senha4417;"
  }
}
```

### 3.2 Pacotes NuGet Instalados
Os seguintes pacotes já foram adicionados ao projeto:
- `MySql.EntityFrameworkCore` (versão 6.0.25)
- `Pomelo.EntityFrameworkCore.MySql` (versão 6.0.2)
- `Microsoft.EntityFrameworkCore` (versão 6.0.25)
- `Microsoft.EntityFrameworkCore.Tools` (versão 6.0.0)

## 4. Executar Migrações

### 4.1 Instalar ferramentas do Entity Framework (se necessário)
```bash
dotnet tool install --global dotnet-ef --version 6.0.6
```

### 4.2 Adicionar ao PATH (Linux/macOS)
```bash
export PATH="$PATH:~/.dotnet/tools"
```

### 4.3 Criar migração inicial
```bash
dotnet ef migrations add InitialCreateMySql -o Data/Migrations
```

### 4.4 Aplicar migrações ao banco
```bash
dotnet ef database update
```

## 5. Verificação da Configuração

### 5.1 Verificar tabelas criadas
```sql
USE FeedHopeDB;
SHOW TABLES;
```

### 5.2 Verificar estrutura das principais tabelas
```sql
DESCRIBE Empresas;
DESCRIBE Usuarios;
DESCRIBE Alimentos;
DESCRIBE Coletas;
```

## 6. Usuários Padrão do Sistema

A aplicação criará automaticamente os seguintes usuários na primeira execução:

### Administrador
- **Email:** admin@feedhope.ufra.edu.br
- **Senha:** Admin@123
- **Perfil:** Admin

### Coordenador UFRA
- **Email:** ufra@feedhope.ufra.edu.br
- **Senha:** UFRA@123
- **Perfil:** UFRA

## 7. Executar a Aplicação

```bash
dotnet run
```

A aplicação estará disponível em:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001

## 8. Solução de Problemas

### Erro de Conexão
Se ocorrer erro de conexão, verifique:
1. Se o MySQL Server está rodando
2. Se as credenciais estão corretas
3. Se o banco de dados foi criado
4. Se o usuário tem permissões adequadas

### Verificar status do MySQL
```bash
# Linux/macOS
sudo systemctl status mysql

# Windows (como Administrador)
net start mysql80
```

### Reiniciar MySQL
```bash
# Linux/macOS
sudo systemctl restart mysql

# Windows (como Administrador)
net stop mysql80
net start mysql80
```

## 9. Backup e Restore

### Criar backup
```bash
mysqldump -u feedhope_user -p FeedHopeDB > feedhope_backup.sql
```

### Restaurar backup
```bash
mysql -u feedhope_user -p FeedHopeDB < feedhope_backup.sql
```

## 10. Configurações de Produção

Para ambiente de produção, considere:
1. Alterar as senhas padrão
2. Configurar SSL/TLS
3. Ajustar configurações de performance
4. Implementar backup automático
5. Configurar monitoramento

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação oficial do MySQL: https://dev.mysql.com/doc/
- Documentação do Entity Framework Core: https://docs.microsoft.com/ef/core/

