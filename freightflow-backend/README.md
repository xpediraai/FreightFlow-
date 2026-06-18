# FreightFlow Backend

FreightFlow is a premium logistics and freight management system. This file houses the backend service, built on Node.js using Express and Sequelize ORM connecting to PostgreSQL.

---

## 📅 Development Progress Log

### June 17, 2026
* **Project Setup**: Initialized Node.js, package configurations, and project directory structure.
* **Security & Middleware Integration**: Configured Express with `cors`, `helmet`, `cookie-parser`, and `morgan` HTTP request loggers.
* **Logging System**: Created a custom `loggerService` to pipe server traffic and logs into a persistent, git-ignored `logs/request.txt` file using Morgan streams.
* **Production Documentation**: Documented Express server bootstrap processes and PostgreSQL database connection setup with JSDoc headers.

### June 18, 2026
* **Database Model Base Architecture**: Designed and implemented `BaseModel.js` containing standardized columns (`id`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`, `is_deleted`) for reuse across all database models (User, Company, Role, etc.).
* **Model Registry setup**: Established central database registration in `src/database/index.js` for future model migrations, relationships, and queries.
* **Audit System JSDoc**: Fully documented the BaseModel audit strategy and database configurations with JSDoc block comments.

---

## 🛠️ Tech Stack & Dependencies

The following packages are installed and configured in the project:

### Production Dependencies
| Package | Version | Purpose & Usage in FreightFlow |
| :--- | :---: | :--- |
| **[express](https://expressjs.com/)** | `^5.2.1` | The core web framework utilized for building the RESTful API endpoints and handling routing. |
| **[sequelize](https://sequelize.org/)** | `^6.37.8` | Promise-based Node.js ORM to manage interactions, models, and relationships with the PostgreSQL database. |
| **[pg](https://node-postgres.com/)** | `^8.21.0` | Non-blocking PostgreSQL client driver for Node.js used by Sequelize under the hood. |
| **[helmet](https://helmetjs.github.io/)** | `^8.2.0` | Secures the Express server by automatically configuring essential HTTP headers (helps prevent XSS, clickjacking, etc.). |
| **[cors](https://github.com/expressjs/cors)** | `^2.8.6` | Configures Cross-Origin Resource Sharing, allowing frontend applications to interact with backend endpoints. |
| **[cookie-parser](https://github.com/expressjs/cookie-parser)** | `^1.4.7` | Parses cookie headers and populates `req.cookies` to handle session management or refresh token validation. |
| **[dotenv](https://github.com/motdotla/dotenv)** | `^17.4.2` | Loads application configuration settings and secret keys from a local `.env` file into `process.env`. |
| **[morgan](https://github.com/expressjs/morgan)** | `^1.11.0` | HTTP request logger middleware used to capture incoming HTTP traffic details. |
| **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** | `^9.0.3` | Facilitates secure authentication and authorization through access and refresh token creation and verification. |
| **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** | `^6.0.0` | Secure cryptographic library used to hash and verify user passwords before database storage. |
| **[joi](https://joi.dev/)** | `^18.2.2` | Object schema validation library used to validate client request payloads (inputs, query parameters) before controller execution. |
| **[uuid](https://github.com/uuidjs/uuid)** | `^14.0.0` | Generates RFC4122 UUIDs for primary keys or secure transaction identifiers. |
| **[nodemon](https://nodemon.io/)** | `^3.1.14` | Monitor script that automatically restarts the Node.js application when source code changes are detected. |

### Development Dependencies
| Package | Version | Purpose & Usage in FreightFlow |
| :--- | :---: | :--- |
| **[sequelize-cli](https://github.com/sequelize/cli)** | `^6.6.5` | Command line utility used for database migrations, seeders, and structural synchronization. |

---

## 📂 Project Structure

```bash
freightflow-backend/
├── logs/                   # System runtime logs (e.g. request.txt) [git-ignored]
├── src/
│   ├── config/             # Database and ORM client initialization configurations
│   │   ├── database.js     # Sequelize instance and pool setup
│   │   └── dbConnection.js # Database authentication lifecycle check
│   ├── database/           # Database schema migrations, seeders, and models
│   │   ├── index.js        # Central database and model registry entry point
│   │   ├── migrations/     # Database migration scripts [Sequelize]
│   │   ├── models/         # Model definitions (e.g., BaseModel.js)
│   │   └── seeders/        # Database seed data scripts
│   ├── middlewares/        # Express application custom middlewares (Auth, validation, error handlers)
│   ├── modules/            # Domain modules (controllers, models, validation schemas)
│   ├── routes/             # App route mapping
│   ├── services/           # Reusable services and utilities
│   │   └── loggerService.js# Helper class to log messages directly to file streams
│   ├── app.js              # Express app instantiation and middleware registration
│   └── index.js            # Server entry point (starts server and binds port listener)
├── .env                    # Local environment secrets and parameters [git-ignored]
├── .gitignore              # Files and directories ignored by version control
├── package.json            # npm package dependencies and run scripts
└── README.md               # Project development tracking and documentation
```

---

## 🚀 Key Systems Implemented

### 1. Database Connection Configuration
The backend connects to a PostgreSQL database using Sequelize ORM.
* Configured in `src/config/database.js` using connection pooling parameters (`max: 10`, `min: 0`, `acquire: 30000ms`, `idle: 10000ms`) to optimize resource usage in production.
* Connectivity is tested asynchronously at startup in `src/config/dbConnection.js`. If connection authentication fails, the process is safely terminated.

### 2. Request Logging & File Output
To record application requests without bloating terminal runtime performance:
* We integrated **Morgan** in `src/app.js` with a custom stream (`requestLogStream`) pointing to the helper function `writeLogToFile` in `src/services/loggerService.js`.
* Standard formatting used: `[:timestamp] :method :url :status :response-time ms - :res[content-length]`.
* Output file is maintained at `logs/request.txt` (which is git-ignored).

### 3. Reusable BaseModel (Database Audit & Soft Delete System)
To enforce consistent database audit fields and adhere to DRY (Don't Repeat Yourself) principles across all database tables:
* We implemented `src/database/models/BaseModel.js` which contains standard audit, tracking, and soft delete fields.
* Instead of defining these columns manually 50+ times for models like `Company`, `User`, `Role`, `Permission`, `Customer`, `Job`, `Invoice`, etc., they spread/inherit `BaseModel`:
  * `id`: Unique primary key (UUID v4) for standardized identifiers across components.
  * `created_by`: UUID identifying the user who created the record.
  * `updated_by`: UUID identifying the user who last modified the record.
  * `deleted_by`: UUID identifying the user who soft-deleted the record.
  * `deleted_at`: Timestamp recording when the record was soft-deleted.
  * `is_deleted`: Boolean flag indicating soft-delete status (ensuring records are not permanently purged from database tables unless specified).

---

## ⚙️ How to Setup and Run

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL database instance running locally or hosted

### Installation
1. Clone the project and navigate to the backend root directory:
   ```bash
   cd freightflow-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment configuration:
   Create a `.env` file in the root backend directory:
   ```env
   # Server Port
   PORT=5000

   # Database Credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=freightflow
   DB_USER=postgres
   DB_PASSWORD=your_password_here

   # Token Configuration
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ACCESS_TOKEN_EXPIRES=15m
   REFRESH_TOKEN_EXPIRES=30d
   ```
4. Start the application:
   * **Development Mode (Auto-reload)**:
     ```bash
     npm run dev
     ```
   * **Production Mode**:
     ```bash
     npm start
     ```
