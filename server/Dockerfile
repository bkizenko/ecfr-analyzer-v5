FROM golang:1.21-alpine as builder
RUN apk add -U --no-cache ca-certificates

ENV CGO_ENABLED=0 GO111MODULE=on GOOS=linux

WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o server server.go

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/ /
CMD ["/server"]