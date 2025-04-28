from fastapi import APIRouter, Depends

from server.lib.auth import FirebaseAuthMiddleware
from server.lib.auth.invariant import email_is_verified

from . import embed, search

router = APIRouter(
    prefix="/vector",
    tags=["vector"],
    dependencies=[Depends(FirebaseAuthMiddleware(email_is_verified))],
)

router.include_router(embed.router, tags=["embed"])
router.include_router(search.router, tags=["search"])
