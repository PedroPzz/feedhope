#!/bin/bash

# Script de Configuração Automática do Banco de Dados FeedHope
# Para sistemas Linux/macOS

echo "=== Configuração do Banco de Dados FeedHope ==="
echo ""

# Verificar se o MySQL está instalado
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL não está instalado. Por favor, instale o MySQL primeiro."
    echo "Ubuntu/Debian: sudo apt install mysql-server"
    echo "CentOS/RHEL: sudo yum install mysql-server"
    echo "macOS: brew install mysql"
    exit 1
fi

# Verificar se o MySQL está rodando
if ! systemctl is-active --quiet mysql && ! brew services list | grep mysql | grep started &> /dev/null; then
    echo "❌ MySQL não está rodando. Iniciando o serviço..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mysql
    elif command -v brew &> /dev/null; then
        brew services start mysql
    fi
    
    # Verificar novamente
    sleep 2
    if ! systemctl is-active --quiet mysql && ! brew services list | grep mysql | grep started &> /dev/null; then
        echo "❌ Falha ao iniciar o MySQL. Verifique a instalação."
        exit 1
    fi
fi

echo "✅ MySQL está rodando"

# Solicitar senha do root
echo ""
echo "Digite a senha do usuário root do MySQL:"
read -s ROOT_PASSWORD

# Testar conexão
if ! mysql -u root -p"$ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
    echo "❌ Falha na autenticação. Verifique a senha do root."
    exit 1
fi

echo "✅ Conexão com MySQL estabelecida"

# Executar script de configuração
echo ""
echo "Configurando banco de dados..."

mysql -u root -p"$ROOT_PASSWORD" < "$(dirname "$0")/setup_database.sql"

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados configurado com sucesso!"
    echo ""
    echo "Informações da configuração:"
    echo "- Servidor: localhost"
    echo "- Porta: 3306"
    echo "- Banco: FeedHopeDB"
    echo "- Usuário: feedhope_user"
    echo "- Senha: senha4417"
    echo ""
    echo "Próximos passos:"
    echo "1. Execute: dotnet ef migrations add InitialCreateMySql -o Data/Migrations"
    echo "2. Execute: dotnet ef database update"
    echo "3. Execute: dotnet run"
else
    echo "❌ Erro ao configurar o banco de dados"
    exit 1
fi

