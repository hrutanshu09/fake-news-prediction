FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
RUN pip install Flask numpy nltk scikit-learn

# Download the NLTK stopwords data
RUN python -c "import nltk; nltk.download('stopwords')"

# Copy the application and model files
COPY . .

# Expose the port the API runs on
EXPOSE 5000

# Command to run the Flask API
CMD ["python", "api.py"]