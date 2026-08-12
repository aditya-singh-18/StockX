STOCKFLOW — MASTER BUILD TREE
═══════════════════════════════════════

✅ PHASE 0: PLANNING
├── ✅ Case study samjha, modules decide kiye
├── ✅ Tech stack decide: NestJS + Next.js + PostgreSQL + Prisma
├── ✅ RBAC design: Permission-based (Role → Permission → RolePermission)
├── ✅ App name: StockFlow
├── ✅ Prisma schema finalized (schema.prisma)
└── ✅ Build plan + Gemini prompts ready (BUILD_PLAN.md)

✅ STEP 0: PROJECT SETUP
├── ✅ NestJS project scaffolded (StockFlow-backend)
├── ✅ Modules created (empty): auth, users, roles, customers, products, challans
├── ✅ Swagger setup at /api/docs
├── ✅ docker-compose.yml (Postgres 16)
├── ✅ Global ValidationPipe + global exception filter
├── ✅ Build verified (npm run build passed)
├── ✅ .gitignore created (.env excluded — VERIFY THIS AGAIN)
└── ✅ GitHub repo connected + pushed

🔄 STEP 1: PRISMA SCHEMA + SEED  ← TUM ABHI YAHAN HO
├── ⬜ schema.prisma saved in StockFlow-backend/prisma/
├── ⬜ PrismaService created (OnModuleInit/OnModuleDestroy)
├── ⬜ Global PrismaModule created + imported in AppModule
├── ⬜ Migration run (prisma migrate dev --name init)
├── ⬜ Docker Postgres container running (docker compose up -d) — VERIFY
├── ⬜ seed.ts created (4 roles, 12 permissions, role-permission mapping, 4 test users)
├── ⬜ Seed script wired in package.json
├── ⬜ Seed run successful
├── ⬜ VERIFY: npx prisma studio → check roles/permissions/users data correctly inserted
└── ⬜ COMMIT: "feat: prisma schema, migration, and seed data"

⬜ STEP 2: AUTH MODULE
├── ⬜ POST /auth/login endpoint
├── ⬜ JwtStrategy (passport-jwt)
├── ⬜ PermissionsGuard + @RequirePermissions() decorator
├── ⬜ LoginDto with class-validator
├── ⬜ VERIFY: Postman se har 4 role ka login test karo, JWT payload check karo
│         (role + permissions array sahi aa rahe hain ya nahi)
└── ⬜ COMMIT: "feat: JWT auth with permission-based guards"

⬜ STEP 3: CUSTOMERS MODULE
├── ⬜ POST /customers (create)
├── ⬜ GET /customers (paginated, search, filter)
├── ⬜ GET /customers/:id (detail with notes)
├── ⬜ PATCH /customers/:id (update)
├── ⬜ POST /customers/:id/notes (add follow-up note)
├── ⬜ VERIFY: Postman se har endpoint test, wrong-role se try karke 403 check karo
└── ⬜ COMMIT: "feat: customers CRM module"

⬜ STEP 4: PRODUCTS MODULE
├── ⬜ POST /products (create)
├── ⬜ GET /products (paginated, search, lowStock filter)
├── ⬜ GET /products/:id
├── ⬜ PATCH /products/:id (edit, NOT stock directly)
├── ⬜ POST /products/:id/stock-movements (IN/OUT, transaction-wrapped)
├── ⬜ GET /products/:id/stock-movements (history)
├── ⬜ VERIFY: negative stock case manually test karo (OUT quantity > currentStock → 409 aana chahiye)
└── ⬜ COMMIT: "feat: products & inventory module with stock movements"

⬜ STEP 5: CHALLANS MODULE ★ MOST CRITICAL ★
├── ⬜ POST /challans (create draft, auto challan number, product snapshot)
├── ⬜ GET /challans (paginated, filter by status/customer)
├── ⬜ GET /challans/:id (detail with items)
├── ⬜ POST /challans/:id/confirm ($transaction: stock check → deduct → movement log → status update)
├── ⬜ POST /challans/:id/cancel (only if DRAFT)
├── ⬜ VERIFY (IMPORTANT):
│    ├── ⬜ Confirm with sufficient stock → success, stock reduces correctly
│    ├── ⬜ Confirm with insufficient stock → 409 error, stock UNCHANGED (rollback check)
│    ├── ⬜ Try confirming an already-confirmed challan → should fail
│    └── ⬜ Check StockMovement records created with correct challanId link
└── ⬜ COMMIT: "feat: sales challan module with atomic stock confirmation"

⬜ ── BACKEND CORE COMPLETE — FULL BACKEND POSTMAN TEST PASS ──

⬜ STEP 5.5: BACKEND DEPLOYMENT (do this before frontend)
├── ⬜ Push DB to Neon/Supabase (production Postgres)
├── ⬜ Run migrations against production DB
├── ⬜ Run seed against production DB
├── ⬜ Deploy backend to Render/Railway
├── ⬜ Set env vars on hosting platform (DATABASE_URL, JWT_SECRET, etc.)
├── ⬜ VERIFY: hit live backend URL /api/docs, test login via Swagger
└── ⬜ COMMIT: "chore: deployment config"

⬜ STEP 6: FRONTEND (Next.js)
├── ⬜ Next.js project scaffolded (StockFlow-frontend)
├── ⬜ Design direction applied (Linear-style minimal, Inter font, single accent color)
├── ⬜ /login page + Route Handler proxy (httpOnly cookie)
├── ⬜ middleware.ts (route protection)
├── ⬜ API client (lib/api.ts)
├── ⬜ Layout + sidebar (role-based menu filtering)
├── ⬜ /dashboard/customers (list, search, add/edit modal, detail page, notes)
├── ⬜ /dashboard/products (list, low-stock badge, add/edit, stock-adjust modal)
├── ⬜ /dashboard/challans (list, create flow, multi-product picker, confirm dialog)
├── ⬜ VERIFY: login as all 4 roles, check UI correctly hides/shows based on permissions
└── ⬜ COMMIT: incremental commits per page/feature

⬜ STEP 6.5: FRONTEND DEPLOYMENT
├── ⬜ Deploy to Vercel
├── ⬜ Set NEXT_PUBLIC_API_URL env var (pointing to live backend)
└── ⬜ VERIFY: full flow on LIVE URL — login → customer → product → challan → confirm → stock reduces

⬜ STEP 7: DOCUMENTATION
├── ⬜ README.md:
│    ├── ⬜ Architecture overview + ER diagram
│    ├── ⬜ Setup instructions (local)
│    ├── ⬜ Env variables list (no real secrets)
│    ├── ⬜ Deployment instructions
│    ├── ⬜ Assumptions made
│    ├── ⬜ Known limitations (be honest — PDF export not done, etc.)
│    └── ⬜ Test credentials for all 4 roles
├── ⬜ Postman collection exported (JSON file, all endpoints, incrementally built)
└── ⬜ COMMIT: "docs: README and Postman collection"

⬜ STEP 8: SCREEN RECORDING
├── ⬜ Login as each of the 4 roles (show UI differences)
├── ⬜ Full flow: customer add → product add (with stock) → challan create → confirm
├── ⬜ Show stock reducing after confirm
├── ⬜ Show insufficient-stock error live (proof of business logic)
├── ⬜ Narrate WHY (e.g. "transaction use kiya taaki stock negative na ho")
└── ⬜ Save/upload recording

⬜ STEP 9: FINAL SUBMISSION CHECKLIST (per PDF requirements)
├── ⬜ GitHub repository link
├── ⬜ Live frontend URL
├── ⬜ Live backend API URL
├── ⬜ Test login credentials for all roles
├── ⬜ Postman collection / API docs
├── ⬜ README with setup + deployment instructions
├── ⬜ Short architecture explanation
├── ⬜ Known limitations documented
├── ⬜ Screen recording uploaded
└── ⬜ Google Form submitted (link from the original email)

⬜ BUFFER TIME (keep 2+ hours before deadline for surprises)