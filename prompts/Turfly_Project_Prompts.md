# Turfly - Structured Development Prompts

## Purpose of this file

This file is a clean, organized, and security-safe record of the prompts used to design and improve the Turfly project. The prompts are grouped by development phase so the full project can be explained to a teacher from the first architectural decision through testing and deployment.

Sensitive values such as database passwords, JWT secrets, email API keys, and payment credentials are intentionally represented with environment-variable placeholders. Real secrets should never be committed to GitHub.

---

## 1. Project research and reference analysis

### Prompt 1.1 - Analyze the reference turf-booking website

> Examine the public website `https://turfnationbd.com/` as a senior full-stack developer. Study its purpose, target users, navigation, landing-page sections, pitch cards, booking journey, authentication pages, contact information, owner/admin workflow, visual hierarchy, responsive behavior, animation style, colors, typography, and user experience. Do not clone protected branding or copy the site exactly. Produce a feature and structure analysis that can be used to build an original turf-booking platform with a similar business workflow and a distinct identity.

### Prompt 1.2 - Analyze the TaskMistri reference project

> Inspect the existing `TaskMistri` project in the workspace. Study its Spring Boot package structure, naming style, controller-service-repository flow, REST controller patterns, DTO design, model classes, MongoDB configuration, Spring Security approach, frontend integration, application properties, error handling, and general code simplicity. Use it only as a code-style reference. The new project must be created in a separate sibling folder and must not modify or live inside the TaskMistri folder.

---

## 2. Project architecture

### Prompt 2.1 - Create the Turfly project architecture

> Create a separate project named `Turfly` beside `TaskMistri`. Use Java 21, Spring Boot 3, Maven, MongoDB, Spring Data MongoDB, Spring Security, JWT, Bean Validation, Spring Cache with Caffeine, Spring AI, transactional email, and a React/Vite frontend. Keep the package structure simple and understandable:
>
> - `config` for Spring configuration
> - `controller` for REST endpoints
> - `dto` for request and response records
> - `enums` for fixed states
> - `exception` for API errors
> - `model` for MongoDB documents
> - `repository` for Spring Data interfaces
> - `security` for JWT authentication
> - `service` for business rules
>
> Build the React frontend in a `frontend` folder. Configure Vite so local production builds are copied into `src/main/resources/static`, allowing IntelliJ to run one Spring Boot application at `http://localhost:9091` and serve both frontend and backend. Also keep the frontend deployable separately to Vercel.

### Prompt 2.2 - Keep configuration straightforward

> Keep `application.properties` readable and similar to a classroom Spring Boot project. Use direct properties such as:
>
> ```properties
> spring.application.name=Turfly
> spring.mongodb.database=turfly
> spring.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/turfly}
> server.port=${PORT:${SERVER_PORT:9091}}
> server.address=0.0.0.0
> ```
>
> Store production secrets in environment variables. Do not commit database passwords, JWT secrets, payment passwords, SMTP passwords, or Brevo API keys. Add clear comments for JWT, contact details, administrator seed values, email, SSLCommerz, Spring AI, caching, multipart uploads, and public frontend/backend URLs.

### Prompt 2.3 - Define the domain model

> Design simple MongoDB documents for `User`, `Pitch`, `Booking`, `ContactMessage`, `Coupon`, `Review`, and pending `RegistrationVerification`. Use string MongoDB IDs, Lombok getters/setters/builders, Spring Data auditing timestamps, and enums for roles and statuses. A booking must preserve a snapshot of the customer name, email, phone, pitch name, date, 90-minute times, original price, discount, final amount, booking status, payment status, transaction references, and expiry time. Keep the models easy to explain and avoid unnecessary inheritance.

---

## 3. Frontend design and user experience

### Prompt 3.1 - Build the original dark sports interface

> Build an attractive, modern, dark-only sports venue interface for Turfly. Use deep forest and charcoal surfaces, lime-green accents, readable off-white text, subtle coral error colors, glass effects, gradients, and controlled shadows. The design should feel energetic and premium without being too bright or too dull. Use Manrope for body text and Space Grotesk for display text. Make all pages responsive on desktop, tablet, and mobile.

### Prompt 3.2 - Build the animated landing page

> Create a landing page with a cinematic turf background, the headline `Own the pitch. Play your game.`, clear booking calls to action, venue statistics, an animated sports illustration, live-slot card, match card, scrolling sports ticker, quick-book section, dynamic pitch cards, amenities, a three-step booking explanation, venue experience section, and final CTA. The sports illustration must look like a football pitch. Animate one football and one cricket bat around it. Keep the floating text cards outside the orbit so they do not cover the illustration. Add scroll-reveal animations and respect `prefers-reduced-motion`.

### Prompt 3.3 - Improve navigation

> Create an intuitive glass-style navbar with a small utility row showing the Niketon address, opening hours, and phone number. Include Home, Book a turf, Pitches, Contact, Dashboard, Admin when appropriate, Sign in, Join Turfly, and Sign out. When Pitches is clicked from any page, first navigate to the home page and then smoothly scroll to the pitch section. On mobile, use a clear menu button and responsive navigation panel.

### Prompt 3.4 - Add confirmation dialogs and loaders

> Create reusable `LoadingButton` and `ConfirmDialog` components. Every state-changing request must disable its button while running and display a spinner so rapid clicks cannot create duplicate submissions. Use application-styled confirmation dialogs instead of browser `confirm()` prompts for sign-out, booking cancellation, pitch deletion, pitch updates, booking approval/rejection, coupon save/delete, message resolution, manual booking, and account deletion. Dialogs must prevent closing while the confirmed action is loading.

### Prompt 3.5 - Build frontend routing without unnecessary complexity

> Implement a small client-side router using the browser History API, React context, `pushState`, `replaceState`, and the `popstate` event. Provide `Link`, `NavLink`, `Navigate`, `useLocation`, `useNavigate`, and `useSearchParams`. Keep the route table in `App.jsx`. Add protected user and administrator routes. Vercel must rewrite all routes to `index.html`, while Spring Boot must forward local application paths to its packaged `index.html`.

---

## 4. Authentication, authorization, and account management

### Prompt 4.1 - Implement JWT login and authorization

> Implement stateless JWT security. Hash user passwords with BCrypt. On login, authenticate the normalized email and password and return a JWT plus a safe user DTO. Put email in the JWT subject and include user ID and role claims. Create a once-per-request JWT filter that reads `Authorization: Bearer <token>`, validates the signature and expiry, loads the user, and sets the Spring Security context. Publicly allow landing assets, authentication, health, public pitch reads, availability, reviews, AI questions, contact creation, and SSLCommerz callbacks. Require authentication for private user endpoints and `ROLE_ADMIN` for `/api/admin/**`.

### Prompt 4.2 - Add email OTP account verification with Brevo

> Change registration into a two-step email verification flow:
>
> 1. The user enters name, email, phone, and password.
> 2. `POST /api/auth/register` validates the request, rejects an existing email, creates a cryptographically random six-digit OTP, hashes both the password and OTP, stores only pending registration data, gives the OTP a ten-minute expiry, and sends the code using Brevo transactional email.
> 3. Do not create the real user yet.
> 4. The frontend shows a six-digit OTP field with resend and change-details actions.
> 5. `POST /api/auth/register/verify` checks the email, expiry, OTP hash, and attempt count.
> 6. Allow at most five incorrect attempts.
> 7. Only after a correct OTP should the service create an enabled `USER`, delete the pending verification, issue a JWT, and sign the user in.
>
> Put the Brevo API key and verified sender address only in Render environment variables. Use the Brevo HTTPS API because a free cloud host may block outgoing SMTP ports. Provide both HTML and plain-text email bodies.

### Prompt 4.3 - Add forgot and reset password

> Implement a privacy-safe forgot-password flow. `POST /api/auth/forgot-password` must always return the same generic response. If the email belongs to a user, generate a long random single-use token, save only its SHA-256 hash, set a 30-minute expiry, and send a reset link from the administrator's configured Brevo sender. Construct the link from `FRONTEND_URL`, so local development uses localhost and production uses `https://turflyy.vercel.app/reset-password?token=...`. `POST /api/auth/reset-password` must hash the incoming token, find the matching user, reject invalid or expired links, BCrypt-hash the new password, and clear the reset token fields after success.

### Prompt 4.4 - Add profile and account deletion

> Let authenticated users update their name and phone. Add account deletion with two frontend stages: first request the current password in a modal and call a verification endpoint; if the password is wrong, show `Password is incorrect` in the modal. If it is correct, show a second `Are you sure?` confirmation. Only after confirmation should the frontend send `DELETE /api/users/me` with the password. The backend must verify the BCrypt password again immediately before deleting the MongoDB user. After success, remove the JWT and return to the home page.

---

## 5. Pitch management and images

### Prompt 5.1 - Implement public pitch discovery

> Add public endpoints to list active pitches, optionally filter by sport, and retrieve a pitch by ID. Return DTOs rather than exposing MongoDB documents directly. Cache public pitch lists and individual pitch responses with Spring Cache/Caffeine for five minutes. The landing page and booking page must use live API data and fall back to representative demo pitches only when the backend/database is unavailable.

### Prompt 5.2 - Implement administrator pitch CRUD

> Add administrator features to create, update, and remove pitches. Allow name, sport, description, location, price per hour, capacity, image URL, feature list, and active state to be changed. Evict both pitch caches whenever data changes so edits immediately appear on the home page. Add clear edit and remove buttons, confirmation before saving or deleting, loading overlays during deletion, and success/error messages.

### Prompt 5.3 - Implement image upload

> Add `POST /api/admin/pitches/upload` using multipart form data. Accept only JPG/JPEG, PNG, and WEBP images up to 8 MB. Validate MIME type and filename extension, generate a UUID filename, create the upload directory, save the file, and return a public URL based on `BACKEND_URL`. Map `/uploads/**` to the configured upload folder. On the frontend, validate the image before upload, show a local preview, upload the image first, and then use the returned URL in pitch creation or update.

---

## 6. Booking and availability

### Prompt 6.1 - Implement live 90-minute availability

> Define twelve fixed 90-minute start times from 7:00 AM through 11:30 PM, with the final session ending at 1:00 AM. Use Asia/Dhaka time. Add public endpoints for one-day availability and a calendar of one to fourteen days. A slot is unavailable if it is in the past or if another non-cancelled booking uses the same pitch, date, and start time. Validate the pitch before returning slots.

### Prompt 6.2 - Implement user booking

> Require a signed-in user to choose a pitch, future-or-present date, valid start time, phone number, and optional coupon. Recheck the slot on the server immediately before saving. Use a synchronized service method to reduce simultaneous duplicate bookings in this simple single-instance application. Calculate a session price as hourly price multiplied by 1.5, apply a valid coupon, and create normal user bookings as `PENDING_PAYMENT` and `UNPAID` with a 30-minute payment expiry.

### Prompt 6.3 - Different administrator booking behavior

> If an administrator books from the normal booking page, confirm the booking immediately and skip checkout. Also provide an admin manual-booking form for walk-in or phone customers with customer details, live availability, and an optional `payment already received` checkbox. Manual bookings must be confirmed immediately; when marked paid, create a readable `ADMIN-...` payment reference.

### Prompt 6.4 - Add automatic cleanup and cancellation

> Add a scheduled job that runs every five minutes and marks expired `PENDING_PAYMENT` bookings as cancelled, releasing their slots. Let users cancel their own unpaid booking and let administrators cancel any unpaid booking. Do not allow normal cancellation of paid bookings; direct the user to contact support because a refund may be needed.

---

## 7. SSLCommerz payment gateway

### Prompt 7.1 - Replace Stripe with SSLCommerz

> Remove Stripe-related code and dependencies. Integrate SSLCommerz hosted checkout with sandbox support. When a normal user clicks `Continue to payment`, create checkout data containing store ID, store password, amount, BDT currency, unique transaction ID, backend success/fail/cancel/IPN URLs, product information, customer information, and the booking ID in a value field. Return `GatewayPageURL` to the frontend and open it in a popup, falling back to same-tab navigation if the popup is blocked.

### Prompt 7.2 - Securely validate payment callbacks

> Accept SSLCommerz success, fail, cancel, and IPN callbacks. Do not trust the browser callback alone. For successful payment, require callback status `VALID`, locate the booking by transaction ID, compare the callback amount with the booking amount, call SSLCommerz's validation API using `val_id`, verify the returned status, transaction ID, and amount, and only then mark payment `PAID`. Save the validation ID, clear payment expiry, count the coupon once, and change booking status to `AWAITING_APPROVAL`. Make callback processing idempotent so duplicate callbacks do not double-count coupons.

### Prompt 7.3 - Complete the payment and approval workflow

> After a verified payment, redirect to the deployed frontend with `status=success`; otherwise redirect with a clear failed status. Show an application page saying `Payment successful - waiting for approval from admin` or `Payment failed`. In the admin panel, show payment status separately from booking status. Allow the admin to confirm or reject only bookings that are both `PAID` and `AWAITING_APPROVAL`. A confirmed booking becomes `CONFIRMED`; a rejected one becomes `CANCELLED` and the interface reminds the admin to handle any required refund.

### Prompt 7.4 - Configure callback CORS correctly

> Keep ordinary API CORS restricted to the deployed frontend URL and credentials enabled. Create a separate CORS rule only for `/api/payments/sslcommerz/**` that accepts GET, POST, and OPTIONS from the hosted gateway without credentials. Continue validating payment server-to-server so permissive callback CORS does not determine payment trust.

---

## 8. Coupons, reviews, receipts, and contact tools

### Prompt 8.1 - Add coupon management

> Add percentage and fixed-amount coupon codes. Normalize codes to uppercase. Validate active state, expiry date, maximum usage, percentage not above 100, and discount lower than the booking total. Let users preview the discount before booking. Count coupon usage only after verified payment, and guard against duplicate callback counting. Give administrators list, create, update, activate/deactivate, and delete tools with confirmation dialogs and loaders.

### Prompt 8.2 - Add reviews

> Let users review only their own confirmed booking and only after its session has ended in Asia/Dhaka time. Allow one review per booking, validate ratings from one to five, and limit comment length. Provide public pitch review summaries with average rating and count, show ratings on landing-page pitch cards, and add a review modal to eligible dashboard bookings.

### Prompt 8.3 - Add booking search, filters, and receipts

> Add user-dashboard booking search and status filters. Add admin booking search plus separate booking-status and payment-status filters. Let a user open a clean receipt modal showing booking ID, customer, pitch, schedule, payment state, transaction reference, coupon discount, and total. Use print-specific CSS so `Print or save PDF` produces exactly one A4 receipt page and hides the rest of the application.

### Prompt 8.4 - Improve contact-message administration

> Save public contact-form submissions in MongoDB. Track each message as `NEW`, `READ`, or `RESOLVED`, preserve the original contact information and message, and let the admin add an internal note. Show an unread/new count in admin statistics. Add confirmation and a loader before marking a message resolved.

---

## 9. Spring AI and caching

### Prompt 9.1 - Add a simple Spring AI assistant

> Add a floating Turfly assistant that accepts questions up to 500 characters. When Spring AI and an OpenAI key are enabled, send a concise system prompt describing the venue, hours, supported questions, and the rule not to invent availability or payment status. If AI is disabled or the provider fails, return deterministic answers for location, hours, contact details, and booking instructions. The application must remain usable without an AI key.

### Prompt 9.2 - Add simple Spring caching

> Enable Spring Cache with Caffeine. Cache public pitch lists by sport, individual pitches by ID, and the admin statistics summary. Configure a maximum of 200 cached entries and five-minute expiry. Evict pitch caches after pitch create/update/delete, and evict admin-stat caches after booking-changing operations. Keep cache annotations visible and easy to explain.

---

## 10. Admin panel

### Prompt 10.1 - Build the complete administrator console

> Build a dark responsive admin console with tabs for Overview, Bookings, Pitches, Coupons, Messages, and Users. The overview should show pitches, all bookings, confirmed bookings, and new messages - not total players. Include recent bookings and a clear `Back to home page` action. Load admin data from REST endpoints. Every create, update, delete, approve, reject, and resolve operation must use application-styled confirmation UI where appropriate, disable controls during the request, show a loader, refresh live data, and report success or backend errors.

---

## 11. Error handling and reliability

### Prompt 11.1 - Add validation and consistent API errors

> Use Jakarta Bean Validation on all request DTOs. Create small custom exceptions for not found, conflict, forbidden, and bad request cases. Add a `@RestControllerAdvice` that converts exceptions into a consistent JSON object containing timestamp, HTTP status, error name, and message. Combine field-validation errors into a readable response. Log unexpected exceptions on the server but return a safe generic message to the client. Return a specific error when an uploaded image is larger than 8 MB.

### Prompt 11.2 - Make the frontend API helper reliable

> Create one frontend API helper that prefixes requests with `VITE_API_URL`, adds the saved JWT, automatically adds JSON content type except for `FormData`, handles network failures with a friendly message, reads JSON API errors, supports 204 responses, and returns JSON or text as appropriate. All forms and CRUD actions must catch and display its errors.

---

## 12. Testing

### Prompt 12.1 - Add focused backend unit tests

> Add JUnit 5, Mockito, AssertJ, and Spring Security tests for the important business rules. Include tests for:
>
> - JWT creation, subject extraction, expiry/user validation
> - SSLCommerz callback CORS versus normal API CORS
> - booking duration, price calculation, slot collisions, all twelve slots, seven-day calendar
> - admin booking bypass and normal paid-booking approval workflow
> - coupon percentage calculation, expiry rejection, and uppercase normalization
> - review ownership/timing rules
> - contact status and internal notes
> - account deletion with correct and incorrect password
> - registration account creation only after correct OTP
> - incorrect OTP rejection
> - registration email contains OTP and expiry
> - password-reset email uses the deployed frontend URL
> - Spring AI deterministic fallback
>
> Mock repositories and external services so tests are fast and never send real email, charge money, call SSLCommerz, or call OpenAI.

### Prompt 12.2 - Verify the complete build

> Run the Maven unit-test suite, Maven package build, Vite production build, and dependency audit. Fix compilation, validation, JSX, routing, and runtime errors. Confirm that the backend test total is 25 with zero failures and that Vite produces a production bundle. Check `git diff --check`, confirm no credentials are committed, and verify live health, CORS, OTP request, wrong-OTP rejection, forgot-password request, deployed UI strings, and payment result routes.

---

## 13. Deployment

### Prompt 13.1 - Prepare split frontend/backend deployment

> Deploy the React/Vite frontend to Vercel and the Spring Boot backend to Render. Configure `VITE_API_URL` with the Render API URL. Configure `FRONTEND_URL=https://turflyy.vercel.app` and `BACKEND_URL=<Render backend HTTPS URL>` on Render. Store MongoDB, JWT, SSLCommerz, Brevo, and optional OpenAI secrets as Render environment variables. Keep Vercel SPA rewrites enabled. Ensure the backend Docker build uses a Maven build stage and a Java 21 runtime stage.

### Prompt 13.2 - Verify production behavior

> After deployment, verify that:
>
> - `https://turflyy.vercel.app` serves the latest frontend
> - the Render health/API endpoints respond
> - browser CORS permits only the deployed frontend for normal APIs
> - SSLCommerz can POST to backend callbacks
> - payment callbacks redirect to the Vercel result page
> - reset emails contain the deployed Vercel URL, not localhost
> - Brevo accepts a registration OTP email request
> - an incorrect OTP is rejected without creating an account
> - admin data and pitch edits refresh correctly
>
> Push the final source to the GitHub `turfly` repository only after tests pass.

---

## 14. Documentation prompt

### Prompt 14.1 - Create a teacher-ready code explanation

> Create a beginner-friendly project explanation for Turfly that can be used in a viva or code review. Explain the architecture, request flow, database collections, security, JWT, OTP registration, Brevo emails, password reset, booking collision checks, coupons, SSLCommerz validation, admin approval, image upload, caching, Spring AI fallback, frontend state, loaders, dialogs, testing, and deployment. Include a file-by-file guide with exact line ranges and explain what every logical block does. Distinguish authored source files from generated bundles, package lockfiles, and binary image assets. Add common teacher questions with short answers and a practical demonstration sequence. Never include real passwords, API keys, tokens, or database credentials.

---

## 15. Final acceptance checklist prompt

### Prompt 15.1 - Audit the completed project

> Perform a final senior-developer audit of Turfly without changing its intended features. Confirm simple architecture, DTO validation, REST conventions, MongoDB queries, password hashing, hashed OTP/reset tokens, JWT authorization, role protection, CORS, secret handling, payment verification, idempotency, cache eviction, file upload validation, popup confirmation, duplicate-click prevention, accessible loading states, responsive design, single-page receipt printing, test coverage, Git cleanliness, and production configuration. Report any remaining classroom-project limitations honestly, such as local filesystem uploads on an ephemeral cloud instance or synchronized collision protection being designed for a single backend instance.

---

## Safe placeholder values for demonstrations

Use placeholders when showing configuration to a teacher:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/turfly
JWT_SECRET=<long-random-secret>
BREVO_API_KEY=<brevo-api-key>
BREVO_SENDER_EMAIL=<verified-sender@example.com>
SSLCOMMERZ_STORE_ID=<sandbox-store-id>
SSLCOMMERZ_STORE_PASSWORD=<sandbox-store-password>
OPENAI_API_KEY=<optional-openai-key>
FRONTEND_URL=https://turflyy.vercel.app
BACKEND_URL=https://<render-service>.onrender.com
VITE_API_URL=https://<render-service>.onrender.com
```

Never place the real values in slides, screenshots, reports, prompts, Git commits, or public repositories.
