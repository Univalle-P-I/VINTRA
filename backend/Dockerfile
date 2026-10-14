FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Vintra.Backend/Vintra.Backend.csproj Vintra.Backend/
RUN dotnet restore Vintra.Backend/Vintra.Backend.csproj

COPY Vintra.Backend/ Vintra.Backend/
WORKDIR /src/Vintra.Backend

RUN dotnet publish Vintra.Backend.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:3000
EXPOSE 3000

ENTRYPOINT ["dotnet", "Vintra.Backend.dll"]
