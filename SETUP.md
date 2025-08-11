# Инструкция по настройке Supabase и деплою

## 1. Настройка Supabase

### 1.1 Создание проекта
1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

### 1.2 Настройка базы данных
1. В вашем проекте Supabase перейдите в **SQL Editor**
2. Скопируйте содержимое файла `supabase-schema.sql`
3. Выполните SQL команды для создания таблиц и индексов

### 1.3 Получение ключей API
1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** ключ

### 1.4 Настройка переменных окружения
1. Скопируйте файл `env.example` в `.env`:
   ```bash
   cp env.example .env
   ```
2. Откройте файл `.env` и заполните:
   - `SUPABASE_URL` = ваш Project URL
   - `SUPABASE_ANON_KEY` = ваш anon public ключ
3. Или используйте команду: `npm run setup-env`

## 2. Настройка Row Level Security (RLS)

### 2.1 Создание функции для установки Telegram ID
```sql
-- Создайте эту функцию в SQL Editor Supabase
CREATE OR REPLACE FUNCTION set_telegram_user_id(user_id BIGINT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.telegram_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Обновление политик безопасности
```sql
-- Обновите политики, заменив current_setting на функцию
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (telegram_user_id = (SELECT set_telegram_user_id(telegram_user_id)::bigint));

-- Повторите для INSERT, UPDATE, DELETE политик
```

## 3. Деплой на Vercel

### 3.1 Подключение GitHub
1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите ваш GitHub аккаунт
3. Выберите репозиторий `my_buh_tg`

### 3.2 Настройка переменных окружения
В Vercel добавьте переменные окружения:
1. Перейдите в **Settings** → **Environment Variables**
2. Добавьте переменные:
   - `SUPABASE_URL` = ваш Project URL
   - `SUPABASE_ANON_KEY` = ваш anon public ключ
3. Выберите **Production**, **Preview** и **Development** среды
4. Нажмите **Save**

### 3.3 Автоматический деплой
Vercel автоматически развернет ваше приложение при каждом push в ветку `main`

## 4. Настройка Telegram Bot

### 4.1 Создание бота
1. Напишите [@BotFather](https://t.me/botfather) в Telegram
2. Создайте нового бота командой `/newbot`
3. Получите токен бота

### 4.2 Настройка Mini App
1. Отправьте команду `/setmenubutton` BotFather
2. Выберите вашего бота
3. Укажите URL вашего приложения на Vercel
4. Добавьте описание кнопки

### 4.3 Тестирование
1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню
3. Приложение должно открыться в Telegram

## 5. Тестирование

### 5.1 Локальное тестирование
1. Установите Vercel CLI: `npm i -g vercel`
2. Настройте переменные окружения:
   ```bash
   npm run setup-env
   # Затем отредактируйте .env файл
   ```
3. Запустите: `vercel dev`
4. Откройте браузер и протестируйте функционал

### 5.2 Тестирование в Telegram
1. Откройте приложение через бота
2. Проверьте добавление/удаление транзакций
3. Убедитесь, что данные синхронизируются

## 6. Возможные проблемы

### 6.1 CORS ошибки
- Убедитесь, что в Supabase настроены правильные CORS правила
- Добавьте ваш домен Vercel в список разрешенных

### 6.2 Ошибки аутентификации
- Проверьте правильность URL и ключей Supabase
- Убедитесь, что RLS политики настроены корректно

### 6.3 Проблемы с real-time
- Проверьте, что включены real-time функции в Supabase
- Убедитесь, что подписка на канал работает

## 7. Структура проекта

```
my_buh_tg/
├── index.html          # Главная страница
├── styles.css          # Стили
├── script.js           # Основная логика
├── supabase-config.js  # Конфигурация Supabase
├── supabase-schema.sql # Схема базы данных
├── vercel.json         # Конфигурация Vercel
├── package.json        # Зависимости
├── .gitignore          # Исключения Git
├── env.example         # Пример переменных окружения
├── README.md           # Документация
└── SETUP.md            # Инструкция по настройке
```

## 8. Поддержка

При возникновении проблем:
1. Проверьте консоль браузера на ошибки
2. Проверьте логи Supabase
3. Проверьте логи Vercel
4. Создайте issue в GitHub репозитории 