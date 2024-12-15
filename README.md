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
