using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FeedHope.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    CNPJ = table.Column<string>(type: "TEXT", maxLength: 18, nullable: false),
                    Tipo = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Endereco = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    CEP = table.Column<string>(type: "TEXT", maxLength: 9, nullable: true),
                    Cidade = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Estado = table.Column<string>(type: "TEXT", maxLength: 2, nullable: true),
                    Contato = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Responsavel = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Ativo"),
                    Observacoes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Perfis",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perfis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Relatorios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Titulo = table.Column<string>(type: "TEXT", nullable: false),
                    DataGeracao = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relatorios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Alimentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Tipo = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Descricao = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Quantidade = table.Column<int>(type: "INTEGER", nullable: false),
                    UnidadeMedida = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Validade = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Disponível"),
                    Observacoes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    EmpresaId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alimentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alimentos_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Coletas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmpresaId = table.Column<int>(type: "INTEGER", nullable: false),
                    DataColeta = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataSolicitacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Endereco = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Latitude = table.Column<double>(type: "REAL", nullable: true),
                    Longitude = table.Column<double>(type: "REAL", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pendente"),
                    Prioridade = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Normal"),
                    Observacoes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ResponsavelUFRA = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DataAprovacao = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DataInicioColeta = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DataConclusao = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MotivoRecusa = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    QuantidadeTotalColetada = table.Column<int>(type: "INTEGER", nullable: true),
                    OrdemColeta = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coletas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coletas_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    NomeCompleto = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CPF = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Telefone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    DataNascimento = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Endereco = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Cargo = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UltimoAcesso = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Ativo = table.Column<bool>(type: "INTEGER", nullable: false),
                    EmpresaId = table.Column<int>(type: "INTEGER", nullable: true),
                    FotoPerfil = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ReceberNotificacoesEmail = table.Column<bool>(type: "INTEGER", nullable: false),
                    ReceberNotificacoesSMS = table.Column<bool>(type: "INTEGER", nullable: false),
                    CriadoPor = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ModificadoPor = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DataModificacao = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true),
                    SecurityStamp = table.Column<string>(type: "TEXT", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PerfilClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilClaims_Perfis_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Perfis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlimentosColeta",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AlimentoId = table.Column<int>(type: "INTEGER", nullable: false),
                    ColetaId = table.Column<int>(type: "INTEGER", nullable: false),
                    QuantidadeColetada = table.Column<int>(type: "INTEGER", nullable: false),
                    EstadoAlimento = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Observacoes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    DataColeta = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlimentosColeta", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlimentosColeta_Alimentos_AlimentoId",
                        column: x => x.AlimentoId,
                        principalTable: "Alimentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AlimentosColeta_Coletas_ColetaId",
                        column: x => x.ColetaId,
                        principalTable: "Coletas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Destinacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TipoDestinacao = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Descricao = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Quantidade = table.Column<int>(type: "INTEGER", nullable: false),
                    UnidadeMedida = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Data = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LocalDestinacao = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    ResponsavelDestinacao = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    BeneficiariosEstimados = table.Column<int>(type: "INTEGER", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Planejada"),
                    Observacoes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataConclusao = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ColetaId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Destinacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Destinacoes_Coletas_ColetaId",
                        column: x => x.ColetaId,
                        principalTable: "Coletas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioClaims_Usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderKey = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_UsuarioLogins_Usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioPerfis",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioPerfis", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UsuarioPerfis_Perfis_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Perfis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuarioPerfis_Usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_UsuarioTokens_Usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Empresas",
                columns: new[] { "Id", "CEP", "CNPJ", "Cidade", "Contato", "DataCadastro", "Email", "Endereco", "Estado", "Nome", "Observacoes", "Responsavel", "Status", "Tipo" },
                values: new object[] { 1, null, "05.200.001/0001-04", null, "(91) 3210-1100", new DateTime(2025, 6, 28, 8, 2, 48, 907, DateTimeKind.Local).AddTicks(7250), "contato@ufra.edu.br", "Av. Presidente Tancredo Neves, 2501 - Terra Firme, Belém - PA", null, "UFRA - Universidade Federal Rural da Amazônia", "Universidade Federal Rural da Amazônia - Instituição responsável pelo projeto FeedHope", null, "Ativo", "Instituição de Ensino" });

            migrationBuilder.InsertData(
                table: "Perfis",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "45758c31-6d12-4c20-ac16-bdb372fd0310", "b0eb140f-2688-40b1-8889-4028ec78f8cd", "Admin", "ADMIN" },
                    { "4902ac38-49c7-49b5-b30b-54db74dc3d6b", "14d39bd3-6275-4328-8e62-8c4afc060bd4", "Coletor", "COLETOR" },
                    { "8556feef-cad1-4c11-aeaf-103194803312", "9bfab2d0-5df5-4585-901a-307e947b1904", "Empresa", "EMPRESA" },
                    { "c537258b-8bcb-460c-b295-7062dc3e4f83", "621905de-42f6-4a7a-940c-ea7e79569695", "UFRA", "UFRA" }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "AccessFailedCount", "Ativo", "CPF", "Cargo", "ConcurrencyStamp", "CriadoPor", "DataCadastro", "DataCriacao", "DataModificacao", "DataNascimento", "Email", "EmailConfirmed", "EmpresaId", "Endereco", "FotoPerfil", "LockoutEnabled", "LockoutEnd", "ModificadoPor", "NomeCompleto", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "ReceberNotificacoesEmail", "ReceberNotificacoesSMS", "SecurityStamp", "Telefone", "TwoFactorEnabled", "UltimoAcesso", "UserName" },
                values: new object[] { "a26c5ca6-63b2-45b0-8bab-066628ebd0ff", 0, true, null, "Administrador", "865ca155-d6fb-4adf-ab26-b40c6b41be6a", "Sistema", new DateTime(2025, 6, 28, 8, 2, 48, 906, DateTimeKind.Local).AddTicks(4368), new DateTime(2025, 6, 28, 8, 2, 48, 906, DateTimeKind.Local).AddTicks(6972), null, null, "admin@feedhope.ufra.edu.br", true, null, null, null, false, null, null, "Administrador do Sistema", "ADMIN@FEEDHOPE.UFRA.EDU.BR", "ADMIN@FEEDHOPE.UFRA.EDU.BR", "AQAAAAIAAYagAAAAELuyZiMkYDfFvbIlCq+MHulQZhyljj2jk0A93M9jDRGd+dan614OmMKqMNfW/8Vwug==", null, false, true, false, "4ae26526-89ed-4545-8b8e-5801d5034c6f", null, false, null, "admin@feedhope.ufra.edu.br" });

            migrationBuilder.InsertData(
                table: "UsuarioPerfis",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "45758c31-6d12-4c20-ac16-bdb372fd0310", "a26c5ca6-63b2-45b0-8bab-066628ebd0ff" });

            migrationBuilder.CreateIndex(
                name: "IX_Alimentos_EmpresaId",
                table: "Alimentos",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_AlimentosColeta_AlimentoId",
                table: "AlimentosColeta",
                column: "AlimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlimentosColeta_ColetaId",
                table: "AlimentosColeta",
                column: "ColetaId");

            migrationBuilder.CreateIndex(
                name: "IX_Coletas_EmpresaId",
                table: "Coletas",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Destinacoes_ColetaId",
                table: "Destinacoes",
                column: "ColetaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_CNPJ",
                table: "Empresas",
                column: "CNPJ",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Email",
                table: "Empresas",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerfilClaims_RoleId",
                table: "PerfilClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "Perfis",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioClaims_UserId",
                table: "UsuarioClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioLogins_UserId",
                table: "UsuarioLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioPerfis_RoleId",
                table: "UsuarioPerfis",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "Usuarios",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_CPF",
                table: "Usuarios",
                column: "CPF",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_EmpresaId",
                table: "Usuarios",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "Usuarios",
                column: "NormalizedUserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlimentosColeta");

            migrationBuilder.DropTable(
                name: "Destinacoes");

            migrationBuilder.DropTable(
                name: "PerfilClaims");

            migrationBuilder.DropTable(
                name: "Relatorios");

            migrationBuilder.DropTable(
                name: "UsuarioClaims");

            migrationBuilder.DropTable(
                name: "UsuarioLogins");

            migrationBuilder.DropTable(
                name: "UsuarioPerfis");

            migrationBuilder.DropTable(
                name: "UsuarioTokens");

            migrationBuilder.DropTable(
                name: "Alimentos");

            migrationBuilder.DropTable(
                name: "Coletas");

            migrationBuilder.DropTable(
                name: "Perfis");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Empresas");
        }
    }
}
