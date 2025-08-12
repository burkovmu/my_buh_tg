import { useState, useEffect } from 'react'

export function useTelegram() {
  const [telegramUserId, setTelegramUserId] = useState(null)

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      
      // Получаем ID пользователя
      const user = window.Telegram.WebApp.initDataUnsafe?.user
      if (user?.id) {
        setTelegramUserId(user.id)
      } else {
        // Для тестирования в браузере
        const testUserId = localStorage.getItem('telegram_user_id') || '123456789'
        setTelegramUserId(testUserId)
      }
    } else {
      // Для тестирования в браузере
      const testUserId = localStorage.getItem('telegram_user_id') || '123456789'
      setTelegramUserId(testUserId)
    }
  }, [])

  const setTestUserId = (userId) => {
    // Убеждаемся, что userId - это число
    const numericUserId = parseInt(userId) || 123456789
    localStorage.setItem('telegram_user_id', numericUserId.toString())
    setTelegramUserId(numericUserId.toString())
  }

  return {
    telegramUserId,
    setTestUserId
  }
} 