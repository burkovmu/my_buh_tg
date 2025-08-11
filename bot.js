const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Создаем экземпляр бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;
  
  const welcomeMessage = `👋 Привет, ${username}!

💰 Добро пожаловать в приложение финансового учета!

📱 Откройте Mini App для управления вашими финансами:
${process.env.MINI_APP_URL || 'https://my-buh-tg.vercel.app'}

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
        web_app: { url: process.env.MINI_APP_URL || 'https://my-buh-tg.vercel.app' }
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

// Обработчик команды /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `🔧 <b>Справка по командам:</b>

/start - Запуск бота и главное меню
/help - Показать эту справку
/balance - Показать текущий баланс
/transactions - Показать последние транзакции

💡 <b>Как использовать:</b>
1. Нажмите "📱 Открыть приложение" для запуска Mini App
2. В приложении добавляйте доходы и расходы
3. Используйте команды бота для быстрого просмотра

📱 <b>Mini App URL:</b>
${process.env.MINI_APP_URL || 'https://my-buh-tg.vercel.app'}`;

  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'HTML'
  });
});

// Обработчик команды /balance
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Здесь должна быть логика получения баланса из базы данных
  // Пока отправляем заглушку
  await bot.sendMessage(chatId, '💰 <b>Ваш баланс:</b>\n\nБаланс: 0 ₽\nДоходы: 0 ₽\nРасходы: 0 ₽\n\n💡 Откройте приложение для актуальных данных!', {
    parse_mode: 'HTML'
  });
});

// Обработчик команды /transactions
bot.onText(/\/transactions/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Здесь должна быть логика получения транзакций из базы данных
  // Пока отправляем заглушку
  await bot.sendMessage(chatId, '📊 <b>Последние транзакции:</b>\n\nПока нет транзакций.\n\n💡 Откройте приложение и добавьте первую транзакцию!', {
    parse_mode: 'HTML'
  });
});

// Обработчик callback запросов (кнопки)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  switch (data) {
    case 'show_balance':
      await bot.sendMessage(chatId, '💰 <b>Ваш баланс:</b>\n\nБаланс: 0 ₽\nДоходы: 0 ₽\nРасходы: 0 ₽\n\n💡 Откройте приложение для актуальных данных!', {
        parse_mode: 'HTML'
      });
      break;
      
    case 'show_transactions':
      await bot.sendMessage(chatId, '📊 <b>Последние транзакции:</b>\n\nПока нет транзакций.\n\n💡 Откройте приложение и добавьте первую транзакцию!', {
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
console.log('📱 Mini App URL:', process.env.MINI_APP_URL || 'https://my-buh-tg.vercel.app');

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