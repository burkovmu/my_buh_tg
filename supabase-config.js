// Supabase конфигурация
// Получаем значения из глобальных переменных, установленных в HTML
const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Проверяем, что значения установлены
if (!SUPABASE_URL || SUPABASE_URL === '%%SUPABASE_URL%%') {
    console.error('SUPABASE_URL не установлен. Проверьте переменные окружения в Vercel.');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '%%SUPABASE_ANON_KEY%%') {
    console.error('SUPABASE_ANON_KEY не установлен. Проверьте переменные окружения в Vercel.');
}

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