**NYC Airbnb Room Type Classification**

A Machine Learning web application that predicts the room type of Airbnb listings in New York City based on property characteristics, pricing, location, reviews, and availability.

The project combines a trained Scikit-learn classification model with a FastAPI backend and a web-based user interface, allowing users to submit property details and receive room type predictions along with prediction probabilities.

---

## Project Overview

The objective of this project is to build an end-to-end Machine Learning application that classifies Airbnb listings into different room categories using historical listing data.

The application follows a complete workflow:

- Data analysis and preprocessing
- Feature engineering and selection
- Machine Learning model development
- Model evaluation
- Model serialization using Joblib
- REST API development using FastAPI
- Frontend integration using HTML, CSS, and JavaScript
- Deployment using Render

## Tech Stack

| Category | Technologies |
|---|---|
| Programming Language | Python |
| Data Analysis | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Model Serialization | Joblib |
| Backend | FastAPI, Pydantic |
| API Server | Uvicorn |
| Frontend | HTML, CSS, JavaScript |
| Development | Jupyter Notebook, VS Code |
| Version Control | Git, GitHub |
| Deployment | Render |

## Dataset

**Dataset:** New York City Airbnb Open Data (AB_NYC_2019)

The dataset contains Airbnb listing information, including location, pricing, reviews, availability, and room categories.

### Input Features

The model uses the following features:

| Feature | Description |
|---|---|
| latitude | Latitude coordinate of the listing |
| longitude | Longitude coordinate of the listing |
| price | Price per night |
| minimum_nights | Minimum nights required for booking |
| number_of_reviews | Total number of reviews |
| reviews_per_month | Average reviews received per month |
| calculated_host_listings_count | Number of listings managed by the host |
| neighbourhood_group | NYC borough |
| neighbourhood | Specific neighbourhood |
| availability_365 | Number of available days throughout the year |

### Target Variable

`room_type`

The target variable represents the room category of an Airbnb listing.

## Machine Learning Workflow

The project follows these stages:

1. **Data Loading:** Import the Airbnb dataset using Pandas.
2. **Exploratory Data Analysis:** Examine the dataset, distributions, patterns, and relationships.
3. **Data Preprocessing:** Prepare the data for model training.
4. **Feature Selection:** Identify the relevant input features.
5. **Model Training:** Train classification models using Scikit-learn.
6. **Model Evaluation:** Evaluate model performance using appropriate classification metrics.
7. **Model Serialization:** Save the trained model using Joblib.
8. **API Development:** Integrate the saved model with FastAPI.
9. **Frontend Development:** Create an interactive interface for user input and predictions.
10. **Deployment:** Deploy the backend and frontend using Render.

## Application Architecture

```text
                 USER
                   |
                   v
          FRONTEND INTERFACE
             HTML / CSS / JS
                   |
                   v
             FASTAPI BACKEND
                   |
                   v
          INPUT VALIDATION
               Pydantic
                   |
                   v
          TRAINED ML MODEL
              Joblib
                   |
                   v
          ROOM TYPE PREDICTION
                   |
                   v
          PREDICTION PROBABILITIES
                   |
                   v
          DISPLAY RESULTS TO USER
```

## Project Structure

```text
Room-Type-Classification-Model/
│
├── ui/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── AB_NYC_2019.csv
├── Room_Type_Classification.ipynb
├── main.py
├── room_type.pkl
├── requirements.txt
└── README.md
```

## API Documentation

The backend is developed using FastAPI and exposes REST API endpoints for application health checks and predictions.

### 1. Health Check

**Method:** `GET`

**Endpoint:** `/`

Checks whether the backend API is running.

### 2. Room Type Prediction

**Method:** `POST`

**Endpoint:** `/predict`

Accepts listing information and returns the predicted room type along with class probabilities.

**Example Request:**

```json
{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "price": 150,
    "minimum_nights": 2,
    "number_of_reviews": 25,
    "reviews_per_month": 1.5,
    "calculated_host_listings_count": 2,
    "neighbourhood_group": "Manhattan",
    "neighbourhood": "Midtown",
    "availability_365": 200
}
```

**Example Response:**

```json
{
    "predicted_room_type": "Private room",
    "probabilities": {
        "Entire home/apt": 0.25,
        "Private room": 0.70,
        "Shared room": 0.05
    }
}
```

*Note: The response values are illustrative and do not represent actual model output.*

## Local Setup and Installation

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/SujalAnvekar/Room-Type-Classification-Model.git
```

### 2. Navigate to the Project Directory

```bash
cd Room-Type-Classification-Model
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

Activate the environment:

**Windows:**

```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Start the FastAPI Backend

```bash
uvicorn main:app --reload
```

The backend will run at:

`http://127.0.0.1:8000`

### 6. Access API Documentation

Open the following address in your browser:

`http://127.0.0.1:8000/docs`

FastAPI Swagger UI allows you to test the API endpoints directly.

### 7. Run the Frontend

Open the `ui` folder in VS Code.

Right-click `index.html` and select **Open with Live Server**.

Make sure the API base URL in `ui/script.js` points to your local backend:

```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

## Deployment

The project uses Render for deployment.

| Component | Deployment |
|---|---|
| Backend API | Render Web Service |
| Frontend | Render Static Site |
| Model | Loaded by FastAPI using Joblib |

The frontend communicates with the deployed backend through HTTP requests.

**Backend URL:** https://room-type-classification-model-2.onrender.com

**API Documentation:** https://room-type-classification-model-2.onrender.com/docs

## Future Enhancements

- Improve classification performance through further experimentation and hyperparameter tuning.
- Enhance the user interface and user experience.
- Add more prediction insights and visualizations.
- Improve API validation and error handling.
- Explore additional listing features to improve model performance.
