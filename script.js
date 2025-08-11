// Класс для управления финансовыми транзакциями с Supabase
class FinanceManager {
    constructor() {
        this.transactions = [];
        this.currentFilter = 'all';
        this.telegramUserId = null;
        this.supabase = null;
        this.init();
    }

    async init() {
        try {
            // Инициализируем Supabase
            await this.initSupabase();
            
            // Получаем Telegram ID пользователя
            this.telegramUserId = window.getTelegramUserId();
            
            // Обновляем UI с информацией о пользователе
            this.updateUserInfo();
            
            // Загружаем транзакции из Supabase
            await this.loadTransactions();
            
            // Настраиваем обработчики событий
            this.setupEventListeners();
            
            // Обновляем UI
            this.updateUI();
            this.renderTransactions();
            
            // Настраиваем real-time подписку
            this.setupRealtimeSubscription();
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showNotification('Ошибка подключения к базе данных', 'error');
        }
    }

    async initSupabase() {
        // Проверяем, что Supabase доступен
        if (typeof window.supabaseClient === 'undefined') {
            throw new Error('Supabase не загружен');
        }
        
        this.supabase = window.supabaseClient;
        
        // Инициализируем Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    }

    updateUserInfo() {
        const userIdElement = document.getElementById('userId');
        if (userIdElement) {
            userIdElement.textContent = `ID: ${this.telegramUserId}`;
        }
    }

    async loadTransactions() {
        try {
            const { data, error } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('telegram_user_id', this.telegramUserId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            this.transactions = data || [];
            console.log('Транзакции загружены:', this.transactions.length);
            
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
            this.showNotification('Ошибка загрузки данных', 'error');
        }
    }

    setupRealtimeSubscription() {
        if (!this.supabase) return;

        this.supabase
            .channel('transactions')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'transactions',
                    filter: `telegram_user_id=eq.${this.telegramUserId}`
                }, 
                (payload) => {
                    console.log('Real-time обновление:', payload);
                    this.handleRealtimeUpdate(payload);
                }
            )
            .subscribe();
    }

    handleRealtimeUpdate(payload) {
        if (payload.eventType === 'INSERT') {
            // Новая транзакция
            this.transactions.unshift(payload.new);
            this.updateUI();
            this.renderTransactions();
            this.showNotification('Новая транзакция синхронизирована!', 'success');
        } else if (payload.eventType === 'DELETE') {
            // Удалена транзакция
            this.transactions = this.transactions.filter(t => t.id !== payload.old.id);
            this.updateUI();
            this.renderTransactions();
        } else if (payload.eventType === 'UPDATE') {
            // Обновлена транзакция
            const index = this.transactions.findIndex(t => t.id === payload.new.id);
            if (index !== -1) {
                this.transactions[index] = payload.new;
                this.updateUI();
                this.renderTransactions();
            }
        }
    }

    setupEventListeners() {
        // Форма добавления транзакции
        const form = document.getElementById('transactionForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Фильтры
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const type = document.getElementById('type').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const source = document.getElementById('source').value;
        const comment = document.getElementById('comment').value;

        if (amount <= 0) {
            this.showNotification('Сумма должна быть больше 0', 'error');
            return;
        }

        const transaction = {
            type: type,
            amount: amount,
            source: source,
            comment: comment,
            telegram_user_id: this.telegramUserId
        };

        try {
            await this.addTransaction(transaction);
            e.target.reset();
            this.showNotification('Транзакция добавлена!', 'success');
        } catch (error) {
            console.error('Ошибка добавления транзакции:', error);
            this.showNotification('Ошибка добавления транзакции', 'error');
        }
    }

    async addTransaction(transaction) {
        try {
            const { data, error } = await this.supabase
                .from('transactions')
                .insert([transaction])
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Транзакция будет добавлена через real-time обновление
            console.log('Транзакция добавлена в Supabase:', data);
            
        } catch (error) {
            console.error('Ошибка добавления в Supabase:', error);
            throw error;
        }
    }

    async deleteTransaction(id) {
        if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('telegram_user_id', this.telegramUserId);

            if (error) {
                throw error;
            }

            // Транзакция будет удалена через real-time обновление
            this.showNotification('Транзакция удалена!', 'success');
            
        } catch (error) {
            console.error('Ошибка удаления транзакции:', error);
            this.showNotification('Ошибка удаления транзакции', 'error');
        }
    }

    handleFilterClick(e) {
        const filter = e.target.dataset.filter;
        
        // Обновляем активную кнопку
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.currentFilter = filter;
        this.renderTransactions();
    }

    updateUI() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalBalance = totalIncome - totalExpense;

        // Обновляем отображение
        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpense').textContent = this.formatCurrency(totalExpense);
        document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance);
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        const filteredTransactions = this.getFilteredTransactions();
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = '<div class="no-transactions">Нет транзакций для отображения</div>';
            return;
        }

        container.innerHTML = filteredTransactions
            .map(transaction => this.createTransactionHTML(transaction))
            .join('');

        // Добавляем обработчики для кнопок удаления
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = parseInt(e.target.closest('.transaction-item').dataset.id);
                this.deleteTransaction(transactionId);
            });
        });
    }

    getFilteredTransactions() {
        if (this.currentFilter === 'all') {
            return this.transactions;
        }
        return this.transactions.filter(t => t.type === this.currentFilter);
    }

    createTransactionHTML(transaction) {
        const date = new Date(transaction.created_at || transaction.date);
        const isIncome = transaction.type === 'income';
        
        return `
            <div class="transaction-item ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-header">
                    <span class="transaction-amount ${transaction.type}">
                        ${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </span>
                    <button class="delete-btn" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="transaction-source">${transaction.source}</div>
                ${transaction.comment ? `<div class="transaction-comment">${transaction.comment}</div>` : ''}
                <div class="transaction-date">${this.formatDate(date)}</div>
            </div>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    async exportData() {
        try {
            const dataStr = JSON.stringify(this.transactions, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `transactions_${this.telegramUserId}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Данные экспортированы!', 'success');
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.showNotification('Ошибка экспорта данных', 'error');
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            const importedTransactions = JSON.parse(text);
            
            if (!Array.isArray(importedTransactions)) {
                throw new Error('Неверный формат файла');
            }

            // Проверяем структуру данных
            const validTransactions = importedTransactions.filter(t => 
                t.type && t.amount && t.source && 
                ['income', 'expense'].includes(t.type)
            );

            if (validTransactions.length === 0) {
                throw new Error('Нет валидных транзакций в файле');
            }

            // Добавляем telegram_user_id к импортированным транзакциям
            const transactionsToImport = validTransactions.map(t => ({
                ...t,
                telegram_user_id: this.telegramUserId
            }));

            // Импортируем в Supabase
            const { error } = await this.supabase
                .from('transactions')
                .insert(transactionsToImport);

            if (error) {
                throw error;
            }

            this.showNotification(`Импортировано ${validTransactions.length} транзакций!`, 'success');
            
        } catch (error) {
            console.error('Ошибка импорта:', error);
            this.showNotification(`Ошибка импорта: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        // Цвета для разных типов
        if (type === 'success') {
            notification.style.backgroundColor = '#48bb78';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f56565';
        } else {
            notification.style.backgroundColor = '#4299e1';
        }

        document.body.appendChild(notification);

        // Удаляем через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new FinanceManager();
});

// Добавляем кнопки экспорта/импорта в HTML
document.addEventListener('DOMContentLoaded', () => {
    const transactionsDiv = document.querySelector('.transactions');
    if (transactionsDiv) {
        const exportImportDiv = document.createElement('div');
        exportImportDiv.className = 'export-import';
        exportImportDiv.innerHTML = `
            <button class="btn-export" onclick="window.financeManager.exportData()">
                <i class="fas fa-download"></i> Экспорт
            </button>
            <label class="btn-import" for="importFile">
                <i class="fas fa-upload"></i> Импорт
                <input type="file" id="importFile" accept=".json" style="display: none;" 
                       onchange="window.financeManager.importData(this.files[0])">
            </label>
        `;
        transactionsDiv.appendChild(exportImportDiv);
    }
}); 