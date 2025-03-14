# Firebase Setup Guide

This service uses Firebase for implementing user authentication. Follow these steps in order to fully integrate Firebase with this service:
  1. Create a Firebase project
  2. Enable Google as an authentication provider (no other providers needed)
  3. Generate a service account credentials for the NodeJS server to use with the Firebase Admin SDK
  4. Set the service account credentials in JSON string format (one line) in the [NodeJS server config](./config.md#how-to-configure-the-nodejs-server) as `FIREBASE_SERVICE_ACCOUNT` variable
  5. Generate a web app configuration object for the JS Client SDK and set it in the [frontend config](./config.md#how-to-configure-the-frontend-application) as `NG_APP_FIREBASE_CONFIG` variable