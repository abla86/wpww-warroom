FROM python:3.11-slim
WORKDIR /app
COPY wpww_unit.py .
RUN python -m py_compile wpww_unit.py
EXPOSE 8085
CMD ["python", "-u", "wpww_unit.py"]
