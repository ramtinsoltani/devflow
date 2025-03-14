# YouTube API Setup Guide

The [link metadata retrieval endpoint](./api.md#utility-endpoints) supports fetching the metadata of YouTube links via YouTube Data API v3. In order to enable this feature, follow these steps:
  1. Go to Google Cloud Platform and create a new project
  2. Under "APIs & Services" click on "Enable APIs and Services"
  3. Search for "YouTube Data API v3" and enable the API and generate a public access token (not OAuth)
  4. Set the token in the [NodeJS server config](./config.md#how-to-configure-the-nodejs-server) as `YOUTUBE_DATA_API_V3_TOKEN`