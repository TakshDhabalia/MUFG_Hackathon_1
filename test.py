import requests

BASE_URL = "http://127.0.0.1:8000"

# 1. Train the model
print("\n=== TRAINING ===")
train_data = {
    "file_path": "data.csv"  # Change this to your actual dataset path
}
r = requests.post(f"{BASE_URL}/train", json=train_data)
print(r.status_code, r.json())

# 2. Predict
print("\n=== PREDICT ===")
predict_data = {
    "question": "What is artificial intelligence?"  # Example question
}
r = requests.post(f"{BASE_URL}/predict", json=predict_data)
print(r.status_code, r.json())

# 3. Recommendations
print("\n=== RECOMMENDATIONS ===")
recommend_data = {
    "query": "machine learning"  # Example query
}
r = requests.post(f"{BASE_URL}/recommendations", json=recommend_data)
print(r.status_code, r.json())

# 4. Chat
print("\n=== CHAT ===")
chat_data = {
    "message": "Hello, how are you?"
}
r = requests.post(f"{BASE_URL}/chat", json=chat_data)
print(r.status_code, r.json())
