# 🔵 Template — ExpressJS + SQLite

Bem-vindo(a) ao template oficial **ExpressJS** do LocPay Tech Challenge.

Este projeto foi criado com o gerador oficial do Express e vem configurado para uso simples com **SQLite**.

---

## 🚀 Como começar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `db.js` (ou use um ORM leve como better-sqlite3) para gerenciar o banco de dados SQLite.
3. Rode o servidor:

   ```bash
   npm start
   ```

O servidor iniciará por padrão em <http://localhost:3000>

---

## 🧠 O que você precisa fazer

Implemente as rotas e regras de negócio descritas no README principal do desafio:

- `POST /operations` — criar operação
- `GET /operations/:id` — consultar operação
- `POST /operations/:id/confirm` — confirmar operação
- `GET /receivers/:id` — consultar recebedor e histórico

Você pode armazenar os dados em um arquivo `db.sqlite` e criar as tabelas com SQL simples.

---

## 🧩 Dicas

- Para testar rapidamente, use Insomnia ou Postman.
- Caso queira resetar tudo, basta apagar o arquivo `db.sqlite` e rodar o servidor novamente.

**Boa sorte!** 💙
Equipe LocPay Tech
