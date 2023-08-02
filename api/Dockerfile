FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS build
WORKDIR /app

COPY *.sln .
COPY *.csproj ./
RUN dotnet restore ./Web.csproj

COPY . ./
WORKDIR /app
RUN dotnet build Web.csproj -c Release -o out --no-cache
RUN dotnet publish Web.csproj -c Release -o out --no-cache


FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-alpine AS runtime
WORKDIR /app
COPY --from=build /app/out ./
EXPOSE 4000
EXPOSE 5000
ENV ASPNETCORE_URLS http://+:5000
ENTRYPOINT ["dotnet", "Web.dll"]