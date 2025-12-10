# FitTrack - Fitness Tracking Application

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create MySQL database user:
```sql
CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON health.* TO 'health_app'@'localhost';
FLUSH PRIVILEGES;
```

3. Create database and tables:
```bash
mysql -u root -p < create_db.sql
mysql -u root -p < insert_test_data.sql
```

4. Start the application:
```bash
node index.js
```

5. Visit 

## Default Login
- Username: gold
- Password: smiths

## Features
- User registration and authentication
- Workout logging with multiple metrics
- Dashboard with statistics
- Search functionality
- Responsive design