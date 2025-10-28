# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Also, download the NLTK stopwords data
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m nltk.downloader stopwords

# Copy all the application code into the container
COPY . .

# --- THIS IS THE FIX ---
# Run the training script to generate the model.pkl and tfidf_vectorizer.pkl files
RUN python train_model.py

# Make port 5000 available
EXPOSE 5000

# Run api.py when the container launches
CMD ["python", "api.py"]

