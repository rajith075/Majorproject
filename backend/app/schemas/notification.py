from pydantic import BaseModel, Field


class DeviceTokenCreate(BaseModel):
    token: str = Field(min_length=20, max_length=512)
