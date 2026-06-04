# --- Stage 1: Build dependencies ---
FROM python:3.11-slim AS builder

WORKDIR /build

# Install compilation tools if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies to a local directory
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Final runtime image ---
FROM python:3.11-slim AS runner

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application files
COPY *.py ./

# Create a non-root group and user for security
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

# Set proper ownership
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose FastAPI default port
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV HOSTNAME=kubernetes-backend

# Start FastAPI server using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
