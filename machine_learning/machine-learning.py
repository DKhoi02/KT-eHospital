from fastapi import FastAPI, Response
from catboost import CatBoostClassifier
import pandas as pd
import numpy as np
from sklearn.utils import shuffle
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
import base64
import io
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
from typing import List
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
def test():
    return ("test")

@app.get("/disease-prediction")
def diseasePrediction(lstSymtoms: List[str] = Query(...)):
    
    get_columns = shuffle(pd.read_csv('Training70.csv')) 
    symptomColumns = get_columns.iloc[:, :-1]
    input_data = pd.DataFrame(np.zeros((1, len(symptomColumns.columns))), columns=symptomColumns.columns)

    # data = ['dischromic _patches', 'shivering', 'stomach_pain', 'ulcers_on_tongue', 'blackheads', 'silver_like_dusting', 'inflammatory_nails', 'yellow_crust_ooze']
    for symptom in lstSymtoms:
        if symptom in input_data.columns:
            input_data[symptom] = 1
    
    loaded_model = CatBoostClassifier()
    loaded_model.load_model('finalModel.cbm')
    predicted_probabilities = loaded_model.predict_proba(input_data)
    disease_classes = loaded_model.classes_

    results_df = pd.DataFrame({
        'Disease': disease_classes,
        'Probability': predicted_probabilities[0]
    })

    sorted_results = results_df.sort_values(by='Probability', ascending=False)

    top_5_diseases = sorted_results.head(5)
    result_list = top_5_diseases[['Disease', 'Probability']].to_dict(orient='records')
    new_result_list = [{item['Disease']: item['Probability']} for item in result_list]

    return (new_result_list)

@app.get("/revenue-forecast")
def revenueForecast(
    start_date: str = Query(...), 
    end_date: str= Query(...), 
    time: int = Query(...),  
    lstRevenue: str = Query(...), 
):
    lstRevenue = [int(x) for x in lstRevenue.split(',')]

    start_date = pd.to_datetime(start_date)
    end_date = pd.to_datetime(end_date)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    revenue = lstRevenue
    data_past = pd.DataFrame({'Date': dates, 'Revenue': revenue})
    data_past.set_index('Date', inplace=True)

    order_revenue = (2, 1, 1) 
    seasonal_order_revenue = (2, 1, 1, 12)
    model_revenue = SARIMAX(data_past['Revenue'], order=order_revenue, seasonal_order=seasonal_order_revenue)
    result_revenue = model_revenue.fit()

    future_dates = pd.date_range(start=end_date + pd.Timedelta(days=1), end=end_date + pd.Timedelta(days=time), freq='D')
    predicted_revenue = result_revenue.predict(start=len(data_past), end=len(data_past) + len(future_dates) - 1, dynamic=False)

    window_size = 7  
    smoothed_predicted_revenue = predicted_revenue.rolling(window=window_size).mean()

    plt.figure(figsize=(10, 6))

    plt.plot(data_past.index, data_past['Revenue'], label='Historical Data', color='blue')
    plt.plot(future_dates, smoothed_predicted_revenue, label='Predicted', color='red', linestyle='--')
    plt.xlabel('Date')
    plt.ylabel('Revenue')
    plt.title('Revenue Prediction')
    plt.legend()

    plt.tight_layout()

    img_path = "temp_plot.png"
    plt.savefig(img_path)
    plt.close()
    return FileResponse(img_path, media_type="image/png")


