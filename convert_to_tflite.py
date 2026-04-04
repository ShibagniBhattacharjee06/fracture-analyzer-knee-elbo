import tensorflow as tf

def convert_model():
    print("Loading keras model...")
    model = tf.keras.models.load_model("fracture_model.keras", compile=False, safe_mode=False)
    
    print("Converting to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    
    print("Saving fracture_model.tflite...")
    with open("fracture_model.tflite", "wb") as f:
        f.write(tflite_model)
    
    print("Conversion successful!")

if __name__ == "__main__":
    convert_model()
