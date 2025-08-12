import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

function Stats({ totalIncome, totalExpense }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="stats">
      <div className="stat-item income">
        <TrendingUp className="stat-icon" />
        <div className="stat-content">
          <span className="stat-label">Доходы</span>
          <span className="stat-amount">{formatCurrency(totalIncome)}</span>
        </div>
      </div>
      
      <div className="stat-item expense">
        <TrendingDown className="stat-icon" />
        <div className="stat-content">
          <span className="stat-label">Расходы</span>
          <span className="stat-amount">{formatCurrency(totalExpense)}</span>
        </div>
      </div>
    </div>
  )
}

export default Stats 