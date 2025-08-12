import React from 'react'

function Stats({ totalIncome, totalExpense }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalBalance = totalIncome - totalExpense
  const balanceChange = totalBalance >= 0 ? '+' : ''

  return (
    <div className="stats">
      <div className="stats-header">
        <div className="stats-title">Финансовый обзор</div>
        <div className="stats-subtitle">Ваши доходы и расходы за все время</div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item income">
          <span className="stat-label">Общий доход</span>
          <span className="stat-value income">{formatCurrency(totalIncome)}</span>
          <span className="stat-change">Всего поступлений</span>
        </div>
        
        <div className="stat-item expense">
          <span className="stat-label">Общий расход</span>
          <span className="stat-value expense">{formatCurrency(totalExpense)}</span>
          <span className="stat-change">Всего трат</span>
        </div>
      </div>
    </div>
  )
}

export default Stats 