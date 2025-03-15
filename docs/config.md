# Service Configuration Guide

The service is consisted of a NodeJS server and a frontend application, both of which need separate configuration.

# How To Configure The NodeJS Server

You may create a `.env` file at project root directory, or set individual environment variables by consolidating the following table:

| Variable | Required | Type | Default Value | Description |
|:---------|:--------:|:----:|:--------------|:------------|
| PORT | Yes | Number | | The port number to run the service on. |
| DEBUG_ROUTES | No | Boolean | false | Enables endpoint logging on NodeJS server. |
| HOST_FE | No | Boolean | false | Enables hosting the frontend application from `public` directory. |
| CORS_ORIGINS | No | String | | Enables CORS headers on the NodeJS server for a given comma-separated list of origins. |
| MONGODB_PROTOCOL | No | String | mongodb | MongoDB URL protocol/scheme (e.g. `mongodb` or `mongodb+srv`). |
| MONGODB_HOST | No | String | 127.0.0.1 | MongoDB host to connect to. |
| MONGODB_PORT | No | Number | | MongoDB port number to connect to. |
| MONGODB_DATABASE | Yes | String | | MongoDB database name to use. |
| MONGODB_USERNAME | No | String | | MongoDB username for authentication. |
| MONGODB_PASSWORD | No | String | | MongoDB password for authentication. |
| FIREBASE_SERVICE_ACCOUNT | Yes | String | | JSON string of the Firebase service account (for Admin SDK). |
| YOUTUBE_DATA_API_V3_TOKEN | No | String | | Token to use for enabling fetching YouTube link metadata via YouTube Data API v3. |

# How To Configure The Frontend Application

The frontend application loads its config using a similar method, but defines two environments: `local` and `prod`. You may only setup a single environment based on your needs while using the appropriate commands for building the frontend app (e.g. `npm run build:local` if only setting up the local environment), or just setup direct environment variables and skip both files (in which case both commands `npm run build` and `npm run build:local` work the same).

Create files `/src/frontend/.env.local` and `/src/frontend/.env.prod` with the following variables set (or set them as environment variables for singular environment setup):

| Variable | Required | Type | Default Value | Description |
|:---------|:--------:|:----:|:--------------|:------------|
| NG_APP_API_BASE_URL | Yes | String | | The base URL for all NodeJS API server endpoint calls (e.g. `http://localhost:6002/api`). |
| NG_APP_FIREBASE_CONFIG | Yes | String | | JSON string of the Firebase web app config. |