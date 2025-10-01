from flask import Flask, request, jsonify
import pickle
import re
import numpy as np # Import numpy
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

app = Flask(__name__)

model = pickle.load(open('model.pkl', 'rb'))
tfidf_vectorizer = pickle.load(open('tfidf_vectorizer.pkl', 'rb'))

ps = PorterStemmer()
def preprocess_text(text):
    review = re.sub('[^a-zA-Z]', ' ', text)
    review = review.lower()
    review = review.split()
    review = [ps.stem(word) for word in review if not word in stopwords.words('english')]
    return ' '.join(review)

# --- Sigmoid function to convert score to probability ---
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if 'news' not in data:
        return jsonify({'error': 'No news text provided'}), 400

    news_text = data['news']
    processed_text = preprocess_text(news_text)
    vectorized_text = tfidf_vectorizer.transform([processed_text]).toarray()
    
    # --- UPDATED LOGIC ---
    # Get the raw score from the decision function
    score = model.decision_function(vectorized_text)[0]
    
    # Determine prediction and confidence
    if score > 0:
        prediction = 'Fake News'
        # Confidence is the probability of it being FAKE
        confidence = sigmoid(score)
    else:
        prediction = 'Real News'
        # Confidence is the probability of it being REAL
        confidence = 1 - sigmoid(score)

    return jsonify({
        'prediction': prediction,
        'confidence': confidence 
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
