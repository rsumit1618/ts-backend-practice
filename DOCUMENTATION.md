# TypeScript OOP Backend - Technical Documentation

> 📘 **For a guided learning experience, start with [README.md](./README.md)**
> 
> This document provides deep technical details about the architecture and implementation.

## Overview

This is a production-ready backend starter demonstrating clean architecture principles using TypeScript and Express.js. The project uses a **3-layer architecture** for separation of concerns and maintainability.

---

## Architecture Pattern

### The 3-Layer Architecture

```
HTTP Request
    ↓
┌─────────────────────────────────────────────────────┐
│        Controller (HTTP Adapter)                    │
│  • Parse request data (body, params, query)         │
│  • Call service layer                               │
│  • Format HTTP responses                            │
│  • Status codes, headers                            │
└────────────┬────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────┐
│        Service (Business Logic)                     │
│  • Implement business rules                         │
│  • Validate input data                              │
│  • Handle domain errors                             │
│  • Orchestrate repository calls                     │
└────────────┬────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────┐
│        Repository (Data Access)                     │
│  • CRUD operations                                  │
│  • Query building                                   │
│  • Database abstraction                             │
│  • Return raw data objects                          │
└────────────┬────────────────────────────────────────┘
             ↓
       Database (In-memory Array)
```

### Why This Pattern?

| Benefit | Why It Matters |
|---------|----------------|
| **Testability** | Test service logic without HTTP/DB |
| **Reusability** | Use services in CLI, APIs, job queues |
| **Maintainability** | Changes in one layer don't affect others |
| **Scalability** | Easy to swap implementations (DB provider) |
| **Clean Code** | Each class has one responsibility |

---

## Layer Details

### Controller Layer

**Location:** `src/controllers/UserController.ts`

**Responsibility:**
- Receive HTTP requests from Express routes
- Extract and validate basic request structure
- Delegate to service layer
- Format responses for HTTP

**Example:**
```typescript
// Controller: Just delegates, no logic
async create(name: string, email: string): Promise<IUser> {
  return await this.userService.registerUser(name, email);
}
```

**Key Rule:** ⚠️ Controllers should be **thin** - they're just adapters between HTTP and domain logic.

---

### Service Layer

**Location:** `src/services/UserService.ts`

**Responsibility:**
- Implement business logic
- Validate all input (format, constraints, business rules)
- Handle domain errors with meaningful messages
- Orchestrate repository calls
- Implement business rules like "email must be unique"

**Example:**
```typescript
async registerUser(name: string, email: string): Promise<IUser> {
  // Validation
  if (!name || !name.trim()) throw new Error("Name is required");
  this.validateEmail(email);
  
  // Business rule: check uniqueness
  const existing = await this.userRepository.findAll();
  if (existing.some(u => u.email === email)) {
    throw new Error("Email already in use");
  }
  
  // Create user
  return await this.userRepository.create({
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim()
  });
}
```

**Why Validation in Service?**
- Controllers can be bypassed (CLI, scheduled jobs)
- Services protect business rules
- One source of truth for validation

**Error Handling:**
- Services throw errors with meaningful messages
- `app.ts` catches errors and maps to HTTP status:
  - "not found" → 404
  - "required", "invalid" → 400
  - "conflict" → 409

---

### Repository Layer

**Location:** `src/repositories/UserRepository.ts`

**Responsibility:**
- Execute CRUD operations
- Abstract data source (currently in-memory array)
- Return data objects (no formatting)
- Keep queries simple and readable

**Example:**
```typescript
async create(user: IUser): Promise<IUser> {
  this.users.push(user);
  return user;
}

async findById(id: string): Promise<IUser | null> {
  return this.users.find((u) => u.id === id) ?? null;
}
```

**In Production, Replace With:**
```typescript
// PostgreSQL Example
async create(user: IUser): Promise<IUser> {
  const result = await db.query(
    'INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *',
    [user.id, user.name, user.email]
  );
  return result.rows[0];
}

// MongoDB Example
async create(user: IUser): Promise<IUser> {
  const result = await usersCollection.insertOne(user);
  return { ...user, _id: result.insertedId };
}
```

**Benefits of Abstraction:**
- Change database without touching service/controller
- Easy testing (mock repository)
- Repositories are data-source agnostic

---

## Data Flow

### Complete Request Lifecycle: `POST /users`

```
1. Client sends:
   POST /users
   Content-Type: application/json
   { "name": "Alice", "email": "alice@example.com" }

2. Express Route (app.ts):
   app.post("/users", async (req, res) => {
     const { name, email } = req.body;
     // Basic structure validation
     if (!name || !email) return res.status(400).json(...)
     
     // Delegate to controller
     const newUser = await userController.create(name, email);
     res.status(201).json({ success: true, data: newUser });
   })

3. Controller (UserController.ts):
   async create(name: string, email: string): Promise<IUser> {
     // No logic here, just delegate
     return await this.userService.registerUser(name, email);
   }

4. Service (UserService.ts):
   async registerUser(name: string, email: string): Promise<IUser> {
     // Validate name format
     this.validateName(name);  // Throws if invalid
     
     // Validate email format
     this.validateEmail(email); // Throws if invalid
     
     // Check if email exists (business rule)
     const existing = await this.userRepository.findAll();
     if (existing.some(u => u.email === email)) {
       throw new Error("Email already in use"); // Will map to 400
     }
     
     // Call repository to persist
     const user: IUser = {
       id: Date.now().toString(),
       name: name.trim(),
       email: email.trim().toLowerCase()
     };
     return await this.userRepository.create(user);
   }

5. Repository (UserRepository.ts):
   async create(user: IUser): Promise<IUser> {
     this.users.push(user);  // Add to array
     return user;             // Return created user
   }

6. Service returns to Controller:
   { id: "1684756577123", name: "Alice", email: "alice@example.com" }

7. Controller returns to Route:
   Same user object

8. Route sends HTTP response:
   201 Created
   { "success": true, "data": { id: "...", name: "Alice", email: "alice@example.com" } }

9. Client receives:
   201 Created
   { "success": true, "data": { ... } }
```

---

## Error Handling Strategy

### Error Mapping (app.ts)

```typescript
function toHttpError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  const messageLower = message.toLowerCase();

  if (messageLower.includes("not found")) {
    return { status: 404, message };  // "User not found"
  }

  if (messageLower.includes("required") || 
      messageLower.includes("invalid")) {
    return { status: 400, message };  // "Email is required"
  }

  return { status: 500, message };    // Unknown errors
}
```

### Examples

| Service Error | HTTP Response |
|---------------|---------------|
| `new Error("User not found")` | 404 |
| `new Error("Email is required")` | 400 |
| `new Error("Email already in use")` | 400 |
| `new Error("Invalid email format")` | 400 |
| `new Error("Unexpected database issue")` | 500 |

---

## Adding New Endpoints

### Step-by-Step Guide

#### Example: Add `PATCH /users/:id/profile-picture`

**Step 1: Update Interface (if needed)**
```typescript
// src/interfaces/IUser.ts
export interface IUser {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;  // NEW
}
```

**Step 2: Add Repository Method**
```typescript
// src/repositories/UserRepository.ts
async updateProfilePicture(id: string, pictureUrl: string): Promise<void> {
  const user = this.users.find(u => u.id === id);
  if (user) user.profilePicture = pictureUrl;
}
```

**Step 3: Add Service Method**
```typescript
// src/services/UserService.ts
async updateProfilePicture(id: string, pictureUrl: string): Promise<IUser> {
  // Validation
  if (!id || !pictureUrl) {
    throw new Error("ID and pictureUrl are required");
  }
  
  // Business rule: URL must be valid
  try {
    new URL(pictureUrl);  // Will throw if invalid URL
  } catch {
    throw new Error("Invalid picture URL");
  }
  
  // Get user
  const user = await this.getUserById(id);
  
  // Update
  await this.userRepository.updateProfilePicture(id, pictureUrl);
  
  return { ...user, profilePicture: pictureUrl };
}
```

**Step 4: Add Controller Method**
```typescript
// src/controllers/UserController.ts
async updateProfilePicture(id: string, pictureUrl: string): Promise<IUser> {
  return await this.userService.updateProfilePicture(id, pictureUrl);
}
```

**Step 5: Add Express Route**
```typescript
// src/app.ts
app.patch("/users/:id/profile-picture", async (req, res) => {
  try {
    const { pictureUrl } = req.body;
    if (!pictureUrl) {
      return res.status(400).json({ error: "pictureUrl is required" });
    }
    
    const updated = await userController.updateProfilePicture(
      req.params.id,
      pictureUrl
    );
    
    res.status(200).json({
      success: true,
      message: "Profile picture updated",
      data: updated
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ success: false, error: message });
  }
});
```

---

## Testing Strategy

### Unit Tests (Service Layer)

Test business logic in isolation without HTTP or database:

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: UserRepository;

  beforeEach(() => {
    mockRepository = new UserRepository();
    service = new UserService(mockRepository);
  });

  it('should create user with valid data', async () => {
    const user = await service.registerUser('John', 'john@ex.com');
    expect(user.email).toBe('john@ex.com');
  });

  it('should throw on invalid email', () => {
    expect(() => service.registerUser('John', 'invalid'))
      .toThrow('Invalid email format');
  });

  it('should throw on duplicate email', async () => {
    await service.registerUser('John', 'john@ex.com');
    expect(() => service.registerUser('Jane', 'john@ex.com'))
      .toThrow('Email already in use');
  });
});
```

### Integration Tests (Full API)

Test complete request/response cycle:

```typescript
describe('POST /users', () => {
  it('should create user and return 201', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@ex.com' });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('john@ex.com');
  });

  it('should return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'John' }); // Missing email
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
```

---

## Production Deployment Checklist

### Code Quality
- [ ] All functions have comments explaining purpose
- [ ] No hardcoded values (use environment variables)
- [ ] Error handling on all endpoints
- [ ] Validation on all inputs
- [ ] TypeScript strict mode enabled
- [ ] No `console.log` in production code (use proper logging)

### Security
- [ ] CORS configured for allowed origins
- [ ] Security headers added (Helmet middleware)
- [ ] Input sanitization implemented
- [ ] Rate limiting considered
- [ ] No secrets in code or git
- [ ] Environment variables for all config

### Performance
- [ ] Database queries optimized
- [ ] N+1 queries eliminated
- [ ] Caching strategy considered
- [ ] Response times monitored

### Operations
- [ ] Application logging configured
- [ ] Error monitoring (Sentry, Datadog)
- [ ] Health check endpoint exists
- [ ] Graceful shutdown implemented
- [ ] Database connection pooling
- [ ] Environment-specific configs

---

## Common Patterns

### Creating a New Resource

Follow this sequence for consistency:

1. **Interface** → `src/interfaces/I{Resource}.ts`
2. **Repository** → `src/repositories/{Resource}Repository.ts`
3. **Service** → `src/services/{Resource}Service.ts`
4. **Controller** → `src/controllers/{Resource}Controller.ts`
5. **Routes** → Add routes in `src/app.ts`

### Validation Pattern

```typescript
// In Service
if (!email || !email.trim()) {
  throw new Error("Email is required");
}

if (!isValidEmail(email)) {
  throw new Error("Invalid email format");
}

// In app.ts
// "required" → 400
// "invalid" → 400
```

### Error Pattern

```typescript
// Throw with meaningful message
throw new Error("User not found");  // Will become 404
throw new Error("Email is required");  // Will become 400

// The message determines HTTP status
```

---

## Performance Considerations

### In-Memory Storage
- ✅ Perfect for learning and prototyping
- ❌ Not suitable for production (data lost on restart)
- ❌ Memory grows with data
- ❌ No multi-process support

### When to Upgrade
- Real persistence needed → PostgreSQL/MongoDB
- Scaling needed → Redis for caching
- Many users → Connection pooling
- Complex queries → Query optimization

---

## Extending the Architecture

### Add a Second Resource (e.g., Products)

```
src/
├── controllers/
│   ├── UserController.ts (existing)
│   └── ProductController.ts (NEW)
├── services/
│   ├── UserService.ts (existing)
│   └── ProductService.ts (NEW)
├── repositories/
│   ├── UserRepository.ts (existing)
│   └── ProductRepository.ts (NEW)
└── interfaces/
    ├── IUser.ts (existing)
    └── IProduct.ts (NEW)
```

### Switch to PostgreSQL

Only the Repository changes:

```typescript
// Before: UserRepository with in-memory array
async create(user: IUser): Promise<IUser> {
  this.users.push(user);
  return user;
}

// After: UserRepository with PostgreSQL
async create(user: IUser): Promise<IUser> {
  const result = await db.query(
    'INSERT INTO users VALUES ($1, $2, $3) RETURNING *',
    [user.id, user.name, user.email]
  );
  return result.rows[0];
}

// Service and Controller don't change! ✅
```

---

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) by Robert C. Martin
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html) by Martin Fowler
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Questions?** Check the [README.md](./README.md) for quick start guides and learning paths.
