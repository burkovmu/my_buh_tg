import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Читаем ключи из переменных окружения
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Создаем клиент только если ключи валидные
const supabase = supabaseUrl && supabaseKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseKey !== 'your-anon-key-here'
  ? createClient(supabaseUrl, supabaseKey)
  : null

export function useSupabase(telegramUserId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  // Логируем для отладки
  console.log('useSupabase initialized with:', {
    telegramUserId,
    supabaseUrl: supabaseUrl ? 'configured' : 'not configured',
    supabaseKey: supabaseKey ? 'configured' : 'not configured',
    supabase: supabase ? 'connected' : 'not connected'
  })

  useEffect(() => {
    if (telegramUserId) {
      loadTransactions()
      setupRealtimeSubscription()
    }
  }, [telegramUserId])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      
      // Если Supabase не настроен, загружаем из localStorage
      if (!supabase) {
        console.warn('Supabase не настроен. Загружаю из localStorage.')
        const stored = localStorage.getItem(`transactions_${telegramUserId}`)
        if (stored) {
          setTransactions(JSON.parse(stored))
        } else {
          setTransactions([])
        }
        return
      }
      
      // Загружаем транзакции только для текущего пользователя
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Сохраняем в localStorage как backup
      localStorage.setItem(`transactions_${telegramUserId}`, JSON.stringify(data || []))
      setTransactions(data || [])
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error)
      // Пытаемся загрузить из localStorage
      const stored = localStorage.getItem(`transactions_${telegramUserId}`)
      if (stored) {
        setTransactions(JSON.parse(stored))
      } else {
        setTransactions([])
      }
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
          console.log('Realtime событие:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new, ...prev])
            console.log('Транзакция добавлена через realtime')
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id))
            console.log('Транзакция удалена через realtime')
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => prev.map(t => 
              t.id === payload.new.id ? payload.new : t
            ))
            console.log('Транзакция обновлена через realtime')
          }
        }
      )
      .subscribe()
  }

  const addTransaction = async (transaction) => {
    try {
      // Создаем новую транзакцию
      const newTransaction = {
        id: Date.now(),
        ...transaction,
        created_at: new Date().toISOString()
      }

      if (!supabase) {
        console.warn('Supabase не настроен. Сохраняю в localStorage.')
        // Добавляем в локальное состояние и localStorage
        const updatedTransactions = [newTransaction, ...transactions]
        setTransactions(updatedTransactions)
        localStorage.setItem(`transactions_${telegramUserId}`, JSON.stringify(updatedTransactions))
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

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()

      if (error) throw error
      
      // Получаем созданную транзакцию с правильным ID от Supabase
      const createdTransaction = data?.[0]
      if (createdTransaction) {
        console.log('Транзакция успешно добавлена в Supabase:', createdTransaction)
        // Обновляем локальное состояние
        setTransactions(prev => [createdTransaction, ...prev])
        // Обновляем localStorage
        const updatedTransactions = [createdTransaction, ...transactions]
        localStorage.setItem(`transactions_${telegramUserId}`, JSON.stringify(updatedTransactions))
        console.log('Локальное состояние обновлено')
      } else {
        console.warn('Транзакция добавлена, но данные не получены обратно')
      }
    } catch (error) {
      console.error('Ошибка добавления транзакции:', error)
      throw error
    }
  }

  const deleteTransaction = async (id) => {
    try {
      if (!supabase) {
        console.warn('Supabase не настроен. Удаляю из localStorage.')
        // Удаляем из локального состояния и localStorage
        const updatedTransactions = transactions.filter(t => t.id !== id)
        setTransactions(updatedTransactions)
        localStorage.setItem(`transactions_${telegramUserId}`, JSON.stringify(updatedTransactions))
        return
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      console.log('Транзакция успешно удалена из Supabase, ID:', id)
      // Обновляем локальное состояние
      setTransactions(prev => prev.filter(t => t.id !== id))
      // Обновляем localStorage
      const updatedTransactions = transactions.filter(t => t.id !== id)
      localStorage.setItem(`transactions_${telegramUserId}`, JSON.stringify(updatedTransactions))
      console.log('Локальное состояние обновлено после удаления')
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