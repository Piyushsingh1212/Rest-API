# Task API — REST API with JWT Auth

A complete CRUD REST API built with **Node.js**, **Express**, **SQLite**, and **JWT authentication**.

## Quick Start

```bash
npm install
node server.js
```

Server starts at `http://localhost:3000`

---

## API Endpoints

### Auth

| Method | Endpoint             | Body                          | Response       |
|--------|----------------------|-------------------------------|----------------|
| POST   | `/api/auth/register` | `{ email, password }`         | 201 + token    |
| POST   | `/api/auth/login`    | `{ email, password }`         | 200 + token    |

### Tasks (requires `Authorization: Bearer <token>`)

| Method | Endpoint          | Body                                    | Response |
|--------|-------------------|-----------------------------------------|----------|
| GET    | `/api/tasks`      | —                                       | 200      |
| GET    | `/api/tasks/:id`  | —                                       | 200      |
| POST   | `/api/tasks`      | `{ title, description?, status? }`      | 201      |
| PUT    | `/api/tasks/:id`  | `{ title?, description?, status? }`     | 200      |
| DELETE | `/api/tasks/:id`  | —                                       | 200      |

**Status values:** `pending` | `in_progress` | `done`

---

## Testing with curl

### 1. Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

### 3. Create a task (use the token from register/login)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Learn REST APIs","description":"Build a CRUD app"}'
```

### 4. List tasks
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update a task
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"status":"done"}'
```

### 6. Delete a task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Project Structure

```
task-api/
├── server.js              # Express app entry point
├── db/
│   └── database.js        # SQLite schema (users + tasks)
├── middleware/
│   └── auth.js            # JWT verification middleware
├── routes/
│   ├── auth.js            # Register & Login
│   └── tasks.js           # CRUD endpoints
├── .env                   # Environment variables (not in git)
├── .env.example           # Template for .env
└── package.json
```

## Error Responses

| Status | Meaning                                   |
|--------|-------------------------------------------|
| 400    | Validation error (missing/invalid fields) |
| 401    | Missing, malformed, or expired JWT token  |
| 404    | Task not found or belongs to another user |
| 500    | Internal server error                     |
