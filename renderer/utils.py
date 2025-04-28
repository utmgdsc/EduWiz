import re
from typing import AsyncIterable
import logging

logger = logging.getLogger("eduwiz.utils")
JOB_LIMIT = 2

def count_total_animations_in_code(code: str) -> int:
    """Count the total number of animations in the Manim code."""
    play_count = len(re.findall(r"self\.play\(", code))
    wait_count = len(re.findall(r"self\.wait\(", code))
    total = play_count + wait_count
    return total