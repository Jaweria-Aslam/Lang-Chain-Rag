from pydantic import BaseModel, Field


class IngestRequest(BaseModel):
    url: str = Field(..., min_length=5)


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)


class Source(BaseModel):
    title: str = ""
    url: str = ""
    content: str = ""


class AskResponse(BaseModel):
    answer: str
    sources: list[Source] = Field(default_factory=list)