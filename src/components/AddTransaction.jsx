import React, { useState } from 'react'
import { Plus, DollarSign, User, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'
import { useTelegram } from '../hooks/useTelegram'

function AddTransaction({ onAdd }) {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    source: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const { telegramUserId } = useTelegram()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount) {
      alert('Заполните сумму')
      return
    }

    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      alert('Сумма должна быть больше 0')
      return
    }

    setLoading(true)
    
    try {
      const transaction = {
        type: formData.type,
        amount: amount,
        source: formData.source,
        comment: formData.comment,
        telegram_user_id: telegramUserId
      }

      await onAdd(transaction)
      
      // Сброс формы
      setFormData({
        type: 'income',
        amount: '',
        source: '',
        comment: ''
      })
      
      alert('Транзакция добавлена!')
    } catch (error) {
      alert('Ошибка добавления транзакции')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="add-transaction">
      <h2 className="section-title">Добавить транзакцию</h2>
      
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label className="form-label">
            <User className="form-icon" />
            Тип:
          </label>
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn ${formData.type === 'income' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
            >
              <TrendingUp className="type-icon" />
              Доход
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === 'expense' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
            >
              <TrendingDown className="type-icon" />
              Расход
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            <DollarSign className="form-icon" />
            Сумма (₽):
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="form-input"
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="source" className="form-label">
            <User className="form-icon" />
            От кого/на что:
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="form-input"
            placeholder="Например: Зарплата, Продукты..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            <MessageSquare className="form-icon" />
            Комментарий:
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Дополнительная информация..."
            rows="3"
          />
        </div>
        
        <button 
          type="submit" 
          className={`btn-submit ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          <Plus className="btn-icon" />
          {loading ? 'Добавление...' : 'Добавить'}
        </button>
      </form>
    </div>
  )
}

export default AddTransaction 