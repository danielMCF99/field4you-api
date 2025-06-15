FROM python:3.11-slim

WORKDIR /app

COPY ./scriptdata.py /app/scriptdata.py
COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "scriptdata.py"]
