═════════════════════════════════════════════════════════════════════
📖 STOCKFLOW APIS TESTING GUIDE & ENDPOINT REGISTRY
═════════════════════════════════════════════════════════════════════

Base URL: http://localhost:3001
Swagger Docs: http://localhost:3001/api/docs

Default Test Logins (Password for all: Test@1234):
👑 Admin:     admin@test.com     (Permissions: All 12 permissions)
💼 Sales:     sales@test.com     (Permissions: customer:*, product:read, challan:*)
🏭 Warehouse: warehouse@test.com (Permissions: product:read, product:update, product:stock-adjust, challan:read)
📊 Accounts:  accounts@test.com  (Permissions: customer:read, product:read, challan:read)

─────────────────────────────────────────────────────────────────────
1. AUTHENTICATION APIS
─────────────────────────────────────────────────────────────────────

1.1 POST /auth/login
• Purpose: Log in with email/password to receive 15m access token & refresh token.
• Access: Public
• Headers: Content-Type: application/json
• Body:
{
  "email": "admin@test.com",
  "password": "Test@1234"
}
• Expected Status: 200 OK
• Response Sample:
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "40_byte_hex_opaque_token",
  "user": {
    "id": "uuid",
    "name": "Aditya Admin",
    "email": "admin@test.com",
    "role": "Admin",
    "roleId": "uuid",
    "permissions": ["customer:create", "customer:read", "challan:confirm", ...]
  }
}

1.2 POST /auth/refresh
• Purpose: Refresh session with Token Rotation (single-use refresh token).
• Access: Public
• Headers: Content-Type: application/json
• Body:
{
  "refreshToken": "<paste_refreshToken_from_login_or_previous_refresh>"
}
• Expected Status: 200 OK (or 401 if revoked/expired)

1.3 GET /auth/me
• Purpose: Get current authenticated user session & dynamic capabilities.
• Access: Any authenticated user
• Headers: 
  Authorization: Bearer <accessToken>
• Expected Status: 200 OK

1.4 POST /auth/logout
• Purpose: Revoke single device session refresh token.
• Access: Any authenticated user
• Headers:
  Authorization: Bearer <accessToken>
  Content-Type: application/json
• Body:
{
  "refreshToken": "<refresh_token_to_revoke>"
}
• Expected Status: 204 No Content

1.5 POST /auth/logout-all
• Purpose: Revoke all active sessions for current user across all devices.
• Access: Any authenticated user
• Headers:
  Authorization: Bearer <accessToken>
• Expected Status: 204 No Content

─────────────────────────────────────────────────────────────────────
2. CUSTOMERS CRM APIS
─────────────────────────────────────────────────────────────────────

2.1 POST /customers
• Purpose: Create a new customer profile.
• Required Permission: customer:create (Admin, Sales)
• Headers:
  Authorization: Bearer <accessToken>
  Content-Type: application/json
• Body:
{
  "name": "Rajesh Sharma",
  "mobile": "+91 9876543210",
  "email": "rajesh@sharmatraders.in",
  "businessName": "Sharma Traders Pvt Ltd",
  "gstNumber": "27AABCS1429B1Z0",
  "type": "WHOLESALE",
  "address": "102 Industrial Area, Phase 2, Pune, MH",
  "status": "ACTIVE",
  "followUpDate": "2026-08-25T10:00:00.000Z"
}
• Expected Status: 201 Created

2.2 GET /customers
• Purpose: Get paginated list of customers with search & filters.
• Required Permission: customer:read (Admin, Sales, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Query Parameters (Optional):
  ?page=1&limit=10&search=Sharma&status=ACTIVE&type=WHOLESALE&sortBy=createdAt&sortOrder=desc
• Expected Status: 200 OK

2.3 GET /customers/:id
• Purpose: Get customer detail with follow-up notes timeline & recent challans.
• Required Permission: customer:read (Admin, Sales, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Expected Status: 200 OK (or 404 if not found)

2.4 PATCH /customers/:id
• Purpose: Update customer profile details.
• Required Permission: customer:update (Admin, Sales)
• Headers:
  Authorization: Bearer <accessToken>
  Content-Type: application/json
• Body (All fields optional):
{
  "businessName": "Sharma Traders & Distribution Pvt Ltd",
  "status": "ACTIVE"
}
• Expected Status: 200 OK

2.5 POST /customers/:id/notes
• Purpose: Add a follow-up interaction note to customer timeline.
• Required Permission: customer:update (Admin, Sales)
• Headers:
  Authorization: Bearer <accessToken>
  Content-Type: application/json
• Body:
{
  "note": "Spoke with client. Confirmed Q3 order of 500 SMPS power supplies."
}
• Expected Status: 201 Created (includes createdBy: { id, name, email })

2.6 DELETE /customers/:id
• Purpose: Delete customer profile (Admin only, rejects if linked challans exist).
• Required Permission: user:manage (Admin only)
• Headers:
  Authorization: Bearer <admin_accessToken>
• Expected Status: 200 OK (or 400 if active challans linked)

─────────────────────────────────────────────────────────────────────
3. PRODUCTS & INVENTORY APIS
─────────────────────────────────────────────────────────────────────

3.1 POST /products
• Purpose: Create a new product in the catalog (currentStock always starts at 0).
• Required Permission: product:create (Admin, Warehouse)
• Headers:
  Authorization: Bearer <warehouse_or_admin_accessToken>
  Content-Type: application/json
• Body:
{
  "name": "Smart Thermal Imager FLIR-E8",
  "sku": "THM-FLIR-E8",
  "category": "Test & Measurement",
  "unitPrice": 45000.00,
  "minStock": 10,
  "location": "Rack A-12, Pune Central Warehouse"
}
• Expected Status: 201 Created (or 409 Conflict if SKU duplicate)

3.2 GET /products
• Purpose: Get paginated product catalog with search, category & lowStock filter.
• Required Permission: product:read (Admin, Sales, Warehouse, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Query Parameters (Optional):
  ?page=1&limit=10&search=Thermal&category=Test & Measurement&lowStock=true&sortBy=createdAt&sortOrder=desc
• Expected Status: 200 OK

3.3 GET /products/:id
• Purpose: Get single product details, low-stock status flag, and movement stats.
• Required Permission: product:read (Admin, Sales, Warehouse, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Expected Status: 200 OK (or 404 if not found)

3.4 PATCH /products/:id
• Purpose: Update product metadata (name, sku, category, unitPrice, minStock, location).
• Required Permission: product:update (Admin, Warehouse)
• Headers:
  Authorization: Bearer <warehouse_or_admin_accessToken>
  Content-Type: application/json
• Body (All fields optional):
{
  "unitPrice": 46500.00,
  "minStock": 15,
  "location": "Rack B-02, High Value Cage"
}
• Expected Status: 200 OK (or 409 if SKU conflict)

3.5 POST /products/:id/stock-movements
• Purpose: Adjust stock (IN/OUT) atomically wrapped in a database transaction with DB-level conditional check.
• Required Permission: product:stock-adjust (Admin, Warehouse)
• Headers:
  Authorization: Bearer <warehouse_or_admin_accessToken>
  Content-Type: application/json
• Body:
{
  "quantity": 50,
  "type": "IN",
  "source": "PURCHASE_RECEIVED",
  "note": "Supplier batch #FLIR-2026-AUG received"
}
• Expected Status: 201 Created (returns { product, movement with balanceAfter })

3.6 GET /products/:id/stock-movements
• Purpose: Get paginated stock movement audit log history for a specific product.
• Required Permission: product:read (Admin, Sales, Warehouse, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Query Parameters: ?page=1&limit=10
• Expected Status: 200 OK (includes createdBy: { id, name, email })

─────────────────────────────────────────────────────────────────────
4. SALES CHALLAN APIS (ATOMIC FULFILLMENT & SNAPSHOTS)
─────────────────────────────────────────────────────────────────────

4.1 POST /challans
• Purpose: Create a sales challan in DRAFT status with auto-generated number (e.g. CH-2026-00001) and frozen price/name snapshots.
  *Note: Stock is NOT touched at draft creation.*
• Required Permission: challan:create (Admin, Sales)
• Headers:
  Authorization: Bearer <sales_or_admin_accessToken>
  Content-Type: application/json
• Body:
{
  "customerId": "b6bd6834-b96e-452b-a11b-6df6e76ef684",
  "items": [
    {
      "productId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "quantity": 10
    },
    {
      "productId": "c2ffdc88-8b1a-3de7-aa5c-5aa8ac270b22",
      "quantity": 5
    }
  ]
}
• Expected Status: 201 Created (returns full draft challan with snapshot items and totalAmount)

4.2 GET /challans
• Purpose: Get paginated list of challans with search (challan number / customer) and status filters.
• Required Permission: challan:read (Admin, Sales, Warehouse, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Query Parameters (Optional):
  ?page=1&limit=10&status=DRAFT&search=CH-2026&sortBy=createdAt&sortOrder=desc
• Expected Status: 200 OK

4.3 GET /challans/:id
• Purpose: Get detailed challan view including snapshot items, customer, and movement audit links.
• Required Permission: challan:read (Admin, Sales, Warehouse, Accounts)
• Headers:
  Authorization: Bearer <accessToken>
• Expected Status: 200 OK (or 404 if not found)

4.4 POST /challans/:id/confirm
• Purpose: Confirm sales challan (THE ATOMIC TRANSACTION).
  1. Checks all items stock >= quantity with atomic DB row-level locks.
  2. If ANY item is short, rolls back entire transaction (zero partial deduction).
  3. Deducts stock atomically, creates StockMovement (OUT) audit records with balanceAfter, and marks status CONFIRMED.
• Required Permission: challan:confirm (Admin, Sales)
• Headers:
  Authorization: Bearer <sales_or_admin_accessToken>
• Expected Status: 200 OK (or 409 Conflict if insufficient stock / already confirmed)
• Response Sample:
{
  "challan": {
    "id": "uuid",
    "challanNo": "CH-2026-00001",
    "status": "CONFIRMED",
    "confirmedAt": "2026-08-12T07:55:00.000Z",
    "totalQty": 15,
    "totalAmount": "12500.00",
    "customer": { ... },
    "items": [ ... ]
  },
  "stockMovements": [ ... ]
}

4.5 POST /challans/:id/cancel
• Purpose: Cancel a draft sales challan.
  *Note: Cannot cancel a confirmed challan (returns 409).*
• Required Permission: challan:cancel (Admin, Sales)
• Headers:
  Authorization: Bearer <sales_or_admin_accessToken>
• Expected Status: 200 OK (or 409 Conflict if already confirmed)