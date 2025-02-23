import os
import json
import logging
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

logger = logging.getLogger(__name__)


def get_firebase_app():
    if not firebase_admin._apps:
        cred = credentials.Certificate(os.getenv("FIREBASE_ADMIN_CREDENTIALS_PATH"))

        config = {"databaseURL": os.getenv("FIREBASE_DATABASE_URL")}

        # if not in production use emulator
        if os.getenv("NODE_ENV") != "production":
            try:
                with open("firebase.json", "r") as f:
                    firebase_config = json.load(f)

                emulator_host = (
                    "host.docker.internal"
                    if os.getenv("RUNNING_IN_DOCKER")
                    else "localhost"
                )
                emulator_port = firebase_config["emulators"]["database"]["port"]

                logger.info(
                    f"Connecting to Firebase emulator at {emulator_host}:{emulator_port}"
                )

                # Override database URL for emulator
                config["databaseURL"] = (
                    f"http://{emulator_host}:{emulator_port}?ns={os.getenv('FIREBASE_PROJECT_ID')}"
                )

            except Exception as e:
                logger.error(f"Failed to configure Firebase emulator: {e}")
                raise

        return firebase_admin.initialize_app(cred, config)

    return firebase_admin.get_app()


app = get_firebase_app()
database = db


__all__ = ["app", "database"]
