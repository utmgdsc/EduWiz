# Renderer Dockerfile
FROM manimcommunity/manim:stable

WORKDIR /app

# Install ffmpeg and SoX
USER root
RUN apt-get update && \
    apt-get install -y ffmpeg sox libsox-fmt-all && \
    rm -rf /var/lib/apt/lists/*
USER manimuser

# Install additional Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the renderer
CMD ["python", "main.py"]
