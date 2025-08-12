import React from 'react'
import { Trash2, Calendar, MessageSquare, Loader2 } from 'lucide-react'

function TransactionsList({ transactions, currentFilter, onFilterChange, onDelete, loading }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleDelete = async (id) => {
    if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      try {
        await onDelete(id)
      } catch (error) {
        alert('Ошибка удаления транзакции')
        console.error(error)
      }
    }
  }

  if (loading) {
    return (
      <div className="transactions">
        <h2 className="section-title">История транзакций</h2>
        <div className="loading">
          <Loader2 className="loading-icon" />
          <span>Загрузка транзакций...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="transactions">
      <h2 className="section-title">История транзакций</h2>
      
      <div className="filters">
        <button
          className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          Все
        </button>
        <button
          className={`filter-btn ${currentFilter === 'income' ? 'active' : ''}`}
          onClick={() => onFilterChange('income')}
        >
          Доходы
        </button>
        <button
          className={`filter-btn ${currentFilter === 'expense' ? 'active' : ''}`}
          onClick={() => onFilterChange('expense')}
        >
          Расходы
        </button>
      </div>
      
      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="no-transactions">
            <MessageSquare className="no-transactions-icon" />
            <p>Нет транзакций для отображения</p>
          </div>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-header">
                <span className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(transaction.id)}
                  title="Удалить"
                >
                  <Trash2 className="delete-icon" />
                </button>
              </div>
              
              <div className="transaction-source">{transaction.source}</div>
              
              {transaction.comment && (
                <div className="transaction-comment">
                  <MessageSquare className="comment-icon" />
                  {transaction.comment}
                </div>
              )}
              
              <div className="transaction-date">
                <Calendar className="date-icon" />
                {formatDate(transaction.created_at || transaction.date)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TransactionsList 