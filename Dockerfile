FROM python:3.11-slim

WORKDIR /app

RUN groupadd --system wpww && useradd --system --gid wpww --create-home --home-dir /home/wpww wpww

COPY wpww_app.py ./wpww_app.py
COPY lab ./lab
COPY public ./public
COPY plugins ./plugins
COPY config ./config

RUN pip install --no-cache-dir requests \
    && mkdir -p /data /app/user_files \
    && chown -R wpww:wpww /app /data /home/wpww

ENV PYTHONUNBUFFERED=1 \
    WPWW_LAB_PORT=8080 \
    WPWW_DATA_DIR=/data \
    WPWW_USER_FILES_DIR=/app/user_files

EXPOSE 8080

USER wpww

CMD ["python", "-u", "wpww_app.py"]
