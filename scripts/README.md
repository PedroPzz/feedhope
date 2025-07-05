# Scripts de Configuração do Banco de Dados

Esta pasta contém scripts para facilitar a configuração do banco de dados MySQL para o projeto FeedHope.

## Arquivos Disponíveis

### 1. setup_database.sql
Script SQL puro que pode ser executado diretamente no MySQL para:
- Criar o banco de dados `FeedHopeDB`
- Criar o usuário `feedhope_user`
- Configurar permissões adequadas

**Como usar:**
```bash
mysql -u root -p < setup_database.sql
```

### 2. setup_database.sh (Linux/macOS)
Script bash automatizado que:
- Verifica se o MySQL está instalado e rodando
- Solicita a senha do root
- Executa o script SQL automaticamente
- Fornece feedback sobre o processo

**Como usar:**
```bash
chmod +x setup_database.sh
./setup_database.sh
```

### 3. setup_database.bat (Windows)
Script batch para Windows que:
- Verifica se o MySQL está instalado e rodando
- Solicita a senha do root
- Executa o script SQL automaticamente
- Fornece feedback sobre o processo

**Como usar:**
```cmd
setup_database.bat
```

## Pré-requisitos

Antes de executar qualquer script, certifique-se de que:

1. **MySQL Server está instalado**
   - Windows: MySQL Installer
   - Linux: `sudo apt install mysql-server`
   - macOS: `brew install mysql`

2. **MySQL Server está rodando**
   - Linux: `sudo systemctl start mysql`
   - macOS: `brew services start mysql`
   - Windows: `net start mysql80`

3. **Você conhece a senha do usuário root do MySQL**

## Configuração Resultante

Após executar qualquer um dos scripts, você terá:

- **Banco de dados:** FeedHopeDB
- **Usuário:** feedhope_user
- **Senha:** senha4417
- **Servidor:** localhost
- **Porta:** 3306

## Próximos Passos

Após configurar o banco de dados:

1. **Gerar migrações:**
   ```bash
   dotnet ef migrations add InitialCreateMySql -o Data/Migrations
   ```

2. **Aplicar migrações:**
   ```bash
   dotnet ef database update
   ```

3. **Executar a aplicação:**
   ```bash
   dotnet run
   ```

## Solução de Problemas

### Script não executa (Linux/macOS)
```bash
chmod +x setup_database.sh
```

### MySQL não encontrado
Verifique se o MySQL está no PATH do sistema.

### Erro de autenticação
Verifique se a senha do root está correta.

### Serviço MySQL não inicia
```bash
# Linux
sudo systemctl status mysql
sudo systemctl restart mysql

# macOS
brew services restart mysql

# Windows (como Administrador)
net stop mysql80
net start mysql80
```

