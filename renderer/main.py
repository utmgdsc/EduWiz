import asyncio
import logging
from utils import JOB_LIMIT
from manager import RenderManager
from logger import setup_logger

setup_logger()
logger = logging.getLogger("eduwiz.main")

if __name__ == "__main__":
    logger.info("Starting renderer service")
    manager = RenderManager()
    asyncio.run(manager.run())