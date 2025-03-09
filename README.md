# Prerequisites

  1. Install MongoDB Community Server 8 with default user
  2. Install NodeJS 22 with NPM

# Quick Start

  1. **OPTIONAL:** Configure the server port and MongoDB host variables in `.env` and `/src/frontend/src/app/environment.ts` files if necessary.
  2. Check [FontAwesome Icons](./docs/fontawesome-icons.md) to setup FontAwesome for the frontend icons to work.
  3. Create a Firebase project with Authentication enabled (Google as OAuth provider), then:
      1. Generate your web credentials (for the frontend)
      2. Create `src/frontend/.env` file and save your firebase config object (e.g. web credentials) as a stringified JSON as `NG_APP_FIREBASE_CONFIG`
      3. Alternatively, you can skip `.env` file and set `NG_APP_FIREBASE_CONFIG` as a system-wide environment variable (useful for when the app is running on a server)
  4. From the project root, run `npm run build` to build the frontend application.
  5. Run `npm start` to start the service on http://localhost:6002 (if configuration was not changed in step 1).

# Frontend Documentation

To build and serve Compodoc for the Angular project (frontend), run `npm run compodoc` from root directory and visit http://127.0.0.1:6060.