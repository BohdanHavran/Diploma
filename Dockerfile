FROM python:3.11-alpine AS builder

RUN apk add --no-cache \
    build-base \
    jpeg-dev \
    zlib-dev \
    libffi-dev \
    musl-dev

WORKDIR /install

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

FROM python:3.11-alpine

RUN apk add --no-cache \
    libjpeg \
    zlib

COPY --from=builder /install /usr/local

WORKDIR /app
COPY . .

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--access-logfile", "-", "--error-logfile", "-"]