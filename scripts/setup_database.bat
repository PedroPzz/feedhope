@echo off
REM Script de Configuração Automática do Banco de Dados FeedHope
REM Para sistemas Windows

echo === Configuração do Banco de Dados FeedHope ===
echo.

REM Verificar se o MySQL está instalado
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL não está instalado ou não está no PATH.
    echo Por favor, instale o MySQL Server e adicione ao PATH.
    echo Download: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo ✅ MySQL encontrado

REM Verificar se o MySQL está rodando
net start | find "MySQL" >nul
if %errorlevel% neq 0 (
    echo ❌ MySQL não está rodando. Tentando iniciar...
    net start mysql80
    if %errorlevel% neq 0 (
        echo ❌ Falha ao iniciar o MySQL. Verifique a instalação.
        pause
        exit /b 1
    )
)

echo ✅ MySQL está rodando

REM Solicitar senha do root
echo.
set /p ROOT_PASSWORD=Digite a senha do usuário root do MySQL: 

REM Testar conexão
mysql -u root -p%ROOT_PASSWORD% -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Falha na autenticação. Verifique a senha do root.
    pause
    exit /b 1
)

echo ✅ Conexão com MySQL estabelecida

REM Executar script de configuração
echo.
echo Configurando banco de dados...

mysql -u root -p%ROOT_PASSWORD% < "%~dp0setup_database.sql"

if %errorlevel% equ 0 (
    echo ✅ Banco de dados configurado com sucesso!
    echo.
    echo Informações da configuração:
    echo - Servidor: localhost
    echo - Porta: 3306
    echo - Banco: FeedHopeDB
    echo - Usuário: feedhope_user
    echo - Senha: senha4417
    echo.
    echo Próximos passos:
    echo 1. Execute: dotnet ef migrations add InitialCreateMySql -o Data/Migrations
    echo 2. Execute: dotnet ef database update
    echo 3. Execute: dotnet run
) else (
    echo ❌ Erro ao configurar o banco de dados
)

echo.
pause

