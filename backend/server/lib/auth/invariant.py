from typing import Protocol
from fastapi import Request

from .token import DecodedToken


class Invariant(Protocol):
    """
    Represents a protocol for an invariant check that validates a request and a decoded token.

    This protocol defines a callable interface that accepts a `Request` object and a `DecodedToken` object
    as parameters and returns a boolean value indicating whether the invariant condition is satisfied.

    Parameters:
        request (Request): The incoming HTTP request object to be validated.
        token (DecodedToken): The decoded authentication token associated with the request.

    Returns:
        bool: True if the invariant condition is satisfied, False otherwise.
    """

    async def __call__(self, request: Request, token: DecodedToken) -> bool: ...


async def email_is_verified(request: Request, token: DecodedToken):
    return token["email_verified"]
