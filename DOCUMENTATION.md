# ts-oop-backend-practice — Architecture & API/Data Flow

## Overview
This backend is a small TypeScript/Express project demonstrating an OOP layered architecture:

**Controller → Service → Repository**

- **Controller**: HTTP-facing layer (parses route params/body and returns data)
- **Service**: Business logic + validations + error semantics
- **Repository**: Data persistence layer (in this project: in-memory array)

## Folder/Module Structure
- `src/app.ts`
  - Express app + route definitions
  - Converts thrown errors into HTTP responses
- `src/controllers/UserController.ts`
  - Methods used by routes (`create`, `list`, `getOne`, `update`, `remove`)
- `src/services/UserService.ts`
  - Implements business logic and uses validations
- `src/repositories/UserRepository.ts`
  - Implements CRUD on an in-memory store
- `src/interfaces/IUser.ts`
  - Type contract for a User

## API Endpoints
All endpoints are rooted at: `http://localhost:3000`

### Health
- `GET /`
  - Returns: `Backend Server Running`

### Users
- `GET /users`
  - Returns: `200` with `{ success: true, data: IUser[] }`

- `POST /users`
  - Body: `{ "name": string, "email": string }`
  - Returns:
    - `201` on success
    - `400` when `name` or `email` is missing

- `GET /users/:id`
  - Returns:
    - `200` with the user
    - `404` when user does not exist

- `PUT /users/:id`
  - Body: `{ "name"?: string, "email"?: string }`
  - Returns:
    - `200` with updated user
    - `400` when payload is empty
    - `404` when user does not exist

- `DELETE /users/:id`
  - Returns:
    - `200` with `{ deleted: true, id }`
    - `404` when user does not exist

## Error Handling / HTTP Mapping
`src/app.ts` wraps each route handler in `try/catch`.

When the service throws an `Error`, `app.ts` maps the message to an HTTP status:
- message contains **"not found"** → `404`
- message contains **"required"** or common validation phrases → `400`
- otherwise → `500`

## Data Flow (Request → Response)
```
Client
  |
  |  HTTP request (e.g., POST /users)
  v
Express route (src/app.ts)
  |
  |  call controller method
  v
UserController (src/controllers/UserController.ts)
  |
  |  call service method
  v
UserService (src/services/UserService.ts)
  |
  |  call repository method
  v
UserRepository (src/repositories/UserRepository.ts)
  |
  |  in-memory CRUD (array)
  v
Return result back up the chain
  |
  v
Express route formats JSON response
```

## API Creation Flow (How to add new endpoints)
1. **Define/Update types**
   - If needed, extend `src/interfaces/`.
2. **Add/Update repository methods**
   - Implement data operations in `src/repositories/`.
3. **Add service methods**
   - Implement validation/business logic in `src/services/`.
   - Throw `Error` with messages that `src/app.ts` can map.
4. **Add controller methods**
   - Create simple controller wrappers that call the service.
5. **Add Express route(s)**
   - Add route handler in `src/app.ts`.
   - Use `try/catch` to map errors to HTTP.

## Quick Start (Run)
```bash
npm install
npm run dev
```
Then test:
- `GET http://localhost:3000/users`
- `POST http://localhost:3000/users` with JSON body

## Notes / Limitations
- User storage is **in-memory**, so data resets on restart.
- Imports use explicit `*.js` specifiers for ESM compatibility under `"type": "module"`.

