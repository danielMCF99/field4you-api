FROM mongo:latest

# Instala Python e ferramentas necessárias
RUN apt-get update && \
  apt-get install -y python3 python3-pip python3-venv && \
  rm -rf /var/lib/apt/lists/*

# Cria pasta para o script
WORKDIR /app

# Cria ambiente virtual
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copia os ficheiros do script e requisitos
COPY ./local-db/scriptdata.py /app/scriptdata.py
COPY ./local-db/requirements.txt /app/requirements.txt
COPY ./local-db/mongo-keyfile /etc/mongo-keyfile
RUN chmod 400 /etc/mongo-keyfile && chown mongodb:mongodb /etc/mongo-keyfile

# Instala dependências no venv
RUN pip install --no-cache-dir -r /app/requirements.txt

# Default CMD para o deployment MongoDB (o Job pode sobrescrever isto)
CMD ["mongod", "--replSet", "rs0", "--auth", "--keyFile", "/etc/mongo-keyfile/mongo-keyfile"]
