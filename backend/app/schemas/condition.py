from pydantic import BaseModel


class ConditionCreate(BaseModel):
    name: str


class ConditionResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True