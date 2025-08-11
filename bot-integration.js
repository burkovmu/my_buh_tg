const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Создаем экземпляр бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Функция для получения баланса пользователя
async function getUserBalance(telegramId) {
  try {
    // Получаем все транзакции пользователя
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('telegram_id', telegramId);

    if (error) {
      console.error('Ошибка получения транзакций:', error);
      return null;
    }

    if (!transactions || transactions.length === 0) {
      return {
        balance: 0,
        income: 0,
        expense: 0,
        count: 0
      };
    }

    // Вычисляем баланс
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else if (transaction.type === 'expense') {
        expense += transaction.amount;
      }
    });

    const balance = income - expense;

    return {
      balance,
      income,
      expense,
      count: transactions.length
    };
  } catch (error) {
    console.error('Ошибка вычисления баланса:', error);
    return null;
  }
}

// Функция для получения последних транзакций
async function getUserTransactions(telegramId, limit = 5) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('telegram_id', telegramId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Ошибка получения транзакций:', error);
      return null;
    }

    return transactions || [];
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    return null;
  }
}

// Функция для форматирования суммы
function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
}

// Функция для форматирования даты
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;
  
  // Сохраняем пользователя в базе (если нужно)
  try {
    await supabase
      .from('users')
      .upsert({
        telegram_id: telegramId,
        username: username,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
        last_activity: new Date().toISOString()
      });
  } catch (error) {
    console.error('Ошибка сохранения пользователя:', error);
  }
  
  const welcomeMessage = `👋 Привет, ${username}!

💰 Добро пожаловать в приложение финансового учета!

📱 Откройте Mini App для управления вашими финансами:
${process.env.MINI_APP_URL || 'https://your-app.vercel.app'}

🔧 Доступные команды:
/start - показать это сообщение
/help - справка по командам
/balance - показать текущий баланс
/transactions - показать последние транзакции

💡 Просто нажмите на кнопку ниже, чтобы открыть приложение!`;

  const keyboard = {
    inline_keyboard: [
      [{
        text: '📱 Открыть приложение',
        web_app: { url: process.env.MINI_APP_URL || 'https://your-app.vercel.app' }
      }],
      [{
        text: '💰 Мой баланс',
        callback_data: 'show_balance'
      }],
      [{
        text: '📊 Последние транзакции',
        callback_data: 'show_transactions'
      }]
    ]
  };

  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
});

// Обработчик команды /balance
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  
  const balance = await getUserBalance(telegramId);
  
  if (balance === null) {
    await bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
    return;
  }

  const message = `💰 <b>Ваш баланс:</b>

💵 Баланс: ${formatAmount(balance.balance)}
📈 Доходы: ${formatAmount(balance.income)}
📉 Расходы: ${formatAmount(balance.expense)}
📊 Всего транзакций: ${balance.count}

💡 Откройте приложение для управления финансами!`;

  await bot.sendMessage(chatId, message, {
    parse_mode: 'HTML'
  });
});

// Обработчик команды /transactions
bot.onText(/\/transactions/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  
  const transactions = await getUserTransactions(telegramId, 10);
  
  if (transactions === null) {
    await bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
    return;
  }

  if (transactions.length === 0) {
    await bot.sendMessage(chatId, '📊 <b>Последние транзакции:</b>\n\nПока нет транзакций.\n\n💡 Откройте приложение и добавьте первую транзакцию!', {
      parse_mode: 'HTML'
    });
    return;
  }

  let message = '📊 <b>Последние транзакции:</b>\n\n';
  
  transactions.forEach((transaction, index) => {
    const emoji = transaction.type === 'income' ? '📈' : '📉';
    const sign = transaction.type === 'income' ? '+' : '-';
    const amount = formatAmount(transaction.amount);
    const date = formatDate(transaction.date);
    
    message += `${emoji} <b>${transaction.source}</b>\n`;
    message += `   ${sign}${amount}\n`;
    if (transaction.comment) {
      message += `   💬 ${transaction.comment}\n`;
    }
    message += `   📅 ${date}\n\n`;
  });

  message += '💡 Откройте приложение для полного управления!';

  await bot.sendMessage(chatId, message, {
    parse_mode: 'HTML'
  });
});

// Обработчик callback запросов (кнопки)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id;
  const data = query.data;

  switch (data) {
    case 'show_balance':
      const balance = await getUserBalance(telegramId);
      
      if (balance === null) {
        await bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
        break;
      }

      const balanceMessage = `💰 <b>Ваш баланс:</b>

💵 Баланс: ${formatAmount(balance.balance)}
📈 Доходы: ${formatAmount(balance.income)}
📉 Расходы: ${formatAmount(balance.expense)}
📊 Всего транзакций: ${balance.count}

💡 Откройте приложение для управления финансами!`;

      await bot.sendMessage(chatId, balanceMessage, {
        parse_mode: 'HTML'
      });
      break;
      
    case 'show_transactions':
      const transactions = await getUserTransactions(telegramId, 5);
      
      if (transactions === null) {
        await bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
        break;
      }

      if (transactions.length === 0) {
        await bot.sendMessage(chatId, '📊 <b>Последние транзакции:</b>\n\nПока нет транзакций.\n\n💡 Откройте приложение и добавьте первую транзакцию!', {
          parse_mode: 'HTML'
        });
        break;
      }

      let transactionsMessage = '📊 <b>Последние транзакции:</b>\n\n';
      
      transactions.forEach((transaction) => {
        const emoji = transaction.type === 'income' ? '📈' : '📉';
        const sign = transaction.type === 'income' ? '+' : '-';
        const amount = formatAmount(transaction.amount);
        const date = formatDate(transaction.date);
        
        transactionsMessage += `${emoji} <b>${transaction.source}</b>\n`;
        transactionsMessage += `   ${sign}${amount}\n`;
        if (transaction.comment) {
          transactionsMessage += `   💬 ${transaction.comment}\n`;
        }
        transactionsMessage += `   📅 ${date}\n\n`;
      });

      transactionsMessage += '💡 Откройте приложение для полного управления!';

      await bot.sendMessage(chatId, transactionsMessage, {
        parse_mode: 'HTML'
      });
      break;
      
    default:
      await bot.sendMessage(chatId, '❌ Неизвестная команда');
  }
  
  // Отвечаем на callback query
  await bot.answerCallbackQuery(query.id);
});

// Обработчик ошибок
bot.on('error', (error) => {
  console.error('Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

// Запуск бота
console.log('🤖 Telegram бот запущен...');
console.log('📱 Mini App URL:', process.env.MINI_APP_URL || 'https://your-app.vercel.app');
console.log('🔗 Supabase URL:', process.env.SUPABASE_URL || 'Не настроен');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Останавливаем бота...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Останавливаем бота...');
  bot.stopPolling();
  process.exit(0);
}); 