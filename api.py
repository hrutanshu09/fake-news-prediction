from flask import Flask, request, jsonify
import pickle
import re
import numpy as np
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

app = Flask(__name__)

# Load the trained model and vectorizer
model = pickle.load(open('model.pkl', 'rb'))
tfidf_vectorizer = pickle.load(open('tfidf_vectorizer.pkl', 'rb'))

ps = PorterStemmer()
def preprocess_text(text):
    review = re.sub('[^a-zA-Z]', ' ', text)
    review = review.lower()
    review = review.split()
    review = [ps.stem(word) for word in review if not word in stopwords.words('english')]
    return ' '.join(review)

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    news_text = data['news']
    
    processed_text = preprocess_text(news_text)
    vectorized_text = tfidf_vectorizer.transform([processed_text]).toarray()
    
    score = model.decision_function(vectorized_text)[0]
    
    if score > 0:
        prediction = 'Fake News'
        confidence = sigmoid(score)
    else:
        prediction = 'Real News'
        confidence = 1 - sigmoid(score)

    return jsonify({
        'prediction': prediction,
        'confidence': confidence 
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)