# Wttj

## Requirements

- Elixir 1.17.2-otp-27
- Erlang 27.0.1
- Postgresql
- Nodejs 20.11.0
- Yarn

## Getting started

To start your Phoenix server:

- Run `mix setup` to install and setup dependencies
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`
- install assets and start front

```bash
cd assets
yarn
yarn dev
```

### tests

- backend: `mix test`
- front: `cd assets & yarn test`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

### Using Docker Compose

To set up the application using Docker Compose, follow these steps:

1. **Install Docker and Docker Compose**: see official documentation [Docker](https://docs.docker.com/compose/install/).

2. **Create the `.env` File**: Before starting the services, create a `.env` file in the root directory with the necessary environment variables as described in the next section.

3. **Start the Services**: Run the following command to build and start all services defined in the `compose.yaml` file:

   ```bash
   docker compose up -d
   ```

   > The `-d` flag runs the services in detached mode, allowing you to run other commands without stopping the containers.
   > You can use --build to force a build of the images before starting the containers

   This command will start the following services:

   - **api**:
     - Builds from the current directory (`.`).
     - Exposes port `4000` (mapped to `4000` on the host).
     - Depends on the `postgresql` service.
     - Uses environment variables from the `.env` file.
   - **front**:
     - Builds from the `./assets` directory.
     - Exposes port `80` (mapped to `5173` on the host).
     - Depends on the `api` service.
     - Uses environment variables from the `.env` file.
   - **postgresql**:
     - Uses the `postgres:17.2` image.
     - Exposes port `5432`.
     - Sets up environment variables for `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from the `.env` file.
     - Utilizes a Docker volume `postgres-data` for persistent storage.

4. **Verify Everything is Running**: Use the following command to check the status of the containers:

   ```bash
   docker compose ps
   ```

### Generating the `.env` File

The application requires a `.env` file containing environment variables for configuration. You can rely on the `.env.example` file in the root directory as a template.

```bash
cp .env.example .env
```

**Steps:**

1. **Generate `SECRET_KEY_BASE`**:

   - Run the following command to generate a secure secret key:

     ```bash
     mix phx.gen.secret
     ```

   - Copy the generated secret and replace `SECRET_KEY_BASE` with it in the `.env` file.

### Notes

- Ensure that the `.env` file is placed in the root directory so that Docker Compose and the services can access the environment variables.
- The `api` and `front` services both rely on the `.env` file for their configurations.

## Continuous Integration

The project utilizes GitHub Actions for Continuous Integration (CI) to automate the testing and building of both the Elixir backend and the React frontend.

### Elixir CI Workflow

The Elixir CI workflow ensures that the backend code is properly tested and meets the coding standards.

- **Triggers**: On push and pull request events targeting the `main` branch.
- **Environment**:
  - **OTP Version**: 27.2
  - **Elixir Version**: 1.17.3
- **Services**:
  - **PostgreSQL**: Sets up a PostgreSQL service for database integration tests.
- **Steps Overview**:

  ```mermaid
  graph TD
    A[Start] --> B[Checkout Repository]
    B --> C[Setup Elixir & Erlang]
    C --> D[Restore Dependencies Cache]
    D --> E[Restore Build Cache]
    E --> F[Install Dependencies]
    F --> G[Compile Project]
    G --> H[Check Formatting]
    H --> I[Run Tests]
    I --> J[Finish]
  ```

### React CI Workflow

The React CI workflow ensures that the frontend code is properly tested, formatted, and can be successfully built.

- **Triggers**: On push and pull request events targeting the `main` branch.
- **Environment**:
  - **Node.js Version**: 22.12.0
- **Steps Overview**:

  ```mermaid
  graph TD
    A[Start] --> B[Checkout Repository]
    B --> C[Setup Node.js]
    C --> D[Install Dependencies]
    D --> E[Check Formatting]
    E --> F[Lint Code]
    F --> G[Build Project]
    G --> H[Run Tests]
    H --> I[Finish]
  ```

---

## Learn more

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix
