import logging
import os


def setup_logger():
    log_dir = "./logs"
    log_file = os.path.join(log_dir, "app.log")

    os.makedirs(log_dir, exist_ok=True)

    logging.basicConfig(
        format="%(name)s - %(levelname)s - %(asctime)s - %(message)s",
        level=logging.INFO,  # Set root logger to ERROR
    )

    logger = logging.getLogger("eduwiz")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    file_handler = logging.FileHandler(filename=log_file, encoding="utf-8")
    file_handler.setFormatter(
        logging.Formatter("%(name)s - %(levelname)s - %(asctime)s - %(message)s")
    )
    logger.addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        "%(name)s - %(levelname)s - %(asctime)s - %(message)s"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # Explicitly silence unecessary loggers
    for logger_name in [
        "aiormq",
        "aio_pika",
        "aiormq.connection",
        "aiormq.tools",
        "asyncio",
        "aiohttp",
        "multipart",
        "urllib3",
        "websockets",
    ]:
        logging.getLogger(logger_name).setLevel(logging.ERROR)
