# Solução — SummerJob LocPay 2025

Este documento descreve passos claros para rodar a aplicação localmente, garantir que o DB está pronto e exemplos de requests/responses para testar cada rota.

---

## 1. Pré-requisitos
- Node.js (v16+ recomendado)
- npm
- Conta/instância PostgreSQL (Supabase) ou usar local Postgres
- Arquivo `.env` com a variável: `SUPABASE_DB_URL=postgresql://...`

---

## 2. Instalar dependências
No terminal (na pasta do projeto):
```powershell
npm install
npm install pg dotenv
```

---

## 3. Preparar o banco de dados
No Supabase SQL Editor (ou psql) executar o script que cria/ajusta tabelas:

```sql
BEGIN;

-- Criar receivers se não existir
CREATE TABLE IF NOT EXISTS receivers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  balance NUMERIC(12,2) DEFAULT 0 NOT NULL
);

-- Garantir coluna balance exista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='receivers' AND column_name='balance'
  ) THEN
    ALTER TABLE receivers ADD COLUMN balance NUMERIC(12,2) DEFAULT 0 NOT NULL;
  END IF;
END
$$;

-- Criar operations se não existir (com colunas exigidas)
CREATE TABLE IF NOT EXISTS operations (
  id SERIAL PRIMARY KEY,
  receiver_id INTEGER,
  gross_value NUMERIC(12,2) NOT NULL,
  fee NUMERIC(12,2) NOT NULL,
  net_value NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Se já existir coluna "amount", migrar para gross_value e manter compatibilidade
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='operations' AND column_name='amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='operations' AND column_name='gross_value'
  ) THEN
    ALTER TABLE operations ADD COLUMN gross_value NUMERIC(12,2);
    UPDATE operations SET gross_value = amount WHERE amount IS NOT NULL;
  END IF;
END
$$;

-- Garantir colunas fee e net_value existam
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='operations' AND column_name='fee'
  ) THEN
    ALTER TABLE operations ADD COLUMN fee NUMERIC(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='operations' AND column_name='net_value'
  ) THEN
    ALTER TABLE operations ADD COLUMN net_value NUMERIC(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='operations' AND column_name='status'
  ) THEN
    ALTER TABLE operations ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END
$$;

-- Adicionar FK receiver_id -> receivers.id se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'operations'
      AND kcu.column_name = 'receiver_id'
  ) THEN
    ALTER TABLE operations
      ADD CONSTRAINT operations_receiver_fkey
      FOREIGN KEY (receiver_id) REFERENCES receivers(id) ON DELETE SET NULL;
  END IF;
END
$$;

COMMIT;
```

---

## 4. Configurar conexão (db.js)
Verifique que `db.js` existe e carrega `.env`, exportando `Pool` do `pg`. Ao iniciar o servidor deve aparecer `DB connected` no console.

---

## 5. Iniciar servidor
```powershell
npm start
```
Mensagens esperadas:
- `Server is running on http://localhost:3000`
- `DB connected`

---

## 6. Rotas e exemplos (Postman)

1) Criar recebedor — POST /receivers  
Request:
```http
POST http://localhost:3000/receivers
Content-Type: application/json

{ "name": "João Silva", "email": "joao@example.com" }
```
Resposta (201):
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "balance": "0.00"
}
```

2) Criar operação — POST /operations  
Request:
```http
POST http://localhost:3000/operations
Content-Type: application/json

{ "gross_value": 100.00, "receiver_id": 1 }
```
Resposta (201):
```json
{
  "id": 1,
  "receiver_id": 1,
  "gross_value": "100.00",
  "fee": "3.00",
  "net_value": "97.00",
  "status": "pending",
  "created_at": "2025-11-06T..."
}
```

3) Consultar operação — GET /operations/:id  
Request:
```http
GET http://localhost:3000/operations/1
```
Resposta (200):
```json
{
  "id": 1,
  "receiver_id": 1,
  "gross_value": "100.00",
  "fee": "3.00",
  "net_value": "97.00",
  "status": "pending",
  "created_at": "...",
  "receiver_name": "João Silva",
  "receiver_balance": "0.00"
}
```

4) Confirmar operação — POST /operations/:id/confirm  
Request:
```http
POST http://localhost:3000/operations/1/confirm
```
Resposta (200):
```json
{
  "id": 1,
  "receiver_id": 1,
  "gross_value": "100.00",
  "fee": "3.00",
  "net_value": "97.00",
  "status": "confirmed",
  "created_at": "..."
}
```
E o `receivers.balance` passará a incluir `net_value` (ex: 97.00).

5) Consultar recebedor e histórico — GET /receivers/:id  
Request:
```http
GET http://localhost:3000/receivers/1
```
Resposta (200):
```json
{
  "receiver": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "balance": "97.00"
  },
  "operations": [
    { "id":1,"gross_value":"100.00","fee":"3.00","net_value":"97.00","status":"confirmed", ... }
  ]
}
```

---
## 8. Observações finais
- Frontend rudimentar está em `public/index.html` (acessível em http://localhost:3000), para caso desejar testar as rotas diretamente por lá.
