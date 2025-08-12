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
        <span className="stat-label">Доходы</span>
        <span className="stat-value income">{formatCurrency(totalIncome)}</span>
      </div>
      
      <div className="stat-item expense">
        <span className="stat-label">Расходы</span>
        <span className="stat-value expense">{formatCurrency(totalExpense)}</span>
      </div>
    </div>
  )
}

export default Stats 