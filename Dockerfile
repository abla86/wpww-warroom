FROM python:3.11-slim
WORKDIR /app
COPY lab ./lab
COPY public ./public
COPY plugins ./plugins
COPY config ./config
RUN pip install --no-cache-dir requests
ENV PYTHONUNBUFFERED=1 \
    WPWW_LAB_PORT=8080 \
    WPWW_DATA_DIR=/data \
    WPWW_USER_FILES_DIR=/app/user_files
RUN mkdir -p /data /app/user_files
EXPOSE 8080
CMD ["python", "-u", "lab/wpww_unit.py"]
