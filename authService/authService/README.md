# Auth Service (AUTHSERVICE)

Production-ready Authentication Microservice for the **Google Drive Clone**.
Provides **JWT (email + password)** and **Google OAuth2** authentication with role-based authorization
(`USER` / `ADMIN`), refresh-token rotation, token blacklisting and Eureka service discovery.

| Attribute   | Value                          |
|-------------|--------------------------------|
| Java        | 24                             |
| Spring Boot | 4.1.0                          |
| Spring Cloud| 2025.1.2 (Oakwood)            |
| Spring Security | 7.1.0 (bundled with Boot 4.1) |
| Build       | Maven                          |
| Database    | PostgreSQL (`drive_db`)        |
| Port        | `8085`                         |
| Service name| `AUTHSERVICE`                  |
| Config file | `application.properties`       |

---

## 1. Requirements

- JDK 24
- Maven 3.9+
- PostgreSQL running with database `drive_db`
- Eureka server running at `http://localhost:8761`
- Google OAuth2 credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## 2. Setup

### 2.1 Database

```sql
CREATE DATABASE drive_db;
```

Update `spring.datasource.username` / `spring.datasource.password` in
`src/main/resources/application.properties` to match your PostgreSQL instance.

### 2.2 Google OAuth2

1. Create an OAuth2 Client ID in Google Cloud Console.
2. Add an authorized redirect URI:
   `http://localhost:8085/login/oauth2/code/google`
3. Fill in the credentials in `application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

> The placeholders must be replaced — non-empty credentials are required for the
> application to start (Spring Security refuses to boot with a blank OAuth2 registration).

### 2.3 Run

```bash
mvn clean package
mvn spring-boot:run
```

Or run the built jar:

```bash
java -jar target/auth-service-1.0.0.jar
```

> Note: the service starts even if Eureka is offline (registration retries in the
> background). The JWT secret in `app.jwt.secret` must be changed in production.

---

## 3. Folder Structure

```
src/main/java/com/ck/authService
├── config        SecurityConfig, CorsConfig, OpenApiConfig, JwtProperties, AppProperties
├── security      CustomUserDetailsService, UserPrincipal, RestAuthenticationEntryPoint,
│                 RestAccessDeniedHandler, SecurityUtils
├── jwt           JwtService (token creation / parsing / validation)
├── oauth         CustomOAuth2UserService, OAuth2UserPrincipal, OAuth2 success/failure handlers
├── filter        JwtAuthenticationFilter (OncePerRequestFilter)
├── controller    AuthController, OAuth2Controller, AdminController
├── service       AuthService, TokenService, RefreshTokenService (interfaces)
├── service/impl  AuthServiceImpl, TokenServiceImpl, RefreshTokenServiceImpl
├── repository    UserRepository, RefreshTokenRepository
├── entity        User, RefreshToken, Role, Provider
├── dto           TokenPair (internal service DTO)
├── request       RegisterRequest, LoginRequest, RefreshRequest
├── response      AuthResponse, UserResponse, GoogleUserResponse, ApiResponse
├── mapper        UserMapper
├── exception     GlobalExceptionHandler + domain exceptions
├── util          CookieUtils
└── client        UserServiceClient (inter-service communication)
```

---

## 4. API Reference

Base URL: `http://localhost:8085`
Swagger UI: `http://localhost:8085/swagger-ui.html`
OpenAPI JSON: `http://localhost:8085/v3/api-docs`

### Unified response envelope

```json
{
  "timestamp": 1722600000000,
  "success": true,
  "message": "Login successful",
  "data": { }
}
```

### 4.1 `POST /api/auth/register`

Body:

```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

Returns `201 Created` with an `AuthResponse` (access + refresh token + user).

| Error case       | Status | Message                              |
|------------------|--------|--------------------------------------|
| Duplicate email  | 409    | An account with email ... exists     |
| Validation error | 400    | Validation failed (field map)        |

### 4.2 `POST /api/auth/login`

Body:

```json
{ "email": "john@example.com", "password": "secret123" }
```

Returns `200 OK` with an `AuthResponse`.

| Error case | Status | Message |
|------------|--------|---------|
| Bad credentials | 401 | Invalid email or password |
| Google-only account | 401 | This account was created using GOOGLE... |

### 4.3 `POST /api/auth/refresh`

Body:

```json
{ "refreshToken": "<refresh-jwt>" }
```

Performs **token rotation**: the old refresh token is revoked and a new access + refresh
pair is issued.

| Error case           | Status | Message |
|----------------------|--------|---------|
| Unknown/revoked token| 401    | Refresh token not found / revoked |
| Expired token        | 401    | Refresh token has expired        |

### 4.4 `POST /api/auth/logout`

Body (optional): `{ "refreshToken": "<refresh-jwt>" }` — or send the refresh token as a
`Bearer` token in the `Authorization` header. Revokes (blacklists) the refresh token.

### 4.5 `GET /api/auth/me`

Requires `Authorization: Bearer <access-token>`. Returns the current user.

### 4.6 `GET /api/auth/google`

Redirects (302) to `/oauth2/authorization/google` to start Google sign-in.

### 4.7 `GET /oauth2/success` and `GET /oauth2/failure`

Informational endpoints used after the Google OAuth2 callback.

### 4.8 Google OAuth2 flow

1. Frontend navigates to `GET /api/auth/google` (or `/oauth2/authorization/google`).
2. User authenticates with Google.
3. Google redirects to `http://localhost:8085/login/oauth2/code/google`.
4. `CustomOAuth2UserService` creates the user on first login or loads the returning user.
5. `OAuth2AuthenticationSuccessHandler` generates a JWT pair, persists the refresh token,
   and redirects to `app.oauth2.redirect-uri` with:

```
http://localhost:5173/oauth2/redirect?token=<access-token>&refreshToken=<refresh-token>&expiresIn=<ms>
```

6. A user already registered with email + password (provider `LOCAL`) cannot sign in with
   Google using the same email (`OAuth2AuthenticationProcessingException` is returned).

### 4.9 Admin endpoint

`GET /api/admin/users` — lists all users. Requires `ROLE_ADMIN`.

---

## 5. JWT Configuration

| Property | Default | Meaning |
|----------|---------|---------|
| `app.jwt.secret` | (64-byte key) | HMAC-SHA signing key, must be >= 32 bytes |
| `app.jwt.access-token-expiration` | `900000` | Access token TTL in ms (15 min) |
| `app.jwt.refresh-token-expiration` | `604800000` | Refresh token TTL in ms (7 days) |
| `app.jwt.issuer` | `AUTHSERVICE` | JWT `iss` claim |

Refresh tokens are additionally persisted in the `refresh_tokens` table with an expiry date
and a `revoked` flag. On refresh, the presented token is validated, revoked, and replaced
with a brand-new pair (rotation).

---

## 6. Security

- `SessionCreationPolicy.STATELESS`
- `BCryptPasswordEncoder` for local passwords
- `JwtAuthenticationFilter` extracts `Authorization: Bearer <token>` and populates the
  `SecurityContext`
- `RestAuthenticationEntryPoint` -> `401` JSON on unauthenticated access
- `RestAccessDeniedHandler` -> `403` JSON on insufficient permissions
- Public paths: `/api/auth/**`, `/oauth2/**`, `/login/**`, `/actuator/**`, swagger paths
- Everything else is authenticated
- `@EnableMethodSecurity` enables `@PreAuthorize("hasRole('ADMIN')")` and friends

---

## 7. Service Discovery & Gateway Integration

- Registers to Eureka as `AUTHSERVICE` (`spring.application.name=AUTHSERVICE`).
- The API Gateway (`localhost:8080`) forwards requests to the auth service and
  downstream microservices validate the same JWT signature (`app.jwt.secret`), so they
  trust the Authentication Service.

---

## 8. Testing

```bash
mvn test
```

- `AuthServiceApplicationTests` boots the full Spring context (in-memory H2 + Eureka disabled).
- `JwtServiceTest` verifies token generation, parsing and validation.

---

## 9. Production Checklist

- [ ] Replace `app.jwt.secret` with a securely generated key.
- [ ] Add real Google OAuth2 `client-id` / `client-secret`.
- [ ] Set PostgreSQL username/password to the real values.
- [ ] Use `spring.jpa.hibernate.ddl-auto=validate` and manage schema with migrations (Flyway/Liquibase).
- [ ] Enable HTTPS and set `CookieUtils` to secure-only if cookies are used.
- [ ] Keep the Spring Security warning about `AuthenticationProvider` benign or silence it by
      raising `logging.level.org.springframework.security.config.annotation.authentication.configuration.InitializeUserDetailsBeanManagerConfigurer=ERROR`.
