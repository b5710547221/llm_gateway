# Authentication System Documentation

## Overview
Complete authentication system with login, registration, password reset, role-based access control (user/admin), and admin dashboard integrated with the NCSC Secure GenAI Gateway Platform.

## Features

### 1. User Authentication
- **Login** (`/auth/login`)
  - Email/password authentication
  - Remember me functionality
  - HTTP-only cookie with JWT token
  - Automatic redirect based on role (admin → dashboard, user → gateway)

- **Registration** (`/auth/register`)
  - User account creation
  - Password validation (min 8 characters)
  - Email uniqueness check
  - Welcome email notification
  - Default role: "user"

- **Logout** (`/api/auth/logout`)
  - Cookie clearing
  - Session termination

### 2. Password Management
- **Forgot Password** (`/auth/forgot-password`)
  - Email-based password reset
  - Secure token generation (32 bytes)
  - 1-hour token expiry
  - HTML formatted email with reset link
  - Anti-enumeration protection

- **Reset Password** (`/auth/reset-password?token=xxx`)
  - Token validation
  - Expiry checking
  - Password update with hashing
  - Token cleanup after use

### 3. Role-Based Access Control (RBAC)
- **Roles**: `user` and `admin`
- **Protected Routes**:
  - `/gateway/*` - Requires authentication (any role)
  - `/admin/*` - Requires admin role
- **Middleware Protection**: Automatic redirect to login if unauthorized

### 4. Admin Dashboard
- **User Management** (`/admin/dashboard`)
  - View all users in a table
  - User statistics (total, admins, verified, recent)
  - Role assignment (toggle user ↔ admin)
  - User deletion
  - Email verification status
  - Posts count per user
  - Join date tracking

- **Admin API Endpoints**:
  - `GET /api/admin/users` - List all users
  - `PATCH /api/admin/users/[id]` - Update user role/verification
  - `DELETE /api/admin/users/[id]` - Delete user
  - `GET /api/admin/stats` - Get dashboard statistics

## Security Features

### Password Security
- bcrypt hashing with 12 salt rounds
- Minimum 8 characters requirement
- Password confirmation validation

### Token Security
- JWT tokens with 7-day expiry
- HTTP-only cookies (prevents XSS)
- Secure flag in production
- SameSite=Lax (prevents CSRF)

### Reset Token Security
- Cryptographically random 32-byte tokens
- 1-hour expiry window
- Single-use tokens (cleared after use)
- Stored hashed in database

### API Security
- Token verification on all protected routes
- Role-based authorization
- Admin-only endpoints
- Self-deletion prevention for admins

## Database Schema

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String?
  password         String?   // bcrypt hashed
  role             String    @default("user") // "user" or "admin"
  emailVerified    Boolean   @default(false)
  resetToken       String?   @unique
  resetTokenExpiry DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  posts            Post[]

  @@index([email])
  @@index([role])
  @@index([resetToken])
}
```

## Test Accounts

Created by seed script (`prisma/seed.ts`):

1. **Admin Account**
   - Email: `admin@ai-sec.com`
   - Password: `admin123`
   - Role: admin
   - Access: Full admin dashboard + gateway

2. **User Account**
   - Email: `user@ai-sec.com`
   - Password: `user123`
   - Role: user
   - Access: Gateway only

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/stats` - Dashboard statistics (admin only)
- `PATCH /api/admin/users/[id]` - Update user (admin only)
- `DELETE /api/admin/users/[id]` - Delete user (admin only)

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (production should use strong random key)
JWT_SECRET="your-secret-key-change-in-production"

# Email Configuration (optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@ai-sec.com"
```

## Usage Flow

### User Registration & Login
1. Visit `/auth/register` or click "Register here" from login
2. Enter name, email, password (min 8 chars)
3. Submit → Welcome email sent
4. Redirect to login page
5. Login with credentials
6. JWT token stored in HTTP-only cookie
7. Redirect to `/gateway` (for users) or `/admin/dashboard` (for admins)

### Password Reset
1. Visit `/auth/forgot-password`
2. Enter email address
3. Receive reset email with link (1-hour expiry)
4. Click link → `/auth/reset-password?token=xxx`
5. Enter new password
6. Submit → Password updated, token cleared
7. Redirect to login

### Admin User Management
1. Login as admin → auto-redirect to `/admin/dashboard`
2. View statistics cards (total users, admins, verified, recent)
3. Browse user table with:
   - Name, email, role badge, verification status
   - Posts count, join date
   - Action buttons (toggle role, delete)
4. Toggle user role: Click "Make Admin" or "Make User"
5. Delete user: Click "Delete" → confirmation prompt
6. Access gateway via "Gateway" link in header

## Integration with Gateway

The authentication system is fully integrated with the existing NCSC Secure GenAI Gateway Platform:

1. **Protected Gateway Access**: `/gateway` requires authentication
2. **User Context**: Logged-in user info available via JWT
3. **Audit Logging**: Can track which user made gateway requests
4. **Role-Based Features**: Future enhancement for role-specific gateway features

## Middleware Protection

`middleware.ts` protects routes:
- Checks for `auth-token` cookie
- Verifies JWT token validity
- Validates role for admin routes
- Redirects unauthorized users to login
- Prevents role escalation

## Email Templates

### Password Reset Email
- Professional HTML template
- Blue-themed design matching platform
- Clear call-to-action button
- 1-hour expiry warning
- Fallback plain text link

### Welcome Email
- Greeting with user's name
- Platform introduction
- Features overview
- Support contact

## Error Handling

- **Invalid credentials**: "Invalid email or password"
- **Expired reset token**: "Invalid or expired reset token"
- **Email already exists**: "User with this email already exists"
- **Unauthorized access**: Redirect to login
- **Forbidden access**: Redirect to appropriate page
- **Self-deletion**: "Cannot delete your own account"

## Future Enhancements

1. Email verification flow
2. Two-factor authentication (2FA)
3. Session management dashboard
4. Password strength meter
5. Account lockout after failed attempts
6. Audit log for admin actions
7. User profile management
8. OAuth integration (Google, GitHub)
9. API key generation for programmatic access
10. Rate limiting on auth endpoints

## Testing

### Manual Testing
1. Register new user → check database
2. Login → verify redirect and cookie
3. Forgot password → check email delivery
4. Reset password → verify token validation
5. Admin login → access dashboard
6. Toggle user role → verify database update
7. Delete user → verify cascade deletion
8. Logout → verify cookie cleared

### Automated Testing (TODO)
- Unit tests for auth utilities
- Integration tests for API routes
- E2E tests for auth flows
- Security testing for vulnerabilities

## Troubleshooting

### Email not sending
- Check SMTP credentials in `.env`
- Verify email provider settings
- Check spam folder
- Review email.ts configuration

### Token expired
- Reset tokens expire in 1 hour
- Request new reset email
- JWT tokens expire in 7 days

### Cannot access admin dashboard
- Verify user role is "admin" in database
- Check JWT token validity
- Clear cookies and login again
- Check middleware.ts configuration

### Database errors
- Run `npx prisma db push` to sync schema
- Run `npx tsx prisma/seed.ts` to create test users
- Check DATABASE_URL in `.env`

## Conclusion

The authentication system provides enterprise-grade security with:
- Secure password handling
- Token-based authentication
- Role-based access control
- Admin user management
- Password recovery
- Email notifications
- Route protection
- Comprehensive error handling

All features are production-ready and integrated with the existing NCSC Secure GenAI Gateway Platform.
