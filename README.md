# TypeScript OOP Backend Practice 🚀

A **production-ready starter project** demonstrating clean architecture principles, best practices, and industry-standard patterns for building scalable backend applications.

> **Perfect for:** Learning backend development, understanding OOP patterns, building your first production-level API, or as a reference for project structure.

---

## 🎯 What You'll Learn

This project teaches you how to build a professional backend by implementing:

### ✅ Core Concepts
- **Layered Architecture Pattern** (Controller → Service → Repository)
- **Separation of Concerns** - Each layer has a single responsibility
- **Dependency Injection** - Loosely coupled, testable components
- **Error Handling** - Mapping domain errors to HTTP responses
- **Type Safety** - Full TypeScript with proper interfaces

### ✅ Production Standards
- **Environment Configuration** - Secrets and config via `.env`
- **Security** - CORS, security headers, input validation
- **Logging** - Request/response middleware logging
- **Error Middleware** - Centralized error handling and formatting
- **Input Validation** - Schema validation for request bodies
- **REST Best Practices** - Proper HTTP methods, status codes, response formats

### ✅ Development Workflow
- **TypeScript Compilation** - Strict mode, type checking
- **Development Server** - Hot-reload with Nodemon
- **ESM Modules** - Modern JavaScript module system
- **Package Management** - Reproducible builds with lockfiles

---

## 📚 Architecture Overview

The project follows a **3-layer architecture pattern** for clean, maintainable code:

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                              │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Controller Layer                            │
│  • Parse HTTP request (params, body, headers)                   │
│  • Delegate to service layer                                     │
│  • Format HTTP response                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  • Implement business logic                                      │
│  • Validate input (data rules, constraints)                     │
│  • Handle domain errors                                          │
│  • Orchestrate repository calls                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Repository Layer                               │
│  • Implement CRUD operations                                     │
│  • Manage data persistence (DB, cache, etc.)                    │
│  • Return data objects                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
                   Data Store (In-Memory Array in this project)
```

### Layer Responsibilities

| Layer | Responsibility | Example |
|-------|----------------|----------|
| **Controller** | HTTP ↔ Domain translation | Parse `POST /users` body → call service |
| **Service** | Business rules & validation | "Email must be unique", validate format |
| **Repository** | Data operations | Store/retrieve users from database |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/rsumit1618/ts-backend-practice.git
cd ts-backend-practice

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Start development server (with hot-reload)
npm run dev
```

The server will start on `http://localhost:3000`

### Test the API

**Health Check:**
```bash
curl http://localhost:3000
# Response: Backend Server Running
```

**List Users:**
```bash
curl http://localhost:3000/users
# Response: { "success": true, "data": [] }
```

**Create User:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
# Response: { "success": true, "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com" } }
```

**Get User:**
```bash
curl http://localhost:3000/users/[user-id]
```

**Update User:**
```bash
curl -X PUT http://localhost:3000/users/[user-id] \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}'
```

**Delete User:**
```bash
curl -X DELETE http://localhost:3000/users/[user-id]
```

---

## 📁 Project Structure

```
src/
├── app.ts                          # Express setup & route definitions
├── main.ts                         # Application entry point (CLI demo)
├── controllers/
│   └── UserController.ts           # HTTP request handling for users
├── services/
│   ├── UserService.ts              # Business logic & validation
│   └── AdminService.ts             # Admin-specific operations
├── repositories/
│   ├── BaseRepository.ts           # Generic repository base class
│   └── UserRepository.ts           # User data operations
├── middleware/
│   ├── errorHandler.ts             # Centralized error handling
│   ├── logger.ts                   # Request/response logging
│   └── requestValidator.ts         # Input validation middleware
├── errors/
│   └── AppError.ts                 # Custom error class
├── types/
│   └── request.ts                  # Request/response types
└── interfaces/
    └── IUser.ts                    # User contract definition
```

### File Purposes

- **app.ts**: Sets up Express, configures middleware, defines routes
- **main.ts**: Demo CLI application (not used in server mode)
- **Controller**: Receives HTTP requests, calls services, returns responses
- **Service**: Contains business logic, validates data, throws domain errors
- **Repository**: Manages data (currently in-memory, can be swapped with DB)
- **Middleware**: Handles cross-cutting concerns (logging, errors, validation)
- **Errors**: Custom exception types for better error handling
- **Interfaces**: TypeScript type contracts for data structures

---

## 🔄 Request Flow Example

Let's trace a `POST /users` request:

1. **Express Route** (app.ts)
   ```
   POST /users with body { "name": "Alice", "email": "alice@ex.com" }
   └─> Extract body → Call UserController.create()
   ```

2. **Controller** (controllers/UserController.ts)
   ```
   create(name, email)
   └─> Call UserService.createUser(name, email)
   ```

3. **Service** (services/UserService.ts)
   ```
   createUser(name, email)
   ├─> Validate: name not empty? email format valid?
   ├─> Check: email already exists?
   └─> Call UserRepository.create({ id: uuid, name, email })
   ```

4. **Repository** (repositories/UserRepository.ts)
   ```
   create(user)
   ├─> Add to in-memory array
   └─> Return user
   ```

5. **Response Back**
   ```
   Service returns user → Controller formats → Express sends HTTP 201 ✅
   ```

---

## 🛠️ API Endpoints

### User Management

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/` | Health check | 200 |
| `GET` | `/users` | List all users | 200 |
| `POST` | `/users` | Create new user | 201/400 |
| `GET` | `/users/:id` | Get user by ID | 200/404 |
| `PUT` | `/users/:id` | Update user | 200/400/404 |
| `DELETE` | `/users/:id` | Delete user | 200/404 |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

**Error Response:**
```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|----------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST |
| **400** | Bad Request | Invalid input (missing fields, validation failed) |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Unexpected error |

---

## 💡 Learning Path - How to Extend This

### Phase 1: Understanding (Beginner)
- [ ] Run the project and test all endpoints
- [ ] Read through the code in order: `Repository` → `Service` → `Controller`
- [ ] Understand why each layer exists
- [ ] Trace a request from route to database

### Phase 2: Modification (Intermediate)
- [ ] Add a new field to User (e.g., `phone`)
  - Update: `IUser.ts` → `UserRepository` → `UserService` → `UserController` → `app.ts`
  - **Learn:** How changes propagate through layers
  
- [ ] Add a new endpoint (e.g., `GET /users/search?name=john`)
  - Add: Repository method → Service method → Controller method → Route
  - **Learn:** How to extend without breaking existing code

- [ ] Add validation (e.g., email must be unique)
  - **Learn:** Where business logic belongs (Service layer)

### Phase 3: Production Skills (Advanced)
- [ ] Connect to a real database (PostgreSQL/MongoDB)
  - Replace in-memory array with database queries
  - **Learn:** Repositories are data-source agnostic
  
- [ ] Add authentication/authorization
  - JWT tokens, role-based access control
  - **Learn:** Security and middleware
  
- [ ] Add testing
  - Unit tests for services, integration tests for API
  - **Learn:** Test-driven development
  
- [ ] Add API documentation (Swagger/OpenAPI)
  - **Learn:** API contracts and documentation

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Server
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000
```

Available variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `CORS_ORIGIN` - CORS allowed origin

---

## 📝 Development Guide

### Running Commands

```bash
# Start development server (with hot-reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server (requires build first)
npm start

# Run CLI demo
npm run dev -- src/main.ts
```

### Code Structure Best Practices

1. **Keep Controllers Thin**
   ```typescript
   // ✅ Good - Controller delegates to service
   async create(name: string, email: string) {
     return this.userService.createUser(name, email);
   }
   
   // ❌ Avoid - Business logic in controller
   async create(name: string, email: string) {
     if (name.length < 3) throw new Error("...");
     // ...business logic here...
   }
   ```

2. **Services Handle Validation**
   ```typescript
   // ✅ Service validates and throws domain errors
   createUser(name: string, email: string) {
     if (!name) throw new Error("Name is required");
     if (!email.match(EMAIL_REGEX)) throw new Error("Invalid email");
     return this.repo.create({ id: uuid(), name, email });
   }
   ```

3. **Repositories Stay Simple**
   ```typescript
   // ✅ Repository only handles data operations
   async create(user: IUser) {
     this.users.push(user);
     return user;
   }
   ```

---

## 🔒 Production Checklist

Before deploying to production, ensure:

- [ ] **Environment Variables**: All sensitive data in `.env`, not hardcoded
- [ ] **Error Handling**: All endpoints have try/catch with proper error responses
- [ ] **Validation**: All user inputs are validated (length, format, type)
- [ ] **Logging**: Important operations are logged for debugging
- [ ] **Security**: CORS, CSRF, input sanitization configured
- [ ] **Testing**: Unit and integration tests pass
- [ ] **Documentation**: API documented (Swagger/OpenAPI)
- [ ] **Performance**: Database queries optimized, N+1 queries eliminated
- [ ] **Monitoring**: Errors logged to external service (Sentry, Datadog, etc.)
- [ ] **Rate Limiting**: API protected from abuse (optional for starter)

---

## 🧪 Testing Strategy

### Unit Tests (Service Layer)
```typescript
// Test business logic in isolation
describe('UserService', () => {
  it('should create user with valid data', () => {
    const user = userService.createUser('John', 'john@ex.com');
    expect(user.email).toBe('john@ex.com');
  });
  
  it('should throw on missing email', () => {
    expect(() => userService.createUser('John', '')).toThrow();
  });
});
```

### Integration Tests (API)
```typescript
// Test full request/response cycle
describe('POST /users', () => {
  it('should create user and return 201', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@ex.com' });
    expect(res.status).toBe(201);
  });
});
```

### Manual Testing
Use the curl commands in the [Quick Start](#quick-start) section.

---

## 🚀 Deploying to Production

### Step 1: Build
```bash
npm run build
# Creates `dist/` folder with compiled JavaScript
```

### Step 2: Set Environment Variables
```bash
export NODE_ENV=production
export PORT=3000
# Set other production variables
```

### Step 3: Run
```bash
npm start
```

### Deployment Platforms
- **Heroku**: `heroku create && git push heroku main`
- **Railway**: Connect GitHub repo via dashboard
- **Render**: Similar to Railway
- **AWS Lambda**: Requires serverless framework
- **Docker**: Create Dockerfile, push to registry

---

## 🔗 Advanced Topics

For deeper learning, see [DOCUMENTATION.md](./DOCUMENTATION.md) which covers:
- Detailed architecture explanation
- API creation workflow
- Error handling mechanisms
- Extension patterns

---

## 📚 Resources & References

### Architecture Patterns
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)

### TypeScript & Express
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [RESTful API Design](https://restfulapi.net/)

### Validation & Security
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

## 🤝 Contributing

Want to improve this starter project? 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'feat: add new feature'`)
5. Push to your fork (`git push origin feature/your-feature`)
6. Open a Pull Request

### Areas for Contribution
- [ ] Add database integration (PostgreSQL/MongoDB)
- [ ] Add authentication (JWT, OAuth)
- [ ] Add comprehensive test suite
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add Docker support
- [ ] Add CI/CD pipeline

---

## 📄 License

ISC License - Use freely for learning and commercial projects.

---

## 🎓 Learning Outcomes

After completing this project, you should understand:

✅ How to structure a backend application  
✅ The purpose of each architectural layer  
✅ How to handle errors gracefully  
✅ How to validate and transform user input  
✅ How to build scalable, testable code  
✅ How to document APIs  
✅ Production deployment considerations  

---

## ❓ FAQ

**Q: Why three layers?**  
A: Separation of concerns. Each layer has one job, making code testable, maintainable, and flexible.

**Q: Can I use this with a database?**  
A: Yes! Swap the in-memory repository with a database implementation. The other layers don't change.

**Q: How do I add a new endpoint?**  
A: See the [Learning Path](#phase-2-modification-intermediate) section for step-by-step guide.

**Q: Is this production-ready?**  
A: It demonstrates production patterns! For real production, add database, monitoring, and comprehensive testing.

**Q: Can I use this in my portfolio?**  
A: Absolutely! Modify it, extend it, and showcase what you built.

---

**Happy Learning! 🎉**

For questions or issues, open a GitHub issue or check the [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed technical information.