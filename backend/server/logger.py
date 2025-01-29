import logging


def setup_logger():
    logging.basicConfig(
        format="%(name)s - %(levelname)s - %(asctime)s - %(message)s",
        level=logging.DEBUG,
    )

    file_handler = logging.FileHandler(filename="./logs/app.log", encoding="utf-8")
    file_handler.setFormatter(
        logging.Formatter("%(name)s - %(levelname)s - %(asctime)s - %(message)s")
    )
    logging.getLogger().addHandler(file_handler)
