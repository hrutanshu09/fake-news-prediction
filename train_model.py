import pandas as pd
import re
import pickle
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn.metrics import accuracy_score
import nltk
nltk.download('stopwords')

# 1. Load the dataset using only the columns we need
try:
    # We now also load the 'text' column as a fallback if 'title' is empty
    df = pd.read_csv('train.csv', usecols=['title', 'label'])
except ValueError:
    print("Error: Make sure 'train.csv' contains 'title' and 'label' columns.")
    exit()

# 2. Data Preprocessing
df.dropna(subset=['title', 'label'], inplace=True)

# --- NEW: Map text labels to numbers (1 for FAKE, 0 for REAL) ---
# This is the key fix for your dataset.
print("--- Data Diagnostics ---")
print("Original labels found:")
print(df['label'].value_counts())

# We assume the labels are 'FAKE' and 'REAL'. Adjust if they are different.
df['label'] = df['label'].map({'FAKE': 1, 'REAL': 0})
# ----------------------------------------------------------------

# Now, we continue cleaning as before
df.dropna(subset=['label'], inplace=True) # Drops any rows that didn't map (e.g., were not 'FAKE' or 'REAL')
df['label'] = df['label'].astype(int)

print("\nLabel distribution after mapping to numbers:")
print(df['label'].value_counts())
print("------------------------\n")

X = df['title']
y = df['label']

if len(df) < 10 or len(y.unique()) < 2:
    print("Error: Not enough data or only one class present after cleaning. Cannot train model.")
    exit()

corpus = []
ps = PorterStemmer()

for i in range(0, len(X)):
    review = re.sub('[^a-zA-Z]', ' ', X.iloc[i])
    review = review.lower()
    review = review.split()
    review = [ps.stem(word) for word in review if not word in stopwords.words('english')]
    review = ' '.join(review)
    corpus.append(review)

# 3. Vectorization
tfidf_v = TfidfVectorizer(max_features=5000, ngram_range=(1,3))
X_features = tfidf_v.fit_transform(corpus).toarray()

# 4. Splitting the dataset
X_train, X_test, y_train, y_test = train_test_split(
    X_features, y, test_size=0.20, random_state=0, stratify=y
)

# 5. Model Training
classifier = PassiveAggressiveClassifier(max_iter=1000)
classifier.fit(X_train, y_train)

# 6. Model Evaluation
y_pred = classifier.predict(X_test)
score = accuracy_score(y_test, y_pred)
print(f'Accuracy: {round(score*100, 2)}%')

# 7. Save the model and vectorizer
pickle.dump(classifier, open('model.pkl', 'wb'))
pickle.dump(tfidf_v, open('tfidf_vectorizer.pkl', 'wb'))

print("Model and Vectorizer have been saved successfully.")