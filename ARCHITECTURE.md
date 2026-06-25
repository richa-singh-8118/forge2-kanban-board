# Architecture: KanbanFlow

## Overview

KanbanFlow follows a **decoupled client-server architecture** — a Laravel REST API backend communicates with a React SPA frontend over HTTP/JSON. The database is SQLite for zero-config, portable storage.

```
┌───────────────────────────────────────────┐
│               Browser (React SPA)         │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ HomePage │  │BoardPage │  │Modals   │ │
│  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └─────────────┴──────────────┘      │
│              KanbanContext (State)         │
│              Axios Service Layer           │
└───────────────────┬───────────────────────┘
                    │ HTTP/JSON (REST)
                    │ CORS: localhost:8000
┌───────────────────▼───────────────────────┐
│           Laravel 13 API (PHP 8.3)        │
│  routes/api.php  →  Controllers           │
│  Models + Eloquent ORM                    │
│  Validation + CORS Middleware             │
└───────────────────┬───────────────────────┘
                    │
┌───────────────────▼───────────────────────┐
│           SQLite Database                 │
│  boards │ board_lists │ cards             │
│  members │ tags │ card_tag               │
└───────────────────────────────────────────┘
```

---

## Backend Architecture (Laravel 13)

### MVC Pattern

| Layer       | Files                               | Role                                      |
|-------------|-------------------------------------|-------------------------------------------|
| Routes      | `routes/api.php`                    | Maps HTTP verbs + URIs to controller actions |
| Controllers | `app/Http/Controllers/*.php`        | Validates input, calls models, returns JSON |
| Models      | `app/Models/*.php`                  | Eloquent ORM: relationships, mass assignment |
| Database    | `database/migrations/`, `seeders/`  | Schema management and demo data           |

### Controllers

| Controller           | Responsibilities                                      |
|----------------------|-------------------------------------------------------|
| `BoardController`    | CRUD for boards, eager-loads lists+cards+tags+members |
| `BoardListController`| CRUD for lists; auto-increments position              |
| `CardController`     | CRUD + `move`, `assign`, `addTag`, `removeTag`        |
| `MemberController`   | List and create members                               |
| `TagController`      | List and create tags                                  |

### Database Schema

```
boards
  id | name | timestamps

board_lists
  id | board_id (FK→boards) | title | position | timestamps

members
  id | name | email (unique) | timestamps

tags
  id | name | color | timestamps

cards
  id | board_list_id (FK→board_lists) | title | description
     | due_date | member_id (FK→members, nullable)
     | position | timestamps

card_tag  [pivot]
  card_id (FK→cards) | tag_id (FK→tags)
  PRIMARY KEY (card_id, tag_id)
```

### Key Design Decisions

- **Cascade deletes**: Deleting a board cascades to lists → cards → card_tag entries
- **Position field**: Integer on lists and cards; updated on drag-end via `PUT /cards/{id}/move`
- **Nullable member_id**: Cards can exist without a member assigned
- **Pivot table**: `card_tag` allows many-to-many relationship between cards and tags without timestamps (lightweight)

---

## Frontend Architecture (React + Vite + TypeScript)

### Directory Structure

```
src/
├── App.tsx                    # Root: wraps app in KanbanProvider
├── context/
│   └── KanbanContext.tsx      # Global state: boards, activeBoard, members, tags
├── services/
│   └── api.ts                 # All Axios HTTP calls; single source of truth for API
├── utils/
│   ├── types.ts               # TypeScript interfaces (Board, BoardList, Card, Member, Tag)
│   └── helpers.ts             # Date utilities (isOverdue, isDueToday, formatDate)
├── components/
│   ├── UI.tsx                 # Reusable primitives: Modal, Input, Button, Select, Textarea
│   ├── CardItem.tsx           # Draggable card tile + CardDetail modal (edit/delete/tags)
│   └── Column.tsx             # Droppable list column with sortable cards
└── pages/
    ├── HomePage.tsx           # App shell: sidebar board navigation + create/delete board
    └── BoardPage.tsx          # DnD context, column rendering, add-list modal
```

### State Management

Uses **React Context + useState** (no Redux needed for this scope):

```
KanbanContext
  ├── boards[]          → sidebar board list
  ├── activeBoard       → currently open board (with lists + cards)
  ├── members[]         → for assignment dropdown
  └── tags[]            → for tag picker
```

State is refreshed via `refreshBoard()` after any mutation (create/update/delete/move).

### Drag-and-Drop (dnd-kit)

```
DndContext (BoardPage)
  ├── PointerSensor (5px activation threshold to allow click-to-open)
  ├── onDragStart  → captures the active card for DragOverlay
  ├── onDragOver   → optimistically moves card between lists in local state
  └── onDragEnd    → reorders within list (arrayMove), calls PUT /cards/{id}/move
        │
        └── SortableContext (per Column)
              └── useSortable (per CardItem)
```

**Optimistic updates**: card moves are applied to local state immediately, then synced to the server. On failure, state is refreshed from the server.

### Component Data Flow

```
HomePage
  └── BoardPage
        └── DndContext
              └── Column (per list)
                    ├── SortableContext
                    │     └── SortableCard → CardItem
                    │                            └── CardDetail Modal (click)
                    └── "Add a card" inline form
```

---

## API Request Flow: Moving a Card

```
User drags card ──► onDragOver: optimistic state update (instant UI)
                 └► onDragEnd:  PUT /api/cards/{id}/move
                                  { board_list_id: X, position: Y }
                                Backend: card.update(...)
                                Response: updated card JSON
```

---

## CORS Configuration

- Backend whitelist: `http://localhost:5173` and `http://127.0.0.1:5173`
- Config: `backend/config/cors.php`
- Middleware: `HandleCors` applied globally via `bootstrap/app.php`

---

## Security Considerations (MVP)

- No authentication in this MVP — all API routes are public
- To add auth: wrap routes in `auth:sanctum` middleware in `routes/api.php`
- Input validation is enforced on all POST/PUT endpoints via Laravel's `$request->validate()`
- SQL injection is prevented by Eloquent's parameterised query builder

---

## Scalability Notes

| Concern            | Current Approach       | Production Path                        |
|--------------------|------------------------|----------------------------------------|
| Database           | SQLite                 | MySQL / PostgreSQL                     |
| Auth               | None                   | Laravel Sanctum / Passport             |
| Real-time updates  | Manual refresh         | Laravel Echo + Pusher / WebSockets     |
| File storage       | N/A                    | S3 via Laravel Flysystem               |
| Frontend routing   | Single page            | React Router with protected routes     |
| Deployment         | `artisan serve`        | Render (Backend) + Vercel (Frontend)   |
