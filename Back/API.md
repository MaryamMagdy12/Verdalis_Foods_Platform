# Verdalis Foods Site Catalog – API Reference

Base URL: `http://your-backend.test/api` (or `http://localhost:8000/api` when using `php artisan serve`).

---

## Public API (no auth)

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products. Query: `brand_id`, `category_id`, `search`, `brand` (e.g. "Alafia") |
| GET | `/products/random` | Random products (e.g. “best selling”). Query: `limit` (default 6, max 20) |
| GET | `/products/by-brand/{brand}` | Products by brand. Query: `category_id`, `search` |
| GET | `/products/{id}` | Single product with category and brand |

### Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | List brands (id, name, logo URL) |
| GET | `/brands/{id}` | Single brand |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories. Query: `brand_id` |

### Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stores` | List stores (id, name, address, latitude, longitude, opening_hours, days_open) |

### Settings (e.g. map)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/warehouse` | Warehouse location for contact map: `address`, `latitude`, `longitude` |

### Contact form
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/contact` | `name`, `company_name`, `message`, `phone`, `address`, `email` (optional) | Submit contact message |

### Questions (product catalog form)
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/questions` | `name`, `email`, `message`, `product_id` (optional) | Submit question |

---

## Admin API (Bearer token)

Login first:  
**POST** `/api/admin/login`  
Body: `{ "email": "admin@...", "password": "..." }`  
Response: `{ "token": "...", "token_type": "Bearer", "user": { ... } }`

Then send header: `Authorization: Bearer <token>` on all admin requests.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Login (public) |
| POST | `/admin/logout` | Logout |
| GET | `/admin/me` | Current admin user |

### Admin users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/admins` | List admin accounts. Query: `search` |
| POST | `/admin/admins` | Create admin. Body: `name`, `email`, `password` |

### Shippers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/shippers` | List shippers. Query: `search` |
| POST | `/admin/shippers` | Create shipper. Body: `name`, `email`, `password`, `phone`, `shipper_pin` (optional) |
| GET | `/admin/shippers/{id}` | Show shipper |
| DELETE | `/admin/shippers/{id}` | Delete shipper |

### Products (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List (query: `brand_id`, `category_id`) |
| POST | `/admin/products` | Create (body + optional `image` file) |
| GET | `/admin/products/{id}` | Show |
| PUT/PATCH | `/admin/products/{id}` | Update |
| DELETE | `/admin/products/{id}` | Delete |

### Brands (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/brands` | List (with products count) |
| POST | `/admin/brands` | Create (body + optional `logo` file) |
| GET | `/admin/brands/{id}` | Show (with categories and products) |
| PUT/PATCH | `/admin/brands/{id}` | Update |
| DELETE | `/admin/brands/{id}` | Delete |

### Categories (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/categories` | List (query: `brand_id`) |
| POST | `/admin/categories` | Create |
| GET | `/admin/categories/{id}` | Show |
| PUT/PATCH | `/admin/categories/{id}` | Update |
| DELETE | `/admin/categories/{id}` | Delete |

### Stores (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stores` | List |
| POST | `/admin/stores` | Create |
| GET | `/admin/stores/{id}` | Show |
| PUT/PATCH | `/admin/stores/{id}` | Update |
| DELETE | `/admin/stores/{id}` | Delete |

### Contact messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/contact-messages` | List |
| GET | `/admin/contact-messages/{id}` | Show |
| POST | `/admin/contact-messages/{id}/reply` | Send reply by email. Body: `{ "reply": "..." }` |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/questions` | List |
| GET | `/admin/questions/{id}` | Show |
| POST | `/admin/questions/{id}/reply` | Send reply by email. Body: `{ "reply": "..." }` |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/settings/warehouse` | Get warehouse location |
| PUT | `/admin/settings/warehouse` | Update. Body: `address`, `latitude`, `longitude` |

---

## Data relations

- **Brand** → has many **Categories** → each Category has many **Products**.
- Product has: `category_id`; brand is via `product.category.brand`.
- Contact form: `name`, `company_name`, `phone`, `address` required; `email` optional.
- Product image and brand logo are stored under `storage/app/public`; use `php artisan storage:link` and reference as `asset('storage/...')`.

---

## CORS

If the React app runs on a different origin, configure CORS in Laravel (e.g. `config/cors.php` if present, or middleware) to allow your frontend origin and `Content-Type` / `Authorization` headers.
