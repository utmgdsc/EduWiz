# Renderer Dockerfile
FROM manimcommunity/manim:stable

WORKDIR /app

# Install additional Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

USER root

# Run the renderer
CMD ["python", "worker.py"]
