# URL Shortener Application

A modern URL shortening service built with Express.js, Drizzle ORM, and MySQL. This application allows users to create short, memorable links from long URLs with user authentication and profile management.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens and session management
- **URL Shortening**: Create short, unique codes for long URLs
- **URL Redirection**: Redirect from short codes to original URLs
- **User Profiles**: Manage user profile information and view created links
- **Password Security**: Passwords hashed using Argon2
- **Input Validation**: Server-side validation with Zod schema validation
- **Session Management**: Express session with flash messages for user feedback
- **Responsive UI**: EJS templating for dynamic frontend
- **Database Migrations**: Version-controlled database migrations with Drizzle Kit

## 📦 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL**: v8.0 or higher
- **.env file**: Environment variables configuration

## 🚀 Installation

### 1. Clone or Download the Repository

```bash
cd url-shortner-drizzle-orm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Development Dependencies

```bash
npm install --save-dev
```

## ⚙️ Configuration

### 1. Create `.env` File

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/url_shortener

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your_session_secret_key_here
```

### 2. Update Database Credentials

Update the `drizzle.config.js` file to match your MySQL configuration:

```javascript
dbCredentials: {
  url: process.env.DATABASE_URL,
}
```

## 🗄️ Database Setup

### 1. Generate Database Schema

```bash
npm run drizzle:generate
```

### 2. Push Schema to Database

```bash
npm run drizzle:push
```

Or migrate the database:

```bash
npm run drizzle:migrate
```

### 3. View Database in Drizzle Studio (Optional)

```bash
npm run drizzle:studio
```

This opens an interactive database management interface at `http://localhost:5173`

## 🎯 Running the Application

### Development Mode (with Hot Reload)

```bash
npm run dev
```

The application will start at `http://localhost:5000`

### Watch Mode

```bash
npm run satrt
```

### Production Mode

```bash
node app.js
```

## 📁 Project Structure

```
url-shortner-drizzle-orm/
├── app.js                          # Main application entry point
├── compose.yaml                    # Docker Compose configuration
├── dockerfile                      # Docker configuration
├── drizzle.config.js              # Drizzle ORM configuration
├── package.json                    # Project dependencies
├── config/
│   └── db-client.js               # Database client initialization
├── controller/
│   ├── auth.controller.js         # Authentication logic
│   └── post.controller.js         # URL shortening logic
├── drizzle/
│   ├── schema.js                  # Database schema definitions
│   └── migration/                 # Migration files
├── middlewares/
│   └── verify-auth.middlewaers.js # Authentication middleware
├── Register-user-schema/
│   ├── auth.validator.js          # Auth validation schemas
│   └── shortner.validator.js      # URL shortening validation schemas
├── routes/
│   ├── auth.routes.js             # Authentication routes
│   └── URL.routes.js              # URL shortening routes
├── service/
│   ├── auth.service.js            # Authentication business logic
│   └── shortnerdata.service.js    # URL shortening business logic
├── style/
│   └── style.css                  # Application styles
└── views/
    ├── index.ejs                  # Home page
    ├── header.ejs                 # Header component
    ├── footer.ejs                 # Footer component
    └── auth/
        ├── login.ejs              # Login page
        ├── register.ejs           # Registration page
        ├── profile.ejs            # User profile page
        └── edit-profile.ejs       # Edit profile page
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/register` | Display registration form | No |
| POST | `/register` | Create new user account | No |
| GET | `/login` | Display login form | No |
| POST | `/login` | Authenticate user and create session | No |
| GET | `/profile` | View user profile | Yes |
| GET | `/profile/edit` | Display profile edit form | Yes |
| POST | `/profile/edit` | Update user profile | Yes |
| POST | `/logout` | Logout user and destroy session | Yes |

### URL Shortening Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | Display home page with short URL form | No |
| POST | `/` | Create a new short URL | Yes |
| GET | `/:shortCode` | Redirect to original URL | No |

## 🔐 Authentication

### Registration Flow

1. User submits registration form with username, email, and password
2. Input validation with Zod schema
3. Password hashed with Argon2
4. User created in database
5. User redirected to login page

### Login Flow

1. User submits login credentials
2. Password verified against stored hash using Argon2
3. JWT token generated and stored in session
4. User session created with express-session
5. User redirected to dashboard/profile

### Protected Routes

Protected routes require:
- Valid JWT token in session
- Active session cookie
- User authentication middleware verification

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Short Links Table

```sql
CREATE TABLE short_link (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  short_code VARCHAR(255) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

### Relationships

- **One-to-Many**: One user can have multiple short links
- **Foreign Key**: `short_link.user_id` references `user.id`

## 🛠️ Development

### Available Scripts

```bash
# Development with Nodemon (auto-restart on changes)
npm run dev

# Watch mode (Node.js native watch)
npm run satrt

# Database management
npm run drizzle:generate  # Generate migrations
npm run drizzle:migrate   # Apply migrations
npm run drizzle:push      # Push schema to database
npm run drizzle:studio    # Open Drizzle Studio
```

### Technologies Used

- **Express.js**: Web framework
- **Drizzle ORM**: Database ORM
- **MySQL2**: MySQL driver
- **Argon2**: Password hashing
- **JWT**: Token authentication
- **Zod**: Schema validation
- **EJS**: Template engine
- **Express-Session**: Session management
- **Nodemon**: Development server

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t url-shortener:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Docker Environment Variables

Update `compose.yaml` with your environment variables before running.

## 📋 Validation Schemas

### User Registration Schema (`auth.validator.js`)

- Username: String, required, unique
- Email: Valid email format, required, unique
- Password: String, minimum length validation

### URL Shortener Schema (`shortner.validator.js`)

- URL: Valid URL format, required
- Short Code: Alphanumeric, unique, required

## 🔒 Security Features

- **Password Hashing**: Argon2 for secure password storage
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Session Security**: Secure session cookies
- **Input Validation**: Zod schema validation on all inputs
- **CSRF Protection**: Express middleware protection
- **Authentication Middleware**: Protected route verification

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `SESSION_SECRET` | Session encryption key | `your_secret_key` |

## 🐛 Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u root -p`
- Check `DATABASE_URL` format in `.env`
- Ensure database user has proper permissions
- Run migrations: `npm run drizzle:push`

### Authentication Issues

- Clear browser cookies and try again
- Check session configuration in `app.js`
- Verify JWT token generation in auth service
- Check middleware chain in `app.js`

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill existing process: `lsof -i :5000` (macOS/Linux)

## 📦 Production Deployment

### Prepare for Production

1. Set `NODE_ENV=production` in `.env`
2. Use a production database (managed MySQL service)
3. Configure secure session secret
4. Enable HTTPS/SSL
5. Set up reverse proxy (Nginx/Apache)
6. Configure logging and monitoring
7. Set up error tracking (Sentry, etc.)

### Recommended Hosting

- **AWS**: EC2 or ECS
- **DigitalOcean**: App Platform or Droplets
- **Heroku**: For quick deployment
- **Azure**: App Service
- **Railway**: Simple Node.js hosting

## 📚 API Usage Examples

### Create Short URL (POST)

```javascript
// Requires authentication
fetch('http://localhost:5000/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'url=https://example.com/very/long/url&shortCode=abc123',
  credentials: 'include'
})
```

### Redirect to Original URL (GET)

```javascript
// Public endpoint - no auth required
fetch('http://localhost:5000/abc123')
// Redirects to original URL
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use ES6+ modules
- Follow existing naming conventions
- Add comments for complex logic
- Test changes before submitting

## 📄 License

This project is licensed under the ISC License - see the `package.json` file for details.

## 📞 Support

For issues, questions, or suggestions:

1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce bugs
4. Provide environment details (OS, Node version, etc.)

## 🔄 Version History

- **1.0.0** (Current): Initial release with core functionality

## 📈 Roadmap

- [ ] OAuth2/Google Login integration
- [ ] Advanced analytics for shortened URLs
- [ ] Custom domain support
- [ ] QR code generation
- [ ] Link expiration feature
- [ ] Bulk URL import/export
- [ ] API key authentication for programmatic access
- [ ] Admin dashboard
- [ ] Rate limiting

---

**Last Updated**: January 2026

For the latest updates and documentation, visit the project repository.
