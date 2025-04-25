from pydantic import BaseModel, Field

class ImageData(BaseModel):
    image: str
    dict_of_vars: dict