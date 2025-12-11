# MoveMore - Fitness Tracking Application


## Description

MoveMore is a web-based fitness tracking application that allows users to log workouts, track progress, and search their exercise history. Built with Node.js, Express, EJS, and MySQL.

## Features

- User registration and authentication
- Secure password hashing with bcrypt
- Workout logging with multiple metrics (duration, distance, calories)
- Dashboard with real-time statistics
- Search functionality
- Responsive design

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)

### Steps

1. Clone the repository
```bash
git clone https://github.com/Aizunas/10_health_33791129.git
cd 10_health_33791129
```

2. Install dependencies
```bash
npm install
```

3. Create MySQL database user
```sql
CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON health.* TO 'health_app'@'localhost';
FLUSH PRIVILEGES;
```

4. Create database and populate data
```bash
mysql -u root -p < create_db.sql
mysql -u root -p < insert_test_data.sql
```

5. Configure environment variables
```bash
# .env file with default values
# Modify if using different database credentials
```

6. Start the application
```bash
node index.js
```

7. Access the application at `http://localhost:8000`

## Default Login Credentials

- **Username:** gold
- **Password:** smiths

## Test Account Registration

To test registration, use a password meeting these requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Example: `aaAA123!`

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Templating:** EJS
- **Authentication:** bcrypt, express-session
- **Environment Management:** dotenv

## Database Schema

## API Routes

- `GET /` - Home page
- `GET /about` - About page
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /register` - Registration page
- `POST /register` - Create new user
- `GET /dashboard` - User dashboard (protected)
- `GET /add-workout` - Add workout form (protected)
- `POST /add-workout` - Create workout (protected)
- `GET /search` - Search page (protected)
- `POST /search` - Search workouts (protected)
- `GET /logout` - Logout user

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- SQL injection prevention via parameterized queries
- Session-based authentication
- Protected routes with authentication middleware
- Password complexity validation
- XSS protection through EJS auto-escaping

## Known Limitations

- Single user sessions (no concurrent login handling)
- No password reset functionality
- Basic error handling (could be expanded)
- No email verification

## Future Enhancements

- Data visualization with charts
- Export workouts to CSV
- Workout categories and tags
- Goal setting and tracking
- Social features (sharing workouts)
- Mobile app version

## Author

Student ID: 33791129
Goldsmiths, University of London

