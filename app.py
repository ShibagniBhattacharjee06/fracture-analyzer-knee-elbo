from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# 🔥 SAFE LOAD FOR .keras FILE
MODEL_PATH = "fracture_model.keras"

if os.path.exists(MODEL_PATH):
    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False,
        safe_mode=False
    )
else:
    model = None
    print(f"Error: Model file {MODEL_PATH} not found.")

@app.route("/")
def home():
    return jsonify({"status": "online", "message": "Fracture Detection API is running 🚀"})

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))
        img = np.array(img) / 255.0
        img = np.expand_dims(img, axis=0)

        prediction = model.predict(img)[0][0]
        
        # Confidence logic: if prediction > 0.5, it's fracture (assuming label 1 is fracture)
        # We also need to round the confidence percentage
        result = "Fracture Detected" if prediction > 0.5 else "Normal"
        confidence = float(prediction) if prediction > 0.5 else 1.0 - float(prediction)

        return jsonify({
            "result": result,
            "confidence": round(confidence * 100, 2),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)