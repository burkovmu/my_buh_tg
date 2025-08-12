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
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <Loader2 style={{ width: '32px', height: '32px', margin: '0 auto 15px', display: 'block' }} />
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <MessageSquare style={{ width: '48px', height: '48px', margin: '0 auto 20px', display: 'block', opacity: 0.5 }} />
            <p>Нет транзакций для отображения</p>
          </div>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-header">
                <div>
                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <span className={`transaction-type ${transaction.type}`}>
                    {transaction.type === 'income' ? 'Доход' : 'Расход'}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(transaction.id)}
                  title="Удалить"
                >
                  Удалить
                </button>
              </div>
              
              {transaction.source && (
                <div className="transaction-source">{transaction.source}</div>
              )}
              
              {transaction.comment && (
                <div className="transaction-comment">{transaction.comment}</div>
              )}
              
              <div className="transaction-date">
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