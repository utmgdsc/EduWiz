import functools
import pydantic

from fastapi import APIRouter, Depends
from langchain_openai import OpenAIEmbeddings

router = APIRouter(
    tags=["embed"],
)


@functools.lru_cache(maxsize=1)
def get_embedding_service() -> OpenAIEmbeddings:
    """
    Returns an instance of the OpenAIEmbeddings class.
    """
    return OpenAIEmbeddings(model="text-embedding-ada-002")


class EmbedRequest(pydantic.BaseModel):
    """
    Request model for embedding a document.
    """

    document: str

    class Config:
        schema_extra = {
            "example": {"document": "This is a sample document to be embedded."}
        }


@router.post("/embed")
def embed_document(
    embed_request: EmbedRequest,
    embedding_service: OpenAIEmbeddings = Depends(get_embedding_service),
):
    """
    Embeds a document using the embedding service.
    """
    return {
        "embedding": embedding_service.embed_query(embed_request.document),
    }
