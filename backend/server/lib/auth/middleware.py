import asyncio

from firebase_admin import auth, credentials
from fastapi import HTTPException, Request, Depends
from fastapi.security import OAuth2PasswordBearer

from auth.invariant import Invariant
from auth.token import DecodedToken

_auth_scheme = OAuth2PasswordBearer(tokenUrl="token")


class FirebaseAuthMiddleware:
    """
    Middleware for handling Firebase authentication and token verification.

    This middleware verifies the Firebase ID token provided in the request
    and optionally enforces additional invariants using asynchronous tasks.

    Attributes:
        invariants (tuple[Invariant]): A tuple of invariant functions to be executed
            asynchronously. Each invariant function should accept a `Request` object
            and a `DecodedToken` object as arguments and return a boolean indicating
            whether the invariant is satisfied.

    Methods:
        __call__(request: Request, token: str = Depends(_auth_scheme)) -> DecodedToken:
            Asynchronously verifies the provided Firebase ID token and evaluates
            any specified invariants. Raises HTTP exceptions for invalid or revoked
            tokens, or if any invariant fails.
    """

    def __init__(
        self,
        *args: Invariant,
        sequential: bool = False,
    ):
        self.invariants = args
        self.sequential = sequential

    async def __call__(
        self, request: Request, token: str = Depends(_auth_scheme)
    ) -> DecodedToken:
        try:
            decoded_token: DecodedToken = auth.verify_id_token(
                token, check_revoked=True
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid token")
        except auth.UserDisabledError:
            raise HTTPException(status_code=403, detail="User is disabled")
        except (
            auth.InvalidIdTokenError
            | auth.ExpiredIdTokenError
            | auth.RevokedIdTokenError
        ) as error:
            raise HTTPException(status_code=401, detail=error.default_message)

        if len(self.invariants) == 0:
            return decoded_token

        if self.sequential:
            return await self._handle_sequential_invariants(request, decoded_token)
        return await self._handle_concurrent_invariants(request, decoded_token)

    async def _handle_sequential_invariants(
        self, request: Request, token: DecodedToken
    ):
        """
        Handles the sequential evaluation of invariants for a given request and token.

        This method iterates through a list of invariant functions and evaluates each one
        asynchronously. If any invariant fails (returns False), an HTTPException with a
        403 status code is raised, indicating that the request is forbidden. If all
        invariants pass, the decoded token is returned.
        """
        for invariant in self.invariants:
            if not await invariant(request, token):
                raise HTTPException(status_code=403, detail="Forbidden")
        return token

    async def _handle_concurrent_invariants(
        self, request: Request, token: DecodedToken
    ):
        """
        Handles the execution of concurrent invariant checks for a given request and token.

        This method runs a set of asynchronous invariant functions concurrently, ensuring
        that all invariants are satisfied. It cancels any remaining tasks if one of the
        invariants are computed and fails.
        """
        done, pending = await asyncio.wait(
            [
                asyncio.create_task(invariant(request, token))
                for invariant in self.invariants
            ],
            return_when=asyncio.FIRST_COMPLETED,
        )

        while len(pending) > 0 and all(task.result() for task in done):
            done, pending = await asyncio.wait(
                pending, return_when=asyncio.FIRST_COMPLETED
            )

        for task in pending:
            task.cancel()

        await asyncio.gather(*pending, return_exceptions=True)
        return token
