import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Временно используем тестовые ключи для локальной разработки
// Для работы с Supabase замените на ваши реальные ключи:
// 1. Скопируйте env.example в .env
// 2. Заполните SUPABASE_URL и SUPABASE_ANON_KEY
// 3. Или замените значения ниже напрямую

// Проверяем, что ключи не тестовые
const supabaseUrl = 'https://your-project-id.supabase.co' // Замените на ваш URL
const supabaseKey = 'your-anon-key-here' // Замените на ваш ключ

// Создаем клиент только если ключи валидные
const supabase = supabaseUrl !== 'https://your-project-id.supabase.co' && supabaseKey !== 'your-anon-key-here'
  ? createClient(supabaseUrl, supabaseKey)
  : null

export function useSupabase(telegramUserId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (telegramUserId) {
      loadTransactions()
      setupRealtimeSubscription()
    }
  }, [telegramUserId])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      
      // Если Supabase не настроен, показываем пустой массив
      if (!supabase) {
        console.warn('Supabase не настроен. Используйте тестовые данные.')
        setTransactions([])
        return
      }
      
      // Загружаем транзакции только для текущего пользователя
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error)
      // Для локальной разработки показываем пустой массив
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!supabase) return
    
    supabase
      .channel(`transactions_${telegramUserId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `telegram_user_id=eq.${telegramUserId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => prev.map(t => 
              t.id === payload.new.id ? payload.new : t
            ))
          }
        }
      )
      .subscribe()
  }

  const addTransaction = async (transaction) => {
    try {
      if (!supabase) {
        console.warn('Supabase не настроен. Транзакция не будет сохранена.')
        // Для локальной разработки добавляем в локальное состояние
        const newTransaction = {
          id: Date.now(),
          ...transaction,
          created_at: new Date().toISOString()
        }
        setTransactions(prev => [newTransaction, ...prev])
        return
      }

      // Добавляем telegram_user_id из параметра
      const { type, amount, source, comment, telegram_user_id } = transaction
      const transactionData = {
        type,
        amount,
        source,
        comment,
        telegram_user_id: telegram_user_id || 123456789 // Используем переданный ID или тестовый числовой ID
      }

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData])

      if (error) throw error
    } catch (error) {
      console.error('Ошибка добавления транзакции:', error)
      throw error
    }
  }

  const deleteTransaction = async (id) => {
    try {
      if (!supabase) {
        console.warn('Supabase не настроен. Удаление из локального состояния.')
        // Для локальной разработки удаляем из локального состояния
        setTransactions(prev => prev.filter(t => t.id !== id))
        return
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Ошибка удаления транзакции:', error)
      throw error
    }
  }

  return {
    supabase,
    transactions,
    loading,
    addTransaction,
    deleteTransaction
  }
} 