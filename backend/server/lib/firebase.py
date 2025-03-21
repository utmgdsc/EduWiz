import os
import json
import pathlib
import firebase_admin


def get_certificate(cred_path: pathlib.Path) -> firebase_admin.credentials.Certificate:
    if not cred_path.exists():
        raise FileNotFoundError(
            f"Firebase credentials not found at {cred_path}. Place the service account key file there."
        )
    return firebase_admin.credentials.Certificate(cred_path)


def initialize_firebase():
    cred_path = pathlib.Path("firebase_creds.json")
    cred = get_certificate(cred_path)

    # Get project_id from credentials
    with open(cred_path) as f:
        cred_data = json.load(f)
        project_id = cred_data["project_id"]

    firebase_config = {"databaseURL": f"https://{project_id}.firebaseio.com"}

    # Connect to emulator if not in production
    if os.getenv("SERVER_ENV") != "production":
        with open("/app/firebase.json", "r") as f:
            firebase_local = json.load(f)

        emulator_host = (
            "host.docker.internal" if os.getenv("RUNNING_IN_DOCKER") else "localhost"
        )

        firebase_config["databaseURL"] = (
            f"http://{emulator_host}:{firebase_local['emulators']['database']['port']}?ns={project_id}"
        )

    firebase_admin.initialize_app(cred, firebase_config)
