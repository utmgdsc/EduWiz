import os
import json
import pathlib
import logging
import firebase_admin

logger = logging.getLogger(__name__)


def initialize_firebase():
    cred_path = pathlib.Path("firebase_creds.json")
    if not cred_path.exists():
        raise FileNotFoundError(
            f"Firebase credentials not found at {cred_path}. Place the service account key file there."
        )

    cred = firebase_admin.credentials.Certificate(cred_path)

    # Get project_id from credentials
    with open(cred_path) as f:
        cred_data = json.load(f)

    firebase_config = {"databaseURL": cred_data["databaseURL"]}

    if os.getenv("SERVER_ENV") != "production":
        expected_variables = {
            "FIREBASE_AUTH_EMULATOR_HOST": "host.docker.internal:9099",
            "FIREBASE_DATABASE_EMULATOR_HOST": "host.docker.internal:9000",
            "FIRESTORE_EMULATOR_HOST": "host.docker.internal:8080",
        }

        for var, default in expected_variables.items():
            os.environ.setdefault(var, default)

        logger.info("Using EMULATOR Firebase services")
    else:
        logger.info("Using PRODUCTION Firebase services")

    firebase_admin.initialize_app(cred, firebase_config)
