using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FeedHope.Migrations
{
    /// <inheritdoc />
    public partial class FixSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "4902ac38-49c7-49b5-b30b-54db74dc3d6b");

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "8556feef-cad1-4c11-aeaf-103194803312");

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "c537258b-8bcb-460c-b295-7062dc3e4f83");

            migrationBuilder.DeleteData(
                table: "UsuarioPerfis",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "45758c31-6d12-4c20-ac16-bdb372fd0310", "a26c5ca6-63b2-45b0-8bab-066628ebd0ff" });

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "45758c31-6d12-4c20-ac16-bdb372fd0310");

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: "a26c5ca6-63b2-45b0-8bab-066628ebd0ff");

            migrationBuilder.UpdateData(
                table: "Empresas",
                keyColumn: "Id",
                keyValue: 1,
                column: "DataCadastro",
                value: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.InsertData(
                table: "Perfis",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1", "admin-role-stamp", "Admin", "ADMIN" },
                    { "2", "empresa-role-stamp", "Empresa", "EMPRESA" },
                    { "3", "coletor-role-stamp", "Coletor", "COLETOR" },
                    { "4", "ufra-role-stamp", "UFRA", "UFRA" }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "AccessFailedCount", "Ativo", "CPF", "Cargo", "ConcurrencyStamp", "CriadoPor", "DataCadastro", "DataCriacao", "DataModificacao", "DataNascimento", "Email", "EmailConfirmed", "EmpresaId", "Endereco", "FotoPerfil", "LockoutEnabled", "LockoutEnd", "ModificadoPor", "NomeCompleto", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "ReceberNotificacoesEmail", "ReceberNotificacoesSMS", "SecurityStamp", "Telefone", "TwoFactorEnabled", "UltimoAcesso", "UserName" },
                values: new object[] { "admin-user-id", 0, true, null, "Administrador", "admin-concurrency-stamp", "Sistema", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "admin@feedhope.ufra.edu.br", true, null, null, null, false, null, null, "Administrador do Sistema", "ADMIN@FEEDHOPE.UFRA.EDU.BR", "ADMIN@FEEDHOPE.UFRA.EDU.BR", "AQAAAAIAAYagAAAAEC0LvtB325eGdql6kU++jZeXd20WVUVJVuVRTVb3WkywkXZhdelgUDg3Ysrdy1ar7g==", null, false, true, false, "admin-security-stamp", null, false, null, "admin@feedhope.ufra.edu.br" });

            migrationBuilder.InsertData(
                table: "UsuarioPerfis",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "1", "admin-user-id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "2");

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "3");

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "4");

            migrationBuilder.DeleteData(
                table: "UsuarioPerfis",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "1", "admin-user-id" });

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: "1");

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: "admin-user-id");

            migrationBuilder.UpdateData(
                table: "Empresas",
                keyColumn: "Id",
                keyValue: 1,
                column: "DataCadastro",
                value: new DateTime(2025, 6, 28, 8, 2, 48, 907, DateTimeKind.Local).AddTicks(7250));

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
        }
    }
}
