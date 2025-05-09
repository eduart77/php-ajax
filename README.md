# PHP AJAX News Service

This is a web application for managing and browsing news articles, built with PHP, PostgreSQL, and AJAX. The application allows users to register, log in, add, edit, and delete news articles, as well as filter and view news by date and category.

## Features
- User registration and login (with password hashing)
- News article CRUD (Create, Read, Update, Delete) operations
- AJAX-powered dynamic loading and filtering of news
- Filter news by date range and category
- Responsive and user-friendly interface
- Input validation and security against SQL injection
- Session-based authentication

## Technologies Used
- **PHP**: Server-side scripting language
- **PostgreSQL**: Relational database for storing users and news
- **AJAX (jQuery)**: Asynchronous requests for dynamic content loading
- **HTML/CSS**: Frontend structure and styling
- **pgAdmin**: Database management (for development)

## Setup Instructions

### Prerequisites
- PHP (with PostgreSQL extension enabled)
- PostgreSQL (with a database named `php`)
- pgAdmin (recommended for managing the database)
- Git (for version control)

### Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/php-ajax-news-service.git
   cd php-ajax-news-service
   ```
2. **Set up the database:**
   - Open `pgAdmin` and connect to your PostgreSQL server.
   - Create a database named `php`.
   - Run the SQL commands in `database.sql` to create the tables and triggers.
3. **Configure the database connection:**
   - Edit `config.php` and set your PostgreSQL username and password.
4. **Start the PHP server:**
   ```sh
   php -S localhost:8000
   ```
5. **Access the application:**
   - Open your browser and go to [http://localhost:8000](http://localhost:8000)

## Usage
- Register a new user or log in with an existing account.
- Add, edit, or delete news articles from the dashboard.
- Browse and filter news on the main page by date and category.
- Log out when finished.

## Security
- All database queries use parameterized statements to prevent SQL injection.
- Passwords are securely hashed before storage.
- User authentication is managed via PHP sessions.

## License
This project is for educational purposes. 