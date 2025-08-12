import { useState, useEffect } from 'react'

export function useTelegram() {
  const [telegramUserId, setTelegramUserId] = useState(null)

  useEffect(() => {
    console.log('=== TELEGRAM DEBUG INFO ===')
    console.log('window.Telegram exists:', !!window.Telegram)
    console.log('window.Telegram.WebApp exists:', !!(window.Telegram && window.Telegram.WebApp))
    
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Telegram WebApp object:', window.Telegram.WebApp)
      console.log('initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe)
      console.log('initData:', window.Telegram.WebApp.initData)
      
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      
      // Получаем ID пользователя
      const user = window.Telegram.WebApp.initDataUnsafe?.user
      console.log('Telegram user data:', user)
      
      if (user?.id) {
        console.log('Real Telegram ID found:', user.id)
        setTelegramUserId(user.id.toString())
      } else {
        console.log('No Telegram user data, using test ID')
        // Для тестирования в браузере
        const testUserId = localStorage.getItem('telegram_user_id') || '123456789'
        setTelegramUserId(testUserId)
      }
    } else {
      console.log('Telegram Web App not available, using test ID')
      // Для тестирования в браузере
      const testUserId = localStorage.getItem('telegramUserId') || '123456789'
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