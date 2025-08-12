import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export function useSupabase() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
    setupRealtimeSubscription()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      // Загружаем транзакции с фильтрацией по пользователю
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    supabase
      .channel('transactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' }, 
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
      // Добавляем telegram_user_id из параметра
      const { type, amount, source, comment, telegram_user_id } = transaction
      const transactionData = {
        type,
        amount,
        source,
        comment,
        telegram_user_id: telegram_user_id || 'test_user' // Используем переданный ID или тестовый
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