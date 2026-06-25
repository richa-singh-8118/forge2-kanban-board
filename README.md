# KanbanFlow — Trello-style Kanban Board

A production-ready Kanban Board application built with **Laravel 13** (backend) and **React + Vite** (frontend).

---

## Features

- ✅ Create and manage multiple **Boards**
- ✅ Create, edit, and delete **Lists** (columns)
- ✅ Create, edit, and delete **Cards**
- ✅ **Drag-and-drop** cards between lists (with position persistence)
- ✅ Assign **Members** to cards
- ✅ Add colored **Tags / Labels** to cards
- ✅ Set **Due Dates** with overdue highlighting
- ✅ Fully responsive UI with Tailwind CSS

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Laravel 13, PHP 8.3, SQLite             |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| DnD      | dnd-kit                                 |
| HTTP     | Axios                                   |

---

## Quick Start

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+
- npm

### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Run migrations & seed demo data
php artisan migrate:fresh --seed

# Start the server
php artisan serve
```

Backend runs at: **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## API Endpoints

### Boards
| Method | URL               | Description     |
|--------|-------------------|-----------------|
| GET    | /api/boards       | List all boards |
| POST   | /api/boards       | Create a board  |
| GET    | /api/boards/{id}  | Get board with lists & cards |
| PUT    | /api/boards/{id}  | Update board    |
| DELETE | /api/boards/{id}  | Delete board    |

### Lists
| Method | URL             | Description   |
|--------|-----------------|---------------|
| POST   | /api/lists      | Create a list |
| PUT    | /api/lists/{id} | Update list   |
| DELETE | /api/lists/{id} | Delete list   |

### Cards
| Method | URL                          | Description         |
|--------|------------------------------|---------------------|
| POST   | /api/cards                   | Create a card       |
| GET    | /api/cards/{id}              | Get card details    |
| PUT    | /api/cards/{id}              | Update card         |
| DELETE | /api/cards/{id}              | Delete card         |
| PUT    | /api/cards/{id}/move         | Move card to a list |
| PUT    | /api/cards/{id}/assign       | Assign a member     |
| POST   | /api/cards/{id}/tags         | Add tag to card     |
| DELETE | /api/cards/{id}/tags/{tagId} | Remove tag          |

### Members & Tags
| Method | URL          | Description      |
|--------|--------------|------------------|
| GET    | /api/members | List all members |
| POST   | /api/members | Create a member  |
| GET    | /api/tags    | List all tags    |
| POST   | /api/tags    | Create a tag     |

---

## Project Structure

```
.
├── backend/                   # Laravel 13 REST API
│   ├── app/
│   │   ├── Http/Controllers/  # API Controllers
│   │   └── Models/            # Eloquent Models
│   ├── database/
│   │   ├── migrations/        # Schema migrations
│   │   └── seeders/           # Demo data seeder
│   ├── routes/
│   │   └── api.php            # API route definitions
│   └── config/
│       └── cors.php           # CORS configuration
│
└── frontend/                  # React + Vite SPA
    └── src/
        ├── components/        # Reusable UI components
        ├── context/           # KanbanContext (global state)
        ├── pages/             # Page-level components
        ├── services/          # Axios API service layer
        └── utils/             # TypeScript types & helpers
```

---

## Deployment

### Backend (Render)
1. Push the code to GitHub.
2. In Render, create a new **Web Service** connected to your repo.
3. Set the Root Directory to `backend`.
4. Build Command: `composer install --no-dev --optimize-autoloader`
5. Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT` (or configure a proper PHP-FPM/Nginx setup).
6. Set Environment Variables:
   - `APP_KEY`: Generate via `php artisan key:generate --show`
   - `APP_ENV`: `production`
   - `DB_CONNECTION`: `sqlite` (or `pgsql` if using Render PostgreSQL)

### Frontend (Vercel)
1. Push the code to GitHub.
2. In Vercel, create a new Project connected to your repo.
3. Set the Root Directory to `frontend`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Add an environment variable: `VITE_API_URL` pointing to your Render backend URL (e.g., `https://kanban-backend.onrender.com/api`).
   *(Note: Ensure you update `src/services/api.ts` to use `import.meta.env.VITE_API_URL` in production).*

---

## Demo Data

Running `php artisan migrate:fresh --seed` creates:
- **1 Board**: "Product Development Sprint 1"
- **4 Lists**: To Do, In Progress, In Review, Done
- **8 Cards** with descriptions, due dates (including overdue), tags, and member assignments
- **3 Members**: Alice, Bob, Carol
- **5 Tags**: Bug, Feature, Design, Urgent, Backend
