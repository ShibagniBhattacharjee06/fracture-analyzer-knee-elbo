from flask import Flask, request, jsonify
from flask_cors import CORS
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    from tensorflow import lite as tflite

import numpy as np
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# 🔥 TFLite Model Path
MODEL_PATH = "fracture_model.tflite"

interpreter = None
input_details = None
output_details = None

if os.path.exists(MODEL_PATH):
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
else:
    print(f"Error: Model file {MODEL_PATH} not found.")

@app.route("/")
def home():
    return jsonify({"status": "online", "message": "Fracture Detection API is running 🚀"})

@app.route("/predict", methods=["POST"])
def predict():
    if interpreter is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))
        # Ensure it's float32 for TFLite
        img = np.array(img, dtype=np.float32) / 255.0
        img = np.expand_dims(img, axis=0)

        # TFLite Prediction
        interpreter.set_tensor(input_details[0]['index'], img)
        interpreter.invoke()
        prediction = interpreter.get_tensor(output_details[0]['index'])[0][0]
        
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