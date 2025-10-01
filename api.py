from flask import Flask, request, jsonify
import pickle
import re
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

# Initialize Flask app
app = Flask(__name__)

# Load the trained model and vectorizer
model = pickle.load(open('model.pkl', 'rb'))
tfidf_vectorizer = pickle.load(open('tfidf_vectorizer.pkl', 'rb'))

# Preprocessing function
ps = PorterStemmer()
def preprocess_text(text):
    review = re.sub('[^a-zA-Z]', ' ', text)
    review = review.lower()
    review = review.split()
    review = [ps.stem(word) for word in review if not word in stopwords.words('english')]
    return ' '.join(review)

# Route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if 'news' not in data:
        return jsonify({'error': 'No news text provided'}), 400

    news_text = data['news']
    processed_text = preprocess_text(news_text)
    vectorized_text = tfidf_vectorizer.transform([processed_text]).toarray()
    prediction = model.predict(vectorized_text)

    result = 'Fake News' if prediction[0] == 1 else 'Real News'

    return jsonify({'prediction': result})

if __name__ == '__main__':
    # Run on port 5000
    app.run(port=5000, debug=True)