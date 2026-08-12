# StockX — Mini ERP + CRM Operations Portal
### Fundsroom Full Stack Developer Case Study Submission

---

## 📁 Submission Package Contents

```text
StockX - Fundsroom Case Study Submission/
├── StockX_Screen_Recording.mp4          # Video walkthrough demonstrating all 4 roles & core data flows
├── StockX_Postman_Collection.json        # Complete Postman collection with live environment & sample requests
├── README.md                            # Complete technical documentation & setup guide (this file)
└── Architecture_Diagram.png             # (Optional) High-resolution architectural diagram
```

---

## 🌐 Live Application & API Links

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | [https://stockx-seven.vercel.app/](https://stockx-seven.vercel.app/) | Next.js 15 Responsive Operations Portal |
| **Backend REST API** | [https://stockx-7dz7.onrender.com](https://stockx-7dz7.onrender.com) | NestJS Modular Monolith API |
| **Interactive API Docs** | [https://stockx-7dz7.onrender.com/api/docs](https://stockx-7dz7.onrender.com/api/docs) | OpenAPI / Swagger 3.0 Documentation |
| **GitHub Repository** | [https://github.com/aditya-singh-18/StockX](https://github.com/aditya-singh-18/StockX) | Monorepo containing Backend & Frontend |

---

## 👥 Seed Test Credentials

All accounts are pre-seeded with password: `Test@1234`

| Role | Email | Password | Primary Permissions & Responsibilities |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@test.com` | `Test@1234` | Full superuser access (all 12 system permissions + user management) |
| 💼 **Sales** | `sales@test.com` | `Test@1234` | Customer CRM, Follow-up notes, Create/Confirm/Cancel Sales Challans |
| 🏭 **Warehouse** | `warehouse@test.com` | `Test@1234` | Product catalog, Location tracking, Stock IN/OUT adjustments & audits |
| 📊 **Accounts** | `accounts@test.com` | `Test@1234` | Read-only analytics & reporting across Customers, Catalog, and Challans |

---

## 🛠️ Technology Stack

```mermaid
graph TD
    Client["🖥️ Next.js 15 Frontend\n(TypeScript, Tailwind CSS, App Router)"]
    API["⚙️ NestJS Backend API\n(TypeScript, Modular Monolith, JWT Auth)"]
    DB[("🐘 PostgreSQL Database\n(Prisma ORM, Supabase / Neon)")]

    Client -->|REST API / HTTPS| API
    API -->|Prisma Client / Transactions| DB
```

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (Node.js / TypeScript) — Modular architecture with strict dependency injection.
- **Database ORM**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL 16 (hosted on Supabase / Neon).
- **Authentication**: JWT access tokens (15m expiry) + 40-byte cryptographically secure opaque refresh tokens (7d expiry, SHA-256 hashed in database) with single-use rotation & session revocation tracking.
- **Authorization**: Dynamic permission-based RBAC (`@RequirePermissions()` decorator + `PermissionsGuard`).
- **Validation**: `class-validator` and `class-transformer` with global `ValidationPipe` (whitelist + transform).
- **API Documentation**: [Swagger / OpenAPI 3.0](https://swagger.io/) at `/api/docs`.

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components + Client Components).
- **Language & Styling**: TypeScript + Vanilla Tailwind CSS (custom dark theme, strictly adhering to high-contrast ergonomic UX).
- **State & Routing**: URL search parameter synchronization for pagination, filters, and tab state deep-linking.
- **Icons & UI**: [Lucide React](https://lucide.dev/), headless modals, and accessible interactive controls.

### Infrastructure & Deployment
- **Frontend Hosting**: [Vercel](https://vercel.com/) (Edge-cached Next.js deployment).
- **Backend Hosting**: [Render](https://render.com/) (Docker / Node.js web service).
- **Database**: [Supabase / Neon](https://supabase.com/) (Managed PostgreSQL with connection pooling).
- **Containerization**: Docker & Docker Compose for local zero-dependency database provisioning.

---

## 🏗️ Architecture Overview

StockX is structured as a **3-tier modular system** designed to solve the operational hurdles of wholesale and distribution businesses: managing customer relationships, tracking inventory across warehouse bins, and atomically fulfilling multi-item sales delivery challans without race conditions or stock overdrafts.

### 1. Layered Architecture & Request Lifecycle
1. **Presentation Layer (Next.js 15)**: Utilizes Server Components for data fetching and secure cookie transmission, combined with Client Components for dynamic search debouncing, pagination controls, stock adjustment modals, and confirmation dialogs.
2. **API & Business Logic Layer (NestJS)**: Structured into domain modules (`Auth`, `Users`, `Roles`, `Customers`, `Products`, `Challans`). Incoming requests pass through `JwtAuthGuard` and `PermissionsGuard`, where user permissions are dynamically evaluated against required granular permission keys.
3. **Persistence & Data Integrity Layer (PostgreSQL + Prisma)**: Enforces relational constraints, cascade rules, unique indexes (SKUs, Challan numbers, Emails), and ACID transaction boundaries.

```mermaid
sequenceDiagram
    autonumber
    actor User as 💼 Sales Executive
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ NestJS Backend
    participant DB as 🐘 PostgreSQL (Prisma)

    User->>FE: Click "Confirm & Dispatch" on Challan
    FE->>BE: POST /challans/:id/confirm (Bearer JWT)
    Note over BE: PermissionsGuard checks 'challan:confirm'
    BE->>DB: Begin $transaction
    loop For each Challan Line Item
        BE->>DB: UPDATE products SET currentStock = currentStock - qty WHERE id = item.id AND currentStock >= qty
        alt Insufficient Stock (count == 0)
            DB-->>BE: 0 rows affected
            BE-->>DB: ROLLBACK Transaction
            BE-->>FE: 409 Conflict (Insufficient Stock Error)
            FE-->>User: Show Toast "Insufficient Stock: Rollback complete"
        else Sufficient Stock (count == 1)
            BE->>DB: INSERT INTO stock_movements (OUT, qty, balanceAfter, challanId)
        end
    end
    BE->>DB: UPDATE challans SET status = 'CONFIRMED', confirmedById = userId, confirmedAt = NOW()
    DB-->>BE: COMMIT Transaction
    BE-->>FE: 200 OK (Confirmed Challan & Movements)
    FE-->>User: Show Success & Update Stock Badges
```

### 2. Atomic Stock Deduction & Concurrency Safety
The most critical requirement in inventory fulfillment is preventing negative stock balances and double-allocation under high concurrency:
- When confirming a challan, StockX executes an interactive Prisma `$transaction`.
- Instead of reading stock in memory and writing it back (which is vulnerable to race conditions), StockX executes a **database-level conditional decrement**:
  ```sql
  UPDATE "products"
  SET "currentStock" = "currentStock" - :quantity
  WHERE "id" = :productId AND "currentStock" >= :quantity;
  ```
- If any line item in the order has insufficient stock, `updateMany` returns `count: 0`. The backend aborts immediately, throwing a `409 ConflictException`, and PostgreSQL rolls back all previous item deductions. No partial fulfillment or negative inventory can ever occur.
- For each deducted item, an immutable `StockMovement` audit record is created capturing `quantity`, `type: OUT`, `source: CHALLAN_CONFIRMED`, `balanceAfter`, and `createdById`.

### 3. Historical Price & Name Snapshot Pattern
When a sales challan is created, prices and product descriptions must remain legally and financially binding even if catalog prices change in the future:
- `ChallanItem` stores `unitPriceSnapshot` and `productNameSnapshot` alongside the `productId`.
- Subsequent edits to product names, categories, or catalog prices do not alter historical challan invoices or dispatch totals.

---

## 🔐 RBAC Design & Capability Matrix

StockX implements a **pure Permission-Based Access Control** model rather than checking hardcoded role strings in application code.

### Database Tables:
- `Role`: Defines job titles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- `Permission`: Defines granular capability keys (e.g. `customer:create`, `challan:confirm`, `product:stock-adjust`).
- `RolePermission`: Many-to-many junction table mapping roles to permissions.

### Permission Matrix:

| Permission Key | Description | Admin | Sales | Warehouse | Accounts |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `customer:create` | Register new customer accounts | ✅ | ✅ | ❌ | ❌ |
| `customer:read` | View customer CRM list and profile details | ✅ | ✅ | ❌ | ✅ |
| `customer:update` | Edit customer details and add follow-up notes | ✅ | ✅ | ❌ | ❌ |
| `product:create` | Create new SKU items in the catalog | ✅ | ❌ | ❌ | ❌ |
| `product:read` | View catalog, prices, and stock balances | ✅ | ✅ | ✅ | ✅ |
| `product:update` | Edit product metadata (name, price, min stock) | ✅ | ❌ | ✅ | ❌ |
| `product:stock-adjust`| Perform manual inward/outward stock adjustments | ✅ | ❌ | ✅ | ❌ |
| `challan:create` | Create draft sales delivery challans | ✅ | ✅ | ❌ | ❌ |
| `challan:read` | View sales delivery challans and order snapshots | ✅ | ✅ | ✅ | ✅ |
| `challan:confirm` | Atomically confirm and dispatch delivery challans | ✅ | ✅ | ❌ | ❌ |
| `challan:cancel` | Cancel unconfirmed draft challans | ✅ | ✅ | ❌ | ❌ |
| `user:manage` | Manage user accounts and role assignments | ✅ | ❌ | ❌ | ❌ |

---

## 🔄 Core Business Data Flows

```mermaid
flowchart LR
    subgraph CRM ["1. Customer CRM"]
        C1[Create Customer / Lead] --> C2[Log Follow-up Notes Timeline]
    end

    subgraph Inventory ["2. Product & Inventory"]
        P1[Create Product SKU] --> P2[Initial Stock / Inward Adjustment]
        P2 --> P3[Real-time Stock Balance & Low-Stock Alerts]
    end

    subgraph Challans ["3. Sales Fulfillment"]
        S1[Select Customer] --> S2[Add Multi-Product Items & Quantities]
        S2 --> S3[Generate Draft Challan CH-2026-XXXXX]
        S3 --> S4{Confirm Challan?}
        S4 -- "Sufficient Stock" --> S5[Atomic Stock Deduction + Audit Log]
        S4 -- "Insufficient Stock" --> S6[Transaction Rollback + 409 Alert]
    end

    CRM --> Challans
    Inventory --> Challans
```

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: Local PostgreSQL 14+ instance OR Docker Desktop

---

### Step 1: Clone Repository
```bash
git clone https://github.com/aditya-singh-18/StockX.git
cd StockX
```

---

### Step 2: Backend Setup
```bash
cd StockX-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure your `StockX-backend/.env` file contains:
```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stockX_db?schema=public"
JWT_SECRET="stockX_super_secret_jwt_access_key_2026"
CORS_ORIGIN="http://localhost:3000"
```

Run database migrations and seed default permissions, users, and catalog data:
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database (Roles, Permissions, 4 Users, Demo Products & Customers)
npm run prisma:seed

# Start NestJS backend in development mode
npm run start:dev
```
*The backend will be running at [http://localhost:3001](http://localhost:3001) with Swagger documentation at [http://localhost:3001/api/docs](http://localhost:3001/api/docs).*

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd StockX-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Ensure your `StockX-frontend/.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the Next.js development server:
```bash
npm run dev
```
*The frontend portal will be accessible at [http://localhost:3000](http://localhost:3000).*

---

## 🔑 Environment Variables Reference

### Backend (`StockX-backend/.env`)
| Variable | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3001` | HTTP port for the NestJS server |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | `your_access_token_secret` | Secret key used to sign access JWTs (15 min) |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin for frontend requests |

### Frontend (`StockX-frontend/.env.local`)
| Variable | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:3001` | Base URL of the backend REST API |

---

## 🚀 Cloud Deployment Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE / DNS                      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│      VERCEL EDGE NETWORK    │  │       RENDER WEB SERVICE   │
│   Next.js 15 App Router     │  │   NestJS Modular API Engine│
│   (SSR + Static Assets)     │  │   (Docker Container)       │
└──────────────┬──────────────┘  └────────────┬───────────────┘
               │                              │
               │ HTTP / JSON API              │ Prisma Connection
               └──────────────────────────────┼───────────────┐
                                              ▼               ▼
                                 ┌────────────────────────────┐
                                 │   SUPABASE / NEON POSTGRES │
                                 │    PostgreSQL 16 Engine    │
                                 │    (ACID Transactions)     │
                                 └────────────────────────────┘
```

1. **Backend on Render**:
   - Packaged and deployed via Docker / Node build environment.
   - Database migrations are automatically executed prior to boot using `npx prisma migrate deploy`.
2. **Frontend on Vercel**:
   - Zero-config Next.js 15 deployment with server-side proxy route handlers protecting token transport.
3. **Database on Supabase / Neon**:
   - High-performance managed PostgreSQL with connection pooling and automated SSL enforcement.

---

## 📡 REST API Specification

### Authentication (`/auth`)
| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate with email/password; returns JWT + Opaque refresh token |
| `POST` | `/auth/refresh` | Public | Single-use refresh token rotation issuing fresh token pair |
| `POST` | `/auth/logout` | Authenticated | Revoke active refresh token session |
| `POST` | `/auth/logout-all` | Authenticated | Revoke all active sessions for current user |
| `GET` | `/auth/me` | Authenticated | Return profile, role, and dynamic permission capabilities |

### Customer CRM (`/customers`)
| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/customers` | `customer:create` | Register new customer profile (Retail/Wholesale/Distributor) |
| `GET` | `/customers` | `customer:read` | Paginated customer list with multi-field search and status filters |
| `GET` | `/customers/:id` | `customer:read` | Detailed profile with notes timeline and linked sales challans |
| `PATCH` | `/customers/:id` | `customer:update` | Update customer contact, address, or follow-up date |
| `POST` | `/customers/:id/notes` | `customer:update` | Add follow-up timeline note linked to authenticated staff |
| `DELETE`| `/customers/:id` | `user:manage` | Delete customer (guarded against customers with linked challans) |

### Products & Inventory (`/products`)
| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/products` | `product:create` | Create catalog SKU item (initial stock starts at 0) |
| `GET` | `/products` | `product:read` | Paginated product list with search, category, & lowStock filters |
| `GET` | `/products/:id` | `product:read` | Product details with recent stock movements & computed lowStock alert |
| `PATCH` | `/products/:id` | `product:update` | Update product metadata (price, SKU, location, minStock) |
| `POST` | `/products/:id/stock-movements` | `product:stock-adjust` | Manual IN/OUT stock adjustment with atomic balance update |
| `GET` | `/products/:id/stock-movements` | `product:read` | Paginated stock audit history with movement reasons and authors |

### Sales Challans (`/challans`)
| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/challans` | `challan:create` | Create multi-product draft challan with frozen price/name snapshots |
| `GET` | `/challans` | `challan:read` | Paginated delivery challans with customer and status filters |
| `GET` | `/challans/:id` | `challan:read` | Full challan breakdown with line items and confirmer attribution |
| `POST` | `/challans/:id/confirm` | `challan:confirm` | **Atomic Dispatch**: Checks stock, deducts inventory, creates audit logs |
| `POST` | `/challans/:id/cancel` | `challan:cancel` | Cancel unconfirmed draft challan (locked if already confirmed) |

---

## 📌 Known Limitations, Assumptions & Future Roadmap

1. **Scope Boundary**:
   - Purchase Orders (PO), Vendor Management, Invoicing, and GST Tax Invoices were identified in the background domain context but are excluded from this release to focus strictly on the **Core Modules Required** (CRM, Inventory, and Sales Delivery Challan fulfillment).
2. **One-Way Challan Confirmation**:
   - Once a sales challan is in `CONFIRMED` status, it is locked against cancellation to preserve audit integrity. An enterprise *Sales Return & Stock Restocking Workflow* is architected as the next iteration.
3. **Multi-Warehouse Topology**:
   - In the current schema, physical location is modeled as a descriptive field (`location: string`) on the product. Future scaling will extract this into discrete `Warehouse` and `WarehouseStock` relational entities for multi-facility transfer tracking.
4. **Cloud Infrastructure Selection**:
   - In accordance with the assignment specifications, AWS deployment was marked as optional/bonus. Free-tier cloud hosting (**Vercel** + **Render** + **Supabase / Neon**) was chosen to demonstrate complete deployment without incurring recurring infrastructure costs.

---

## 👨‍💻 Submission & Verification Checklist

- [x] **Backend API**: NestJS + PostgreSQL + Prisma + JWT Refresh Token Rotation.
- [x] **Frontend UI**: Next.js 15 Responsive Dark Theme Portal with deep-linkable pagination & filters.
- [x] **RBAC Matrix**: 4 Distinct Roles with 12 Granular Permission Gates.
- [x] **Atomic Transaction**: DB-level conditional decrement preventing stock overdrafts under concurrency.
- [x] **Audit Trail**: Every inventory modification logs movement type, source, and author.
- [x] **Artifacts**: Postman collection export, Swagger OpenAPI documentation, and screen recording walkthrough.