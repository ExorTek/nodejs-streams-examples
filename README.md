# Node.js Stream Examples

This project uses Yarn Workspaces to manage a monorepo containing both frontend and backend applications.

## Project Structure

```
nodejs-streams-examples/
├── backend/         # Backend workspace
├── frontend/        # Frontend workspace
└── package.json     # Root package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) (recommended latest LTS version)
- [Yarn](https://yarnpkg.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ExorTek/nodejs-streams-examples.git
cd nodejs-streams-examples
```

### 2. Install dependencies

From the root directory, run:

```bash
yarn
# or
yarn install
```

This command will install all dependencies for the root project and all workspaces (backend and frontend).

### 3. Development

To start both backend and frontend development servers simultaneously:

```bash
yarn dev
```

## Workspace Commands

### Root Workspace

| Command       | Description                                         |
|---------------|-----------------------------------------------------|
| `yarn dev`    | Start both backend and frontend in development mode |
| `yarn format` | Format code using Prettier                          |

### Backend Workspace

From the root directory:

```bash
yarn workspace backend [command]
```

Replace `[command]` with any script defined in the backend's package.json.

### Frontend Workspace

From the root directory:

```bash
yarn workspace frontend [command]
```

Replace `[command]` with any script defined in the frontend's package.json.

## Adding Dependencies

### Adding a dependency to a specific workspace

```bash
# Add a dependency to the backend
yarn workspace backend add [package-name]

# Add a development dependency to the backend
yarn workspace backend add [package-name] --dev

# Add a dependency to the frontend
yarn workspace frontend add [package-name]
```

### Adding a dependency to the root project

```bash
yarn add [package-name]
```

## Upgrading Dependencies

To upgrade a dependency in a specific workspace:

```bash
yarn workspace [workspace-name] up [package-name]
```

To upgrade all dependencies:

```bash
yarn up
```
