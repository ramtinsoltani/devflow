# MongoDB Setup Guide

This service uses MongoDB as its database solution. To setup MongoDB, you may either:
  - Install MongoDB Community Server 8 locally
  - Create a MongoDB Atlas account

Once done, you will need to configure the following variables in the [NodeJS server configuration](./config.md#how-to-configure-the-nodejs-server):
  - `MONGODB_PROTOCOL`
  - `MONGODB_HOST`
  - `MONGODB_PORT`
  - `MONGODB_DATABASE`
  - `MONGODB_USERNAME` (required for MongoDB Atlas, optional for local installation based on authentication settings)
  - `MONGODB_PASSWORD` (required for MongoDB Atlas, optional for local installation based on authentication settings)

> If MongoDB Atlas is chosen, make sure you whitelist your IP in your dashboard settings.