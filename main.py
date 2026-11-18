from fastapi import FastAPI
from pydantic import BaseModel,Field
import joblib
import pandas as pd

app=FastAPI()

columns=["latitude","longitude","price","minimum_nights","number_of_reviews","reviews_per_month",
         "calculated_host_listings_count","neighbourhood_group","neighbourhood","availability_365"]


model=joblib.load("room_type.pkl")

class Features(BaseModel):
    latitude:float=Field(...,le=90,ge=-90,description="Lontitude coordinate")
    longitude:float=Field(...,le=180,ge=-180,description="Longitude coordinate")
    price:float=Field(...,ge=0,description="Price per night must be positive")
    minimum_nights:int=Field(...,ge=1,le=365,description="Minimum nights required for booking")
    number_of_reviews:int=Field(...,ge=0,description="Total number of reviews")
    reviews_per_month:int=Field(...,ge=0,description="Average reviews per month")
    calculated_host_listings_count:int=Field(...,ge=0,description="Number of listing by host")
    neighbourhood_group:str=Field(...,min_length=1,description="Borough or neighbour group")
    neighbourhood:str=Field(...,min_length=1,description="Specific neighbourhood name")
    availability_365:int=Field(...,ge=0,le=365,description="Days availableout of 365")

@app.get('/')
def greet():
    return "Hello guys"

@app.post('/predict')
def predict(features:Features):
    row=pd.DataFrame([features.dict()],columns=columns)
    prediction=model.predict(row)
    proba=model.predict_proba(row)

    return{
        "Predicted_room_type":prediction.tolist(),
        "Probability":proba.tolist()
    }