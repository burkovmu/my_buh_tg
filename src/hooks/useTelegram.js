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
        const testUserId = localStorage.getItem('telegram_user_id') || 'test_user'
        setTelegramUserId(testUserId)
      }
    } else {
      // Для тестирования в браузере
      const testUserId = localStorage.getItem('telegram_user_id') || 'test_user'
      setTelegramUserId(testUserId)
    }
  }, [])

  const setTestUserId = (userId) => {
    localStorage.setItem('telegram_user_id', userId)
    setTelegramUserId(userId)
  }

  return {
    telegramUserId,
    setTestUserId
  }
} 