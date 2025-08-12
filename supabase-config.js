// Supabase конфигурация
// В Vercel эти значения будут заменены на реальные через переменные окружения
// Для локальной разработки замените на ваши реальные значения

// ЗАМЕНИТЕ ЭТИ ЗНАЧЕНИЯ НА ВАШИ РЕАЛЬНЫЕ ДАННЫЕ ИЗ SUPABASE!
const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

// Инициализация Supabase клиента
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Функция для получения Telegram ID пользователя
function getTelegramUserId() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
        return window.Telegram.WebApp.initDataUnsafe.user?.id
    }
    // Для тестирования в браузере
    return localStorage.getItem('telegram_user_id') || 'test_user'
}

// Функция для установки Telegram ID (для тестирования)
function setTelegramUserId(userId) {
    localStorage.setItem('telegram_user_id', userId)
}

// Делаем функции доступными глобально
window.getTelegramUserId = getTelegramUserId
window.setTelegramUserId = setTelegramUserId
window.supabaseClient = supabaseClient 