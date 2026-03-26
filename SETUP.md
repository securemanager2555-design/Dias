# SETUP (для напарника)

Этот файл для быстрого запуска проекта после `git clone`.

## 1) Требования

- Node.js `18+` (рекомендуется `20 LTS`)
- npm `9+`
- PostgreSQL `14+`

Проверка:

```bash
node -v
npm -v
psql --version
```

## 2) Клонирование

```bash
git clone https://github.com/securemanager2555-design/Dias.git
cd Dias
```

## 3) Установка зависимостей

В корне (frontend):

```bash
npm install
```

В backend:

```bash
cd backend
npm install
```

## 4) Настройка `.env` backend

В `backend`:

```bash
copy .env.example .env
```

Если `copy` не сработает, создай `backend/.env` вручную по примеру `backend/.env.example`.

**Обязательно** заполни эти значения:

### Основные (критичные):
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - длинный случайный секрет (минимум 32 символа)
- `CORS_ORIGIN=http://localhost:5173` - для фронтенда

### Email (для восстановления пароля и кодов входа):
- для Gmail:
  - `GMAIL_USER=yourgmail@gmail.com`
  - `GMAIL_APP_PASSWORD=your_gmail_app_password` (не обычный пароль, а app password из 2FA)
- или для другого SMTP-сервера:
  - `SMTP_SERVICE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**⚠️ Без email конфигурации функции восстановления пароля не будут работать!**

### Security (опционально):
- `LOGIN_LOCKOUT_THRESHOLD=5` - сколько неудачных попыток до блокировки
- `LOGIN_LOCKOUT_MINUTES=15` - на сколько минут блокировать
- `LOGIN_CODE_TTL_MINUTES=10` - срок действия кода входа

### Админ данные для seed:
- `SEED_ADMIN_EMAIL=admin@example.com`
- `SEED_ADMIN_PASSWORD=ChangeMe12345`

## 5) Подготовка БД

Убедись, что PostgreSQL запущен и база из `DATABASE_URL` существует.

В `backend`:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Для локальной разработки можно вместо `migrate deploy`:

```bash
npx prisma migrate dev
```

## 6) Запуск backend

В `backend`:

```bash
npm run dev
```

Ожидаемо: backend слушает `http://localhost:4000`.

Проверка:

```bash
curl http://localhost:4000/api/health
```

## 7) Запуск frontend

В корне проекта (новый терминал):

```bash
npm run dev
```

Открой `http://localhost:5173`.

## 8) Быстрая проверка после запуска

1. Вход/регистрация работают  
2. Страница `OWASP Shield` открывается и показывает данные  
3. Страница `Карта защиты` открывается и статусы отображаются  
4. Заметки загружаются для авторизованного пользователя

## 9) Частые ошибки

### `P1001` / `Can't reach database server`

- PostgreSQL не запущен или неверный `DATABASE_URL`.

### `JWT_SECRET is weak`

- В `backend/.env` поставь длинный секрет (`32+` символов).

### `CORS` ошибки в браузере

- Проверь `CORS_ORIGIN=http://localhost:5173` в `backend/.env`.

### `invalid_token` / 401

- Перелогинься в приложении.

---

Если нужно, можно добавить Docker Compose для PostgreSQL + запуск в 1 команду.
