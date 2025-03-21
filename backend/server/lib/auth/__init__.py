"""
This package provides authentication utilities for Firebase integration in FastAPI applications.
"""

from auth.invariant import Invariant
from auth.middleware import FirebaseAuthMiddleware
from auth.token import DecodedToken

__all__ = ["FirebaseAuthMiddleware", "Invariant", "DecodedToken"]
