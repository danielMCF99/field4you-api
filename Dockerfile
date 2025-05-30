FROM mongo:latest

# Instala Python e pip
RUN apt-get update && \
  apt-get install -y python3 python3-pip && \
  rm -rf /var/lib/apt/lists/*

# Copia o keyfile
COPY mongo-keyfile /etc/mongo-keyfile
RUN chmod 400 /etc/mongo-keyfile && chown mongodb:mongodb /etc/mongo-keyfile

# Copia os ficheiros do script
COPY ./local-db/scriptdata.py /app/scriptdata.py
COPY ./local-db/requirements.txt /app/requirements.txt

# Instala dependências
RUN pip install --no-cache-dir --break-system-packages -r /app/requirements.txt

# Deixa o mongod como processo principal
CMD ["mongod", "--replSet", "rs0", "--auth", "--keyFile", "/etc/mongo-keyfile/mongo-keyfile"]
