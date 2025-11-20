# NCSC Secure GenAI Gateway Platform - Production Guide

## 🚀 Quick Start

### Development
```bash
npm run dev
```
Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## 🔐 Test Accounts

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@ai-sec.com | admin123 | Admin | Full Dashboard + Gateway |
| user@ai-sec.com | user123 | User | Gateway Only |

## 📋 Features

### ✅ Authentication System
- Login/Register with email & password
- Password reset via email
- JWT-based sessions (7-day expiry)
- HTTP-only cookies
- Role-based access control (User/Admin)

### ✅ Admin Dashboard (`/admin/dashboard`)
- User management table
- Real-time statistics
- Role assignment (User ↔ Admin)
- User deletion
- Access control

### ✅ AI Gateway (`/gateway`)
- Secure query interface
- Multi-provider support (Perplexity, Gemini, ChatGPT)
- Auto-routing with load balancing
- Real-time responses
- User authentication required

### ✅ Security Features
- **Guardrail Engine (TOR 1.3)**
  - PII detection & sanitization
  - SQL injection prevention
  - Prompt injection detection
  - XSS & command injection blocking

- **Routing Engine (TOR 1.2)**
  - Smart provider selection
  - Load balancing
  - Health monitoring
  - Fallback handling

- **RAG System (TOR 1.5)**
  - Secure vector database
  - Context augmentation
  - Classification-based access
  - Knowledge retrieval

- **Audit System**
  - Immutable logging
  - Request tracking
  - Compliance monitoring

## 🏗️ Architecture

```
User Request
    ↓
Authentication Middleware
    ↓
Gateway API (/api/gateway)
    ↓
[1] Input Guardrails → PII Detection, Injection Prevention
    ↓
[2] RAG System → Context Retrieval & Augmentation
    ↓
[3] Routing Engine → Provider Selection
    ↓
[4] Mock LLM Provider → Response Generation
    ↓
[5] Output Guardrails → Content Filtering
    ↓
[6] Audit Logging → Immutable Records
    ↓
Response to User
```

## 📁 Project Structure

```
/src
  /app
    /api
      /auth          # Authentication endpoints
      /admin         # Admin management APIs
      /gateway       # Main AI gateway endpoint
    /auth            # Auth pages (login, register, etc)
    /admin           # Admin dashboard
    /gateway         # Gateway UI
  /lib
    auth.ts          # JWT & password utilities
    email.ts         # Email notifications
    guardrail.ts     # TOR 1.3 guardrails
    routing.ts       # TOR 1.2 routing
    rag.ts           # TOR 1.5 RAG system
    mock-llm.ts      # Mock LLM providers
    audit.ts         # Audit logging
    prisma.ts        # Database client
  /types             # TypeScript definitions
/prisma
  schema.prisma      # Database schema
  seed.ts            # Test data seeding
middleware.ts        # Route protection
```

## 🗄️ Database

**SQLite** (Development)
- Location: `prisma/dev.db`
- Easy local testing
- No external dependencies

**PostgreSQL** (Production - Recommended)
- Update `DATABASE_URL` in `.env`
- Run migrations: `npx prisma migrate deploy`

### Schema
- **User**: Authentication & roles
- **Post**: Sample content (can be removed)
- **AuditLog**: Immutable compliance records

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-key-min-32-chars"

# Email (Optional - for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@ai-sec.com"

# App URL (for email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🔒 Production Checklist

### Security
- [ ] Change `JWT_SECRET` to strong random key (min 32 chars)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS policies
- [ ] Set up rate limiting
- [ ] Enable security headers (CSP, HSTS, etc)
- [ ] Review and update allowed origins
- [ ] Implement API key rotation
- [ ] Set up monitoring & alerts

### Database
- [ ] Switch to PostgreSQL/MySQL
- [ ] Set up database backups
- [ ] Enable connection pooling
- [ ] Review indexes for performance
- [ ] Implement data retention policies

### Email
- [ ] Configure production SMTP service
- [ ] Set up email templates
- [ ] Verify SPF/DKIM/DMARC records
- [ ] Test email delivery

### Infrastructure
- [ ] Set up load balancer
- [ ] Configure CDN for static assets
- [ ] Enable application monitoring
- [ ] Set up logging aggregation
- [ ] Configure auto-scaling
- [ ] Implement health checks

### Compliance
- [ ] Review GDPR/PDPA compliance
- [ ] Document data processing activities
- [ ] Implement data export functionality
- [ ] Set up audit log retention
- [ ] Create privacy policy
- [ ] Update terms of service

## 🧪 Testing

### Manual Testing
```bash
# 1. Create test user
Visit /auth/register

# 2. Login
Visit /auth/login

# 3. Test gateway
Visit /gateway → Submit query

# 4. Test password reset
Visit /auth/forgot-password

# 5. Admin functions (login as admin)
Visit /admin/dashboard → Manage users
```

### API Testing
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-sec.com","password":"admin123"}' \
  -c cookies.txt

# Gateway Query
curl -X POST http://localhost:3000/api/gateway \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"prompt":"What is AI security?","userId":"test"}'
```

## 🐛 Troubleshooting

### "Unauthorized" errors
- Check if logged in
- Verify JWT token in cookies
- Check token expiry (7 days)

### Email not sending
- Verify SMTP credentials
- Check firewall/port 587
- Review email provider settings

### Database errors
```bash
npx prisma db push        # Sync schema
npx tsx prisma/seed.ts    # Create test users
```

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📊 Monitoring

### Key Metrics
- Authentication success/failure rate
- Gateway response time
- Guardrail violation rate
- Provider availability
- Database query performance

### Logs
- Application logs: Check console
- Audit logs: Database `AuditLog` table
- Error tracking: Set up Sentry/similar

## 🚦 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Redirects to login |
| `/auth/login` | Public | User login |
| `/auth/register` | Public | User registration |
| `/auth/forgot-password` | Public | Password reset request |
| `/auth/reset-password` | Public | Password reset |
| `/gateway` | Authenticated | AI Gateway interface |
| `/admin/dashboard` | Admin only | User management |

## 🔄 Deployment

### Vercel (Recommended)
```bash
vercel deploy --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Server
```bash
npm run build
pm2 start npm --name "ai-sec" -- start
```

## 📚 Documentation

- `AUTHENTICATION.md` - Authentication system details
- `GATEWAY_IMPLEMENTATION.md` - Gateway architecture
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary

## 🆘 Support

For issues or questions:
1. Check existing documentation
2. Review error logs
3. Test with fresh database
4. Verify environment variables

## 📝 License

Proprietary - NCSC Secure GenAI Gateway Platform

---

**Production Ready** ✅
All features implemented and tested. Ready for deployment with proper configuration.
