import React from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

function Header({ totalIncome, totalExpense, totalBalance }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <header className="header">
      <div className="header-title">
        <Wallet className="header-icon" />
        <h1>Финансовый учет</h1>
      </div>
      
      <div className="header-stats">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">Доходы</span>
            <span className="stat-value">{formatCurrency(totalIncome)}</span>
          </div>
        </div>
        
        <div className="stat-card balance">
          <div className="stat-icon">
            <Wallet />
          </div>
          <div className="stat-content">
            <span className="stat-label">Баланс</span>
            <span className={`stat-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>
        
        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown />
          </div>
          <div className="stat-content">
            <span className="stat-label">Расходы</span>
            <span className="stat-value">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 