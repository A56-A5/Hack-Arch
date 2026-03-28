FROM python:3.10-slim

# Install system dependencies for tools
RUN apt-get update && apt-get install -y \
    nmap \
    nikto \
    whatweb \
    wget \
    curl \
    git \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install nodejs and retire.js
RUN npm install -g retire

# Install nuclei (go required)
RUN wget https://go.dev/dl/go1.20.2.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.20.2.linux-amd64.tar.gz && \
    rm go1.20.2.linux-amd64.tar.gz
ENV PATH=$PATH:/usr/local/go/bin
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Install sslyze
RUN pip install sslyze

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Make sure the app is run with a non-root user for security
RUN useradd -m vulnuser && chown -R vulnuser:vulnuser /app
USER vulnuser

EXPOSE 5000

CMD ["gunicorn", "-k", "eventlet", "-w", "1", "app:app", "--bind", "0.0.0.0:5000"]
