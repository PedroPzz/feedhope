# Etapa 1: build
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

COPY *.sln .
COPY FeedHope/*.csproj ./FeedHope/
RUN dotnet restore

COPY FeedHope/. ./FeedHope/
WORKDIR /app/FeedHope
RUN dotnet publish -c Release -o out

# Etapa 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/FeedHope/out ./
ENTRYPOINT ["dotnet", "FeedHope.dll"]
