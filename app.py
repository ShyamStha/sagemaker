from flask import Flask, request, jsonify
from flask_cors import CORS
from sagemaker.predictor import Predictor
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# -------------------------------
# Configure your SageMaker endpoint
# -------------------------------
ENDPOINT_NAME = os.getenv("SAGEMAKER_ENDPOINT_NAME", "sagemaker-xgboost-2025-10-21-05-17-31-187")
predictor = Predictor(endpoint_name=ENDPOINT_NAME)

# -------------------------------
# Prediction route
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Expect JSON input: {"features": [[f1, f2, ..., f12], ...]}
        input_features = request.json.get("features")

        if not input_features:
            return jsonify({"error": "No features provided"}), 400

        # Convert to CSV bytes
        csv_input = "\n".join([",".join(map(str, row)) for row in input_features])
        csv_bytes = bytes(csv_input, encoding="utf-8")

        # Call SageMaker endpoint
        predictions_bytes = predictor.predict(csv_bytes, initial_args={"ContentType": "text/csv"})

        # Convert CSV response to NumPy array
        predictions = np.fromstring(predictions_bytes.decode("utf-8"), sep=",")

        return jsonify({"predictions": predictions.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------------
# Test route
# -------------------------------
@app.route("/", methods=["GET"])
def home():
    return "SageMaker XGBoost Prediction API is running!"

# -------------------------------
# Run the Flask app
# -------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
