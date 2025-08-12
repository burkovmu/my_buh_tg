import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Stats from './components/Stats'
import AddTransaction from './components/AddTransaction'
import TransactionsList from './components/TransactionsList'
import { useSupabase } from './hooks/useSupabase'
import { useTelegram } from './hooks/useTelegram'
import './App.css'

function App() {
  const { supabase, transactions, addTransaction, deleteTransaction, loading } = useSupabase()
  const { telegramUserId } = useTelegram()
  const [currentFilter, setCurrentFilter] = useState('all')

  const filteredTransactions = currentFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === currentFilter)

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpense

  return (
    <div className="app">
      <Header 
        telegramUserId={telegramUserId} 
        totalBalance={totalBalance} 
      />
      
      <Stats 
        totalIncome={totalIncome} 
        totalExpense={totalExpense} 
      />
      
      <AddTransaction onAdd={addTransaction} />
      
      <TransactionsList
        transactions={filteredTransactions}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onDelete={deleteTransaction}
        loading={loading}
      />
    </div>
  )
}

export default App 