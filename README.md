# EduWiz

EduWiz is a comprehensive educational platform designed to generate, render, and deliver animated educational videos on demand. It combines the power of [Manim](https://www.manim.community/) for mathematical and scientific animations, a robust Python backend for orchestration and job management, and a modern Next.js/React frontend for an engaging user experience. EduWiz is built for scalability, modularity, and ease of development, making it suitable for both individual educators and large-scale educational platforms.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Detailed Component Overview](#detailed-component-overview)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Renderer](#renderer)
  - [Videos](#videos)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## System Architecture

```
+-------------------+        +-------------------+         +-------------------+
|   Frontend (Next) | <----> |   Backend (FastAPI)| <----> |   Manim Renderer  |
+-------------------+        +-------------------+         +-------------------+
         |                           |                             |
         |      Firebase (Auth, RTDB, Storage)                     |
         +---------------------------------------------------------+
```

- **Frontend:** User interface, authentication, video browsing, and learning modules.
- **Backend:** API endpoints, job management, Manim orchestration, and communication with Firebase.
- **Renderer:** Handles the actual video rendering using Manim, manages output, and logs.
- **Firebase:** Provides authentication, real-time database, and storage for user data and video assets.

---

## Project Structure

```
EduWiz/
├── backend/           # Python FastAPI backend, Manim integration, job management
│   ├── main.py        # FastAPI entrypoint
│   ├── manim_jobs/    # Manim job definitions and templates
│   ├── firebase/      # Firebase integration utilities
│   ├── api/           # API route definitions
│   └── requirements.txt
├── frontend/          # Next.js/React frontend, Three.js, UI components
│   ├── app/           # Next.js app directory (pages, layouts)
│   ├── components/    # React components (UI, Three.js scenes)
│   ├── public/        # Static assets
│   ├── styles/        # Tailwind CSS and global styles
│   └── tests/         # Frontend unit/integration tests
├── renderer/          # Rendering utilities, logs, and output management
│   ├── logs/          # Renderer logs
│   └── utils.py
├── videos/            # Output/generated videos (organized by user/job)
├── .env               # Root environment variables (if needed)
├── docker-compose.yml # Docker Compose for orchestrating services
├── README.md
└── contributing.md
```

---

## Detailed Component Overview

### Frontend

- **Framework:** Next.js (React, TypeScript)
- **UI:** Tailwind CSS, Headless UI, custom components
- **3D Graphics:** Three.js for animated backgrounds and interactive scenes
- **Authentication:** Firebase Auth (Google, email/password, etc.)
- **API Integration:** Communicates with backend via REST endpoints
- **Features:**
  - Search and discover educational topics
  - Request new animated videos
  - Watch and interact with generated videos
  - User profiles and progress tracking
  - Responsive design for desktop and mobile

#### Key Files

- `frontend/app/layout.tsx` - Main layout and global providers
- `frontend/components/ThreeScene.tsx` - 3D background/scene logic
- `frontend/components/VideoPlayer.tsx` - Custom video player
- `frontend/pages/api/` - API routes (if using Next.js API routes)
- `frontend/tests/` - Unit and integration tests

---

### Backend

- **Framework:** FastAPI (Python 3.10+)
- **Job Management:** Handles video generation requests, queues jobs, and tracks status
- **Manim Integration:** Dynamically generates Manim scripts based on user input or AI-generated content
- **Firebase Integration:** Reads/writes job status, user data, and video metadata to Firebase RTDB/Firestore
- **Storage:** Uploads rendered videos to Firebase Storage or local `videos/` directory
- **API Endpoints:**
  - `/api/generate` - Accepts video generation requests
  - `/api/status/{job_id}` - Returns status of a rendering job
  - `/api/videos/{user_id}` - Lists available videos for a user
  - `/api/auth` - Handles authentication (if not handled by frontend)
- **Extensibility:** Easily add new endpoints, Manim templates, or integrate with other AI models

#### Key Files

- `backend/main.py` - FastAPI entrypoint
- `backend/manim_jobs/` - Manim scene templates and job logic
- `backend/firebase/` - Firebase utility functions
- `backend/api/` - API route definitions
- `backend/requirements.txt` - Python dependencies

---

### Renderer

- **Purpose:** Handles the actual rendering of videos using Manim, manages output files, and logs rendering progress/errors.
- **Logging:** Detailed logs for each rendering job, including errors, warnings, and performance metrics.
- **Utilities:** Helper scripts for managing video files, cleaning up old jobs, and monitoring renderer health.

#### Key Files

- `renderer/utils.py` - Utility functions for rendering and file management
- `renderer/logs/` - Log files for each rendering job

---

### Videos

- **Directory:** `videos/`
- **Structure:** Organized by user ID and job ID for easy retrieval and management.
- **Contents:** Rendered video files (e.g., `.mp4`), thumbnails, and metadata.

---

## Getting Started

### Prerequisites

- **Node.js** (v18+): [Download](https://nodejs.org/)
- **npm** or **yarn**: [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/)
- **Python 3.10+**: [Download](https://www.python.org/)
- **Docker**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Firebase CLI**: [Install](https://firebase.google.com/docs/cli)
- **Manim**: Installed via `pip` in backend container/environment

### Environment Variables

#### Frontend

- Copy `frontend/.env.example` to `frontend/.env`
- Set the following variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_API_URL` (URL of your backend server)

#### Backend

- Copy `backend/.env.example` to `backend/.env`
- Set the following variables:
  - `FIREBASE_CREDENTIALS` (path to `firebase_creds.json`)
  - `FIREBASE_PROJECT_ID`
  - `SERVER_ENV` (e.g., `development` or `production`)
  - `VIDEO_OUTPUT_DIR` (e.g., `../videos`)
  - Any additional API keys or secrets

#### Firebase Credentials

- Download your Firebase service account JSON and place it as `backend/firebase_creds.json`
- When using emulators, override the `project_id` in the JSON to match the emulator project

---

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/utmgdsc/EduWiz.git
   cd EduWiz
   ```

2. **Install frontend dependencies:**
   ```sh
   cd frontend
   npm install
   ```

3. **Start Firebase emulators (for local dev):**
   ```sh
   firebase emulators:start
   ```
   - Ensure your `firebase_creds.json` uses the emulator project ID.

4. **Start backend (with Docker):**
   ```sh
   cd ..
   docker compose up
   ```
   - This will start the FastAPI backend and any supporting services (e.g., renderer, database).

   **Or run backend directly (for development):**
   ```sh
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. **Start frontend:**
   ```sh
   cd frontend
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Accessing the app:**
   - Register or log in using Firebase Auth.
   - Search for topics, request new videos, and view generated content.

---

## Testing

### Frontend

- **Unit and integration tests:** Located in `frontend/tests/`
- **Run tests:**
  ```sh
  cd frontend
  npm run test
  ```

### Backend

- **Python tests:** (Add as needed, e.g., with pytest)
- **Example:**
  ```sh
  cd backend
  pytest
  ```

---

## Deployment

### Docker Compose

- Use `docker-compose.yml` to orchestrate backend, renderer, and supporting services.
- Example:
  ```sh
  docker compose up --build -d
  ```

### Frontend

- Deploy as a static Next.js app (e.g., Vercel, Netlify) or on your own server.
- Set environment variables for production in your deployment platform.

### Backend

- Deploy FastAPI server on your preferred cloud provider (e.g., AWS, GCP, Azure, DigitalOcean).
- Ensure access to Firebase credentials and storage.

### Video Storage

- For production, use Firebase Storage or another cloud storage provider.
- For local development, videos are stored in the `videos/` directory.

---

## Troubleshooting

- **Docker issues:** Ensure Docker Desktop is running and you have sufficient resources allocated.
- **Firebase emulator errors:** Double-check your `firebase_creds.json` and project ID.
- **Manim rendering errors:** Check `renderer/logs/` for detailed error messages.
- **API connection issues:** Verify that backend and frontend environment variables are set correctly.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [Manim Community](https://www.manim.community/)
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Three.js](https://threejs.org/)
