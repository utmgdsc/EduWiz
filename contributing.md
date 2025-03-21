# Contributing to EduWiz

## Prerequisites

Before contributing to EduWiz, ensure you have the following tools installed on your system:

1. **Docker**  
   Docker is required to run the backend services. If you do not have Docker installed, you can download it from [Docker's official website](https://www.docker.com/products/docker-desktop).

2. **Firebase Emulators**  
   The Firebase emulators are necessary for local development. If you do not have them installed, follow the instructions on the [Firebase Emulator Suite documentation](https://firebase.google.com/docs/emulator-suite).

Please ensure these tools are properly installed and configured before proceeding with the setup steps below.
Thank you for your interest in contributing to EduWiz! Follow the steps below to set up the project for local development.

## Local Development Setup

## Additional Credentials and Configurations

To set up the project for local development, ensure you have the following credentials and configurations:

1. **Firebase Credentials**  
   Obtain the `firebase_creds.json` file, which contains the necessary Firebase secrets. Place this file in the appropriate directory as specified in the project documentation.

### Why Secrets Are Needed for Local Testing

Even when testing locally with Firebase emulators, certain secrets are still required due to namepsacing rules the emulator relies on and it is the expected behaviour of the firebase SDK.

### Additional Secrets and Environment Variables

To ensure the local development environment behaves as closely as possible to the production environment, configure the following secrets and environment variables in your `.env.local` file located in the frontend directory:

#### SeaweedFS Configuration

Set the following environment variables for SeaweedFS:

- `NEXT_PUBLIC_S3_ACCESS_ID`: Set this to `any`.
- `NEXT_PUBLIC_S3_SECRET_KEY`: Set this to `any`.
- `NEXT_PUBLIC_S3_REGION`: Set this to `us-east-1`.
- `NEXT_PUBLIC_S3_ENDPOINT`: Set this to the hosted endpoint of your SeaweedFS instance (e.g., `http://localhost:8333`).

#### Firebase Configuration

Populate the `.env.local` file with the required Firebase environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: The Firebase authentication domain.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: The Firebase project ID.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: The Firebase storage bucket.
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: The Firebase messaging sender ID.
- `NEXT_PUBLIC_FIREBASE_APP_ID`: The Firebase app ID.

#### API Configuration

Set the base URL for the API:

- `NEXT_PUBLIC_API_URL`: The base URL for the API.

By consolidating these secrets and configurations into the `.env.local` file, you ensure compatibility with Firebase emulators, SeaweedFS, and other services required for local development. Double-check that all values are correctly set before proceeding with the setup steps.

1. **Start Firebase Emulators**  
   Run the Firebase emulators locally using the following command:

   ```bash
   firebase emulators:start
   ```

   Ensure that you override the `project_id` in `firebase_creds.json` with the emulator-generated project ID.

2. **Configure Docker Compose**  
   Open the `docker-compose.yml` file and set the `SERVER_ENV` environment variable to `development` as shown below:

   ```yaml
   environment:
     SERVER_ENV: development
   ```

3. **Run the Backend Services**  
   Start the backend services using Docker Compose with the following command:

   ```bash
   docker compose up
   ```

4. **Start the Frontend Application**  
   Navigate to the frontend directory and start the development server using:
   ```bash
   npm run dev
   ```

Once these steps are completed, the project should be fully set up and running locally.
