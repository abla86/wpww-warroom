FROM python:3.12-slim
WORKDIR /app
COPY cli.py threat_simulator.py ./
RUN python -m py_compile cli.py threat_simulator.py
USER nobody
CMD ["python", "threat_simulator.py"]
