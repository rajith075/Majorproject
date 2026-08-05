from app.services.prediction_service import prediction_service

patient = {

    "patient_id": "PAT001"

}

result = prediction_service.predict(patient)

print(result)