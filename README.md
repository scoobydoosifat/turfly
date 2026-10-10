# Turfly

Turfly is a deliberately simple full-stack turf booking project. It uses a Spring Boot REST API, MongoDB, JWT authentication, SSLCommerz hosted checkout, password-reset email, Spring Cache, Spring AI, and a responsive React frontend.

The project is independent from `TaskMistri`; both folders sit beside each other.

## What is included

- Animated, responsive landing page with original AI-generated pitch photography
- Football and cricket pitch discovery
- Live 90-minute availability and collision-safe booking service
- Registration, login, JWT authorization, profile updates, and role-based routes
- Forgot/reset password flow using a single-use, SHA-256-hashed email token
- SSLCommerz hosted checkout, IPN/server-side validation, and admin approval after payment
- Safe demo-payment mode when SSLCommerz credentials are absent
- Spring AI booking assistant with a useful offline fallback
- Caffeine caching for public pitch data and admin statistics
- Player booking dashboard
- Admin statistics, paid-booking approvals, pitch image uploads, users, and contact inbox
- Contact form and venue information
- Button loaders and immediate disabling on every state-changing request to prevent rapid duplicate submissions
- Central validation and JSON error responses

## Project structure

```text
Turfly/
├── pom.xml
├── src/main/java/com/turfly/
│   ├── config/        # Mongo auditing, security, starter data
│   ├── controller/    # REST controllers
│   ├── dto/           # Request and response records
│   ├── model/         # MongoDB documents
│   ├── repository/    # Spring Data repositories
│   ├── security/      # JWT filter and user details
│   └── service/       # Small application services
├── src/test/java/     # Booking, JWT, and AI fallback tests
└── frontend/
    ├── public/images/ # Original Turfly pitch images
    └── src/           # React pages, components, API helper, CSS
```

## Requirements

- Java 21 or newer
- Maven 3.9+
- Node.js 18 or newer
- MongoDB local instance or MongoDB Atlas connection

## Configuration

Copy `.env.example` to `.env` in this folder, then replace the values you need. The application also accepts the same keys as normal environment variables.

The only value needed to enable all database-backed features is:

```properties
MONGODB_URI=mongodb+srv://USER:PASSWORD@YOUR_CLUSTER.mongodb.net/turfly
MONGODB_AUTO_INDEX_CREATION=true
```

Until that URL is supplied, Spring Boot still starts and the health, public-information, and offline AI endpoints work. Database-backed endpoints return a controlled server error, while the frontend displays representative pitch data for visual development.

Important production values:

```properties
JWT_SECRET=use-a-long-random-secret-at-least-32-characters
ADMIN_EMAIL=sifatmazib625@gmail.com
ADMIN_PASSWORD=replace-the-local-password

SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true
SSLCOMMERZ_DEMO_ENABLED=false
BACKEND_URL=https://your-public-api.example.com

MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=sifatmazib625@gmail.com
MAIL_PASSWORD=your-email-app-password
MAIL_AUTH=true
MAIL_STARTTLS=true

AI_ENABLED=true
SPRING_AI_MODEL_CHAT=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4.1-mini
```

Never commit the real `.env` file. It is already ignored by Git.

## Run locally

Run `TurflyApplication` from IntelliJ and open `http://localhost:9091`. Spring Boot serves both the frontend and REST API from the same application, just like TaskMistri.

Only rebuild the frontend after changing React code:

```bash
cd frontend
npm install
npm run build
```

With MongoDB connected, starter pitches and this local administrator are created once:

- Email: `sifatmazib625@gmail.com`
- Password: `Admin123!`

Change the password through configuration before deployment.

## SSLCommerz payment callbacks

Configure `BACKEND_URL` to a public HTTPS address so SSLCommerz can reach the callback endpoints:

```text
POST /api/payments/sslcommerz/ipn
POST /api/payments/sslcommerz/success
POST /api/payments/sslcommerz/fail
POST /api/payments/sslcommerz/cancel
```

After a valid IPN or success callback, Turfly checks the transaction, amount, and SSLCommerz validation response before moving the booking to `AWAITING_APPROVAL`. The admin then confirms or rejects it from the admin panel. With no store credentials, local demo mode follows the same approval workflow.

## Main REST endpoints

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /api/auth/register`, `/login`, `/forgot-password`, `/reset-password`; `GET /api/auth/me` |
| Pitches | `GET /api/pitches`, `GET /api/pitches/{id}` |
| Booking | `GET /api/bookings/availability`, `POST /api/bookings`, `GET /api/bookings/me`, `DELETE /api/bookings/{id}` |
| Payment | `POST /api/payments/checkout/{id}`, `/demo-complete/{id}`, SSLCommerz IPN/callback routes |
| Player | `PUT /api/users/me`, `PUT /api/users/me/password` |
| Assistant | `POST /api/ai/ask` |
| Contact | `POST /api/contact`, `GET /api/public/info` |
| Admin | `/api/admin/stats`, `/bookings`, `/bookings/{id}/confirm`, `/bookings/{id}/reject`, `/messages`, `/users`, pitch CRUD, and `/pitches/upload` |
| Operations | `GET /api/health` |

## Verification

```bash
mvn test
mvn package
cd frontend
npm run build
npm audit
```

The checked-in version passes eight backend tests, creates the executable Spring Boot JAR, and builds the production React bundle.
