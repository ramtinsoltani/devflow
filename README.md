# Prerequisites

  1. NodeJS 22+ with NPM installed
  2. MongoDB Community Server 8 installed with default user or a MongoDB Atlas account ready for [setup](./docs/mongodb.md)
  3. A Firebase project ready for [setup](./docs/firebase.md)
  4. FontAwesome pro license or free icon replacements in mind (refer to [FontAwesome Icons Reference Sheet](./docs/fontawesome-icons.md))
  5. **Optional:** A YouTube Data API v3 token ready for use (refer to [YouTube API Setup Guide](./docs/youtube-api.md) for more details)

# Service Setup Guide

  1. Read the [Service Configuration Guide](./docs/config.md)
  2. Setup a local MongoDB installation or MongoDB Atlas account by following the [MongoDB Setup Guide](./docs/mongodb.md)
  3. Setup Firebase authentication by following the [Firebase Setup Guide](./docs/firebase.md)
  4. The frontend application uses FontAwesome icons (both free and pro versions) and does not contain the SVG files on the repo. Refer to [FontAwesome Icons Reference Sheet](./docs/fontawesome-icons.md) and import your icons in the frontend application.
  5. The service supports fetching metadata for YouTube links via YouTube Data API v3 and requires an API token. If this feature is desired, follow [YouTube API Setup Guide](./docs/youtube-api.md) to obtain and setup the token.

# Running The Service

  1. Build the frontend application by running one of the following commands at project root:
    - Production environment: `npm run build`
    - Local environment: `npm run build:local`
  2. Start the server by running `npm start` at project root

# Additional Commands

  - Build and server frontend documentation: `npm run compodoc`
  - Run the service in inspection mode: `npm run inspect`

# Additional Documentation

  - [API Server Documentation](./docs/api.md)
  - [FontAwesome Icons Reference Sheet](./docs/fontawesome-icons.md)