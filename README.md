# FeedHope - Plataforma de Reaproveitamento de Alimentos

## 📋 Sobre o Projeto

O FeedHope é uma plataforma desenvolvida para a UFRA (Universidade Federal Rural da Amazônia) que conecta empresas doadoras a entidades receptoras, facilitando o reaproveitamento de alimentos e reduzindo o desperdício.

## 🚀 Tecnologias Utilizadas

- **Backend**: ASP.NET Core 8.0 MVC
- **Banco de Dados**: SQLite (desenvolvimento) / SQL Server (produção)
- **ORM**: Entity Framework Core
- **Autenticação**: ASP.NET Core Identity
- **Frontend**: Bootstrap 5, Font Awesome, Chart.js
- **Linguagem**: C# (.NET 8.0)

## 🏗️ Arquitetura

### Modelos Principais
- **ApplicationUser**: Usuários do sistema com perfis específicos
- **EmpresaModel**: Empresas doadoras
- **AlimentoModel**: Alimentos disponíveis para doação
- **ColetaModel**: Solicitações e controle de coletas
- **DestinacaoModel**: Destinação final dos alimentos coletados
- **RelatorioModel**: Sistema de relatórios e indicadores

### Perfis de Usuário
- **Admin**: Administrador geral do sistema
- **Empresa**: Empresas que doam alimentos
- **Coletor**: Responsáveis pela coleta dos alimentos
- **UFRA**: Coordenadores da universidade que aprovam/recusam coletas

## 🔐 Credenciais Padrão

### Administrador
- **Email**: admin@feedhope.ufra.edu.br
- **Senha**: Admin@123
- **Perfil**: Admin

### UFRA
- **Email**: ufra@feedhope.ufra.edu.br
- **Senha**: UFRA@123
- **Perfil**: UFRA

## 📦 Instalação e Configuração

### Pré-requisitos
- .NET 8.0 SDK
- SQLite (desenvolvimento) ou SQL Server (produção)

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd FeedHope
   ```

2. **Restaure os pacotes NuGet**
   ```bash
   dotnet restore
   ```

3. **Configure a string de conexão**
   - Edite o arquivo `appsettings.json`
   - Para SQLite (padrão): `"DefaultConnection": "Data Source=FeedHope.db"`
   - Para SQL Server: `"DefaultConnection": "Server=...;Database=FeedHope;..."`

4. **Execute as migrações**
   ```bash
   dotnet ef database update
   ```

5. **Execute a aplicação**
   ```bash
   dotnet run
   ```

6. **Acesse a aplicação**
   - URL: `https://localhost:5001` ou `http://localhost:5000`

## 🎯 Funcionalidades Principais

### 📊 Dashboard e Relatórios
- Dashboard principal com estatísticas gerais
- Relatório de impacto ambiental (CO2, água, energia)
- Relatório de quantidade coletada
- Relatório de formas de uso dos alimentos
- Ranking de empresas doadoras
- Relatórios mensais com comparações
- Exportação de dados em JSON

### 🏢 Gestão de Empresas
- Cadastro de empresas doadoras
- Controle de status (Ativo/Inativo)
- Histórico de doações
- Dashboard específico para empresas

### 🍎 Gestão de Alimentos
- Cadastro de alimentos com validade e quantidade
- Controle de status (Disponível/Coletado/Expirado)
- Filtros por tipo, status e proximidade do vencimento
- Alertas para alimentos próximos ao vencimento

### 🚛 Sistema de Coletas
- Solicitação de coletas pelas empresas
- Aprovação/recusa pela UFRA
- Controle de logística e ordem de coleta
- Status em tempo real (Pendente/Aprovada/Em Coleta/Coletada)
- Mapa de coletas (interface preparada)
- Definição de prioridades

### 🎯 Destinação de Alimentos
- Registro de destinação final dos alimentos
- Tipos: Refeitório, Uso Agrícola, Compostagem, Doação Direta, etc.
- Controle de beneficiários atendidos
- Dashboard de destinações

### 🔐 Sistema de Autenticação
- Login/logout com ASP.NET Identity
- Controle de acesso baseado em perfis
- Páginas protegidas por autorização
- Gestão de usuários

## 🎨 Interface e UX

### Design Responsivo
- Layout adaptável para desktop e mobile
- Navbar responsiva com dropdowns
- Cards e componentes modernos
- Animações e transições suaves

### Sistema de Alertas
- Mensagens de sucesso/erro/informação
- Auto-dismiss após 5 segundos
- Animações de entrada

### Validações
- Validação client-side e server-side
- Máscaras para CNPJ, telefone, CEP
- Feedback visual em tempo real

## 📈 Indicadores e Métricas

### Impacto Ambiental
- CO2 evitado: 2.5kg por kg de alimento reaproveitado
- Água economizada: 1000L por kg de alimento
- Energia economizada: 3.3kWh por kg de alimento

### Estatísticas Gerais
- Total de empresas cadastradas
- Quantidade total de alimentos coletados
- Número de beneficiários atendidos
- Eficiência por tipo de destinação

## 🔧 Configurações Avançadas

### Políticas de Autorização
```csharp
// Exemplos de uso nos controllers
[Authorize(Roles = "Admin")]
[Authorize(Policy = "UFRAOnly")]
[Authorize(Policy = "EmpresaOrUFRA")]
```

### Configuração de Cookies
- Expiração: 8 horas
- SlidingExpiration: habilitado
- HttpOnly: habilitado

### Configuração de Senha
- Mínimo 6 caracteres
- Requer maiúscula, minúscula e dígito
- Lockout após 5 tentativas falhas

## 📁 Estrutura do Projeto

```
FeedHope/
├── Controllers/          # Controllers MVC
├── Models/              # Modelos de dados
├── Views/               # Views Razor
├── Data/                # Contexto do banco de dados
├── Migrations/          # Migrações do EF Core
├── wwwroot/            # Arquivos estáticos
│   ├── css/            # Estilos CSS
│   ├── js/             # JavaScript
│   └── lib/            # Bibliotecas externas
├── appsettings.json    # Configurações
├── Program.cs          # Configuração da aplicação
└── README.md           # Este arquivo
```

## 🧪 Testes

### Testes Manuais Realizados
- ✅ Compilação sem erros ou warnings
- ✅ Inicialização da aplicação
- ✅ Criação automática do banco de dados
- ✅ Criação de usuários padrão
- ✅ Sistema de autenticação
- ✅ Navegação entre páginas
- ✅ Responsividade do layout

### Fluxos Testados
- ✅ Cadastro de empresas
- ✅ Cadastro de alimentos
- ✅ Solicitação de coletas
- ✅ Aprovação/recusa pela UFRA
- ✅ Controle de logística
- ✅ Destinação de alimentos
- ✅ Geração de relatórios

## 🚀 Deploy

### Desenvolvimento
```bash
dotnet run --environment Development
```

### Produção
```bash
dotnet publish -c Release
# Configurar IIS ou servidor web
# Configurar string de conexão para SQL Server
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido para a UFRA - Universidade Federal Rural da Amazônia.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Email: admin@feedhope.ufra.edu.br
- Documentação: Este arquivo README.md

## 🔄 Versionamento

- **v1.0.0** - Versão inicial com todas as funcionalidades implementadas
  - Sistema de autenticação e autorização
  - Gestão completa de empresas, alimentos, coletas e destinações
  - Relatórios e indicadores de impacto
  - Interface responsiva e moderna
  - Banco de dados configurado com SQLite/SQL Server

---

**Desenvolvido com ❤️ para a UFRA - Universidade Federal Rural da Amazônia**

