-- Исправление RLS политик для Supabase
-- Выполните этот SQL в SQL Editor вашего проекта Supabase

-- 1. Сначала отключим RLS временно для тестирования
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- 2. Создадим простую политику для всех операций
DROP POLICY IF EXISTS "Allow all operations" ON transactions;

CREATE POLICY "Allow all operations" ON transactions
    FOR ALL USING (true)
    WITH CHECK (true);

-- 3. Включим RLS обратно
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 4. Проверим, что политика создана
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'transactions';

-- 5. Теперь можно тестировать приложение
-- После того как все работает, можно будет настроить правильные RLS политики 