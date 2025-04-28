import pydantic

from fastapi import APIRouter, Depends
from typing import AsyncGenerator, Literal

from firebase_admin import firestore
from google.cloud.firestore import Client
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector


router = APIRouter()


# To be moved to designated location later
class VectorSearch(pydantic.BaseModel):
    field: str
    collection: str
    vector: list[float]
    top_k: int = 10
    threshold: float | None = None
    distance_measure: Literal["COSINE"] | Literal["EUCLIDIAN"] | Literal["DOT_PRODUCT"]


async def firestore_client() -> AsyncGenerator[Client, None]:
    client = firestore.client()
    yield client
    client.close()


@router.post("/search")
async def search(query: VectorSearch, db: Client = Depends(firestore_client)):
    """Performs a vector search on the database with respect to generalized query arguments"""
    knn = db.collection(query.collection).find_nearest(
        limit=query.top_k,
        vector_field=query.field,
        query_vector=Vector(query.vector),
        distance_measure=DistanceMeasure[query.distance_measure],
        distance_threshold=query.threshold,
    )

    return [result.to_dict() for result in knn.get()]
