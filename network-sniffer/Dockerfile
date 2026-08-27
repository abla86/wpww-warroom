FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY sniffer.py .
RUN pip install --no-cache-dir requests

USER 65532:65532

CMD ["python", "sniffer.py"]
