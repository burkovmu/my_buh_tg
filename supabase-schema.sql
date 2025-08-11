-- Схема базы данных для приложения финансового учета
-- Выполните этот SQL в SQL Editor вашего проекта Supabase

-- Создание таблицы транзакций
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    source VARCHAR(255) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индекса для быстрого поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_transactions_telegram_user_id ON transactions(telegram_user_id);

-- Создание индекса для сортировки по дате
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Создание индекса для фильтрации по типу
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Создание составного индекса для быстрого поиска транзакций пользователя
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(telegram_user_id, type);

-- Включение Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Создание политики безопасности: пользователи могут видеть только свои транзакции
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (telegram_user_id = current_setting('app.telegram_user_id')::bigint);

-- Создание политики безопасности: пользователи могут добавлять только свои транзакции
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (telegram_user_id = current_setting('app.telegram_user_id')::bigint);

-- Создание политики безопасности: пользователи могут обновлять только свои транзакции
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (telegram_user_id = current_setting('app.telegram_user_id')::bigint);

-- Создание политики безопасности: пользователи могут удалять только свои транзакции
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (telegram_user_id = current_setting('app.telegram_user_id')::bigint);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Создание представления для статистики пользователя
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    telegram_user_id,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
FROM transactions
GROUP BY telegram_user_id;

-- Комментарии к таблице и колонкам
COMMENT ON TABLE transactions IS 'Таблица для хранения финансовых транзакций пользователей';
COMMENT ON COLUMN transactions.telegram_user_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN transactions.type IS 'Тип транзакции: income (доход) или expense (расход)';
COMMENT ON COLUMN transactions.amount IS 'Сумма транзакции в рублях';
COMMENT ON COLUMN transactions.source IS 'Источник дохода или назначение расхода';
COMMENT ON COLUMN transactions.comment IS 'Дополнительный комментарий к транзакции';
COMMENT ON COLUMN transactions.created_at IS 'Дата и время создания транзакции';
COMMENT ON COLUMN transactions.updated_at IS 'Дата и время последнего обновления транзакции'; 