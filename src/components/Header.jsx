import React from 'react'
import { Wallet } from 'lucide-react'

function Header({ totalBalance }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">
          <Wallet className="header-icon" />
          Финансовый учет
        </h1>
        

        
        <div className="balance">
          <span className="balance-label">Баланс:</span>
          <span className={`balance-amount ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totalBalance)}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header 