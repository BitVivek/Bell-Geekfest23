from flask import Flask, request, jsonify
from transformers import BertTokenizer
from torch.utils.data import DataLoader, TensorDataset
app = Flask(__name__)
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Define the path to the extracted model directory
model_directory = "my_trained_model_email"

# Load the model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained(model_directory)
tokenizer = AutoTokenizer.from_pretrained(model_directory)

@app.route('/predict', methods=['POST'])
def predict():
    # Get the input text from the request
    data = request.get_json()
    text = data.get('text', '')
    
    # Tokenize the input text and get model predictions
    inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
    outputs = model(**inputs)
    probs = outputs.logits.softmax(dim=-1)
    prediction = probs.argmax().item()
    
    # Return the prediction as JSON
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
