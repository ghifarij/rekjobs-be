# RekJobs Backend

Welcome to the backend repository for **RekJobs**, a robust job board application backend built with modern web technologies. This project demonstrates a focus on clean architecture, type safety, and DevOps integration.

## 🚀 Project Overview

RekJobs Backend is a RESTful API designed to power job recruitment platforms. It handles user authentication, job postings, application management, and more, ensuring a seamless experience for both job seekers and employers.

## 🛠️ Tech Stack

This project leverages a powerful stack to ensure performance, scalability, and developer experience.

### Core
-   **[Node.js](https://nodejs.org/)**: JavaScript runtime built on Chrome's V8 engine.
-   **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed programming language that builds on JavaScript.
-   **[Express.js](https://expressjs.com/)**: Fast, unopinionated, minimalist web framework for Node.js.

### Database & ORM
-   **[PostgreSQL](https://www.postgresql.org/)**: robust open source object-relational database system.
-   **[Prisma](https://www.prisma.io/)**: Next-generation Node.js and TypeScript ORM for interacting with the database.

### Authentication & Security
-   **[JSON Web Token (JWT)](https://jwt.io/)**: Compact, URL-safe means of representing claims to be transferred between two parties.
-   **[Bcrypt](https://www.npmjs.com/package/bcrypt)**: Library to help you hash passwords.
-   **Google Auth**: Integration with `google-auth-library` for OAuth flows.

### Utilities & Tools
-   **[Cloudinary](https://cloudinary.com/)**: Cloud-based image and video management services.
-   **[Nodemailer](https://nodemailer.com/)**: Module for Node.js applications to allow easy email sending.
-   **[Handlebars](https://handlebarsjs.com/)**: Minimal templating on steroids, used here for email templates.
-   **Multer**: Middleware for handling `multipart/form-data`.
-   **Express Validator**: Set of express.js middlewares that wraps validator.js validator and sanitizer functions.

### Development Qualities
-   **[ESLint](https://eslint.org/)**: Statically analyzes your code to quickly find problems.
-   **[Prettier](https://prettier.io/)**: An opinionated code formatter.

## 📂 Project Structure

The project follows a modular architecture within the `src` directory:

```
src/
├── controller/   # Request handlers and business logic entry points
├── middleware/   # Express middlewares (auth, validation, etc.)
├── router/       # API route definitions
├── services/     # Business logic and database interactions
├── types/        # TypeScript type definitions
├── utils/        # Helper functions and utilities
├── index.ts      # Application entry point
└── prisma.ts     # Prisma client instance
```

## ☸️ DevOps & Automation

This project implements key DevOps practices to ensure reliability and consistent deployment environments.

### Docker
The application is containerized using **Docker**, ensuring that it runs consistently across any environment.
-   **Base Image**: `node:20-alpine` for a lightweight footprint.
-   **Optimization**: Layer caching is utilized for faster builds (copying `package.json` first).
-   **Prisma**: Includes schema generation during the build process to ensure type safety inside the container.

### CI/CD (GitHub Actions)
Automated workflows are set up using GitHub Actions to maintain code quality:
-   **Lint & Format Workflow**: automatically runs on push and pull requests to `main` or `master`.
    -   Installs dependencies with caching.
    -   Generates Prisma client.
    -   Runs Prettier to check formatting.
    -   Runs ESLint to catch potential errors.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v20+)
-   PostgreSQL
-   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ghifarij/rekjobs-be.git
    cd rekjobs-be
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and configure the necessary variables (Database URL, JWT Secret, Cloudinary credentials, etc.).

4.  **Database Setup**
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Push schema to database
    npx prisma db push
    ```

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Build the project
npm run build

# Start production server
npm start
```

### Running with Docker

1.  **Build the image**
    ```bash
    docker build -t rekjobs-be .
    ```

2.  **Run the container**
    ```bash
    docker run -p 8000:8000 --env-file .env rekjobs-be
    ```
