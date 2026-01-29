# 🐳 Guia Docker - API Fastify

## 📋 Pré-requisitos
- Docker instalado
- Docker Compose instalado

## 🚀 Como usar

### 1. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/seu_banco
JWT_SECRET=sua_chave_secreta_super_segura_aqui
PORT=3000
```

### 2. Construir e iniciar os containers

```bash
# Constrói e inicia todos os serviços
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver os logs
docker-compose logs -f
```

### 3. Parar os containers

```bash
# Para os containers
docker-compose down

# Para e remove volumes (CUIDADO: apaga dados do banco!)
docker-compose down -v
```

## 🛠️ Comandos úteis

```bash
# Reconstruir a imagem após mudanças no código
docker-compose up -d --build

# Acessar o terminal do container da API
docker exec -it fastify-api sh

# Acessar o MongoDB
docker exec -it mongodb mongosh

# Ver logs apenas da API
docker-compose logs -f api

# Reiniciar apenas um serviço
docker-compose restart api
```

## 🔧 Para Desenvolvimento

Se quiser usar para desenvolvimento com hot-reload, modifique o `docker-compose.yml`:

```yaml
api:
  command: npm run dev  # Usa o script dev do package.json
  volumes:
    - ./src:/app/src  # Sincroniza o código fonte
```

## 📝 Estrutura esperada do projeto

```
seu-projeto/
├── src/
│   └── server.ts
├── package.json
├── tsconfig.json (se usar)
├── .env
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

## ⚠️ Importante

1. **Nunca** commite o arquivo `.env` com dados sensíveis
2. Mude o `JWT_SECRET` para algo seguro
3. Ajuste o nome do banco de dados no `MONGODB_URI`
4. A porta padrão é 3000, ajuste se necessário