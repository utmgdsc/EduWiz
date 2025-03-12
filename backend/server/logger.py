import logging
import os


def setup_logger():
    log_dir = "./logs"
    log_file = os.path.join(log_dir, "app.log")

    os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger("eduwiz")
    logger.setLevel(logging.DEBUG)

    logging.basicConfig(
        format="%(name)s - %(levelname)s - %(asctime)s - %(message)s",
        level=logging.DEBUG,
    )

    file_handler = logging.FileHandler(filename=log_file, encoding="utf-8")
    file_handler.setFormatter(
        logging.Formatter("%(name)s - %(levelname)s - %(asctime)s - %(message)s")
    )
    logging.getLogger().addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_formatter = logging.Formatter(
        "%(name)s - %(levelname)s - %(asctime)s - %(message)s"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    logging.getLogger("aiormq").setLevel(logging.ERROR)

    logger.propagate = False
