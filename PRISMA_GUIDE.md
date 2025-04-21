# Hướng dẫn sử dụng Prisma trong môi trường Production

## Chạy Prisma Studio

Prisma Studio đã được cấu hình sẵn trong docker-compose.yml và sẽ tự động chạy khi bạn khởi động các container:

```bash
docker-compose up -d
```

Sau khi các container đã chạy, bạn có thể truy cập Prisma Studio tại:

```
http://your-server-ip:5555
```

Nếu bạn muốn thay đổi port, hãy cập nhật biến môi trường `PRISMA_STUDIO_PORT` trong file `.env`.

## Chạy Seed trong Production

Để chạy seed trong môi trường production, bạn có thể sử dụng một trong các cách sau:

### Cách 1: Sử dụng script có sẵn

```bash
# Kết nối vào container đang chạy
docker exec -it edu-forge-discussion-service ./scripts/run-seed.sh
```

### Cách 2: Chạy trực tiếp lệnh Prisma

```bash
# Kết nối vào container đang chạy
docker exec -it edu-forge-discussion-service npx prisma db seed
```

### Cách 3: Tạo container tạm thời

```bash
# Tạo container tạm thời để chạy seed
docker-compose run --rm api npx prisma db seed
```

## Chạy Migrations trong Production

Để chạy migrations trong môi trường production:

```bash
docker exec -it edu-forge-discussion-service npx prisma migrate deploy
```

## Lưu ý bảo mật

Prisma Studio mở ra quyền truy cập trực tiếp vào cơ sở dữ liệu của bạn. Trong môi trường production, bạn nên:

1. Chỉ mở Prisma Studio khi cần thiết và tắt đi khi không sử dụng
2. Giới hạn quyền truy cập bằng cách sử dụng tường lửa hoặc VPN
3. Cân nhắc sử dụng proxy như Nginx với xác thực cơ bản nếu cần truy cập từ xa

Để tắt Prisma Studio khi không sử dụng:

```bash
docker-compose stop prisma-studio
```

Để khởi động lại khi cần:

```bash
docker-compose start prisma-studio
```
