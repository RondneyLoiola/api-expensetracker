# 🚀 API Expense Tracker

API RESTful desenvolvida em Node.js + TypeScript para gerenciamento de despesas pessoais. Backend do projeto Expense Tracker.

## 📋 Sobre o Projeto

Esta API fornece todos os endpoints necessários para gerenciar despesas, usuários e categorias do aplicativo Expense Tracker. Construída com foco em segurança, performance e boas práticas de desenvolvimento.

## ✨ Funcionalidades

- 🔐 Autenticação e autorização de usuários
- 💰 CRUD completo de despesas
- 📁 Gerenciamento de categorias
- 👤 Gerenciamento de perfil de usuário
- 📊 Relatórios e estatísticas
- 🔍 Filtros e buscas avançadas
- ✅ Validação de dados
- 🛡️ Proteção contra ataques comuns

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **TypeScript** - JavaScript com tipagem estática
- **Express** - Framework web para Node.js
- **Mongoose** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **Biome** - Linter e formatador de código
- **Zod** - Validação de schemas

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/RondneyLoiola/api-expensetracker.git
```

2. Entre na pasta do projeto:
```bash
cd api-expensetracker
```

3. Instale as dependências:
```bash
npm install
# ou
yarn install
```

4. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
cp .env.example .env
```

5. Edite o arquivo `.env` com suas configurações:
```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/expensetracker"

# JWT
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3333
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

6. Execute as migrations do banco de dados:
```bash
npx prisma migrate dev
# ou
yarn prisma migrate dev
```

7. (Opcional) Popule o banco com dados de exemplo:
```bash
npm run seed
# ou
yarn seed
```

## 🚀 Executando o Projeto

### Modo de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A API estará disponível em `http://localhost:3333`

### Modo de Produção

```bash
# Build do projeto
npm run build
# ou
yarn build

# Executar
npm start
# ou
yarn start
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000/
```

### Autenticação

Todos os endpoints (exceto login e registro) requerem um token JWT no header:
```
Authorization: Bearer {seu_token_aqui}
```

### Endpoints Principais

#### 🔐 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar novo usuário |
| POST | `/auth/login` | Login de usuário |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Logout de usuário |

#### 👤 Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users/me` | Obter perfil do usuário |
| PUT | `/users/me` | Atualizar perfil |
| DELETE | `/users/me` | Deletar conta |

#### 💰 Despesas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/expenses` | Listar todas as despesas |
| GET | `/expenses/:id` | Obter uma despesa específica |
| POST | `/expenses` | Criar nova despesa |
| PUT | `/expenses/:id` | Atualizar despesa |
| DELETE | `/expenses/:id` | Deletar despesa |

#### 📁 Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/categories` | Listar todas as categorias |
| GET | `/categories/:id` | Obter uma categoria específica |
| POST | `/categories` | Criar nova categoria |
| PUT | `/categories/:id` | Atualizar categoria |
| DELETE | `/categories/:id` | Deletar categoria |

#### 📊 Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/reports/summary` | Resumo financeiro |
| GET | `/reports/by-category` | Gastos por categoria |
| GET | `/reports/monthly` | Relatório mensal |

### Exemplos de Requisições

#### Registrar Usuário
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### Criar Despesa
```bash
POST /api/v1/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Almoço",
  "amount": 45.50,
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2026-01-18"
}
```

#### Listar Despesas com Filtros
```bash
GET /api/v1/expenses?month=1&year=2026&categoryId=123
Authorization: Bearer {token}
```

### Respostas da API

#### Sucesso (200/201)
```json
{
  "success": true,
  "data": {
    "id": "123",
    "description": "Almoço",
    "amount": 45.50
  }
}
```

#### Erro (400/401/404/500)
```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "code": "ERROR_CODE"
  }
}
```

## 📁 Estrutura do Projeto

```
api-expensetracker/
├── src/
│   ├── controllers/       # Controladores das rotas
│   ├── middlewares/       # Middlewares (auth, validação, etc)
│   ├── models/           # Modelos do Prisma
│   ├── routes/           # Definição das rotas
│   ├── services/         # Lógica de negócio
│   ├── utils/            # Funções utilitárias
│   ├── validators/       # Schemas de validação
│   ├── config/           # Configurações
│   ├── types/            # Tipos TypeScript
│   └── server.ts         # Arquivo principal
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   ├── migrations/       # Migrations
│   └── seed.ts          # Dados de exemplo
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json          # Dependências
└── tsconfig.json         # Configuração TypeScript
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test
# ou
yarn test

# Testes com cobertura
npm run test:coverage
# ou
yarn test:coverage

# Testes em modo watch
npm run test:watch
# ou
yarn test:watch
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Proteção contra SQL Injection (via Prisma)
- Rate limiting
- CORS configurável
- Validação de entrada de dados
- Headers de segurança com Helmet

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia servidor em produção
- `npm test` - Executa testes
- `npm run lint` - Executa linter
- `npm run format` - Formata código

## 🤝 Como Contribuir

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 🔗 Links Relacionados

- [Frontend do Projeto](https://github.com/RondneyLoiola/interface-expensetracker)
- [Documentação Completa](https://docs.example.com) (em desenvolvimento)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Rondney Loiola**

- GitHub: [@RondneyLoiola](https://github.com/RondneyLoiola)
- LinkedIn: https://www.linkedin.com/in/rondneyloiola/

## 📞 Suporte

Se encontrar algum problema ou tiver dúvidas:
- Abra uma [issue](https://github.com/RondneyLoiola/api-expensetracker/issues)
- Entre em contato através do GitHub

---

⭐️ Desenvolvido com dedicação por [Rondney Loiola](https://github.com/RondneyLoiola)
