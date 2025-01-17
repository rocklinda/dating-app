# Dating App

## Over View

The dating app is a mini project that allows users to swipe based on tier. It supports features like user authentication, swipe activities, daily swipe limits, and match creation. This service is built using [technologies used, e.g., NestJS, TypeORM, JWT].

## Features

- User authentication with JWT
- Swipes with daily limits for free users and unlimited for premium users
- Store user swipe activities and create matches
- Ability for users to upgrade to premium accounts

## Technologies Used

- **NestJS** - Framework for building the service
- **TypeORM** - ORM for interacting with the database
- **JWT** - Authentication mechanism

## Service Structure
The project is divided into the following modules:

1. Auth Module
Handles user authentication using JWT.

2. User Module
Manages user data and account upgrades (standard to premium).

3. Swipe Module
Handles user swipe activities (like/pass) and daily swipe limits.

4. Match Module
Handles the logic of creating a match when two users swipe right on each other.

---

## Installation

### Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **npm**: Comes with Node.js, but you can install it separately if needed.
- **[Other dependencies]**

### Steps to Install

1. Clone the repository:

    ```bash
    git clone git@github.com:rocklinda/dating-app.git
    cd dating-app
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables (create a `.env` file from .env.example file):

    Example `.env`:

    ```bash
    APP_NAME=DATING-APPS
    BASE_URL=your_base_url
    PORT=your_port
    DB_DATABASE=your_db_name
    DB_HOST=your_host
    DB_PASSWORD=your_db_password
    DB_PORT=your_db_port
    DB_USERNAME=myio
    JWT_SECRET=your_jwt_secret
    NODE_ENV=your_node_environment
    ```

---

## Running the Service

You can run the service once you've installed the dependencies and set up the environment variables.

### Development Mode

To run the application in development mode:

```bash
npm run start:dev
```
This will start the server on the port that you set in env, for example, `http://localhost:3000`

## Testing

### Running Unit Tests
To run the unit tests for the project:
```bash
npm run test
```

### Running End-to-End Tests
To run the end-to-end tests:
```bash
npm run test:e2e
```
---

## Linting and Formatting
This project uses ESLint and Prettier for code linting and formatting. The settings are configured to ensure consistent code style and automatically fix issues on save.

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": ["source.formatDocument", "source.fixAll.eslint", "source.organizeImports"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "prettier.printWidth": 120
}
```
When you save a file, these settings automatically format code and fix linting issues.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

