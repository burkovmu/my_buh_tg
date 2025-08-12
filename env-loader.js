// Загрузчик переменных окружения для браузера
// Этот скрипт загружает переменные окружения из Vercel

// Функция для загрузки переменных окружения
async function loadEnvironmentVariables() {
    try {
        // В Vercel переменные окружения доступны через process.env
        // Но в браузере мы можем их получить через API или встроить в HTML
        
        // Для продакшена Vercel автоматически подставит значения
        // Для разработки используем значения из .env файла
        
        // Устанавливаем глобальные переменные
        window.SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
        window.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
        
        console.log('Переменные окружения загружены:', {
            SUPABASE_URL: window.SUPABASE_URL,
            SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY ? '***' + window.SUPABASE_ANON_KEY.slice(-4) : 'не задан'
        })
        
    } catch (error) {
        console.error('Ошибка загрузки переменных окружения:', error)
        // Используем заглушки для разработки
        window.SUPABASE_URL = 'YOUR_SUPABASE_URL'
        window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'
    }
}

// Загружаем переменные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadEnvironmentVariables) 