/**
 * Сервис для взаимодействия с Telegram Web App API
 */

// Получаем экземпляр Telegram Web App
const tg = window.Telegram?.WebApp;

// Сервис для работы с Telegram WebApp
const telegramService = {
  /**
   * Инициализация Telegram Web App
   */
  init() {
    if (!tg) {
      console.error('Telegram WebApp не найден');
      return false;
    }

    // Сообщаем Telegram, что приложение готово к отображению
    tg.ready();
    
    // Настраиваем внешний вид, используя тему Telegram
    this.setThemeParams();
    
    // Устанавливаем действие основной кнопки (если нужно)
    // this.setMainButton('Обновить', this.onMainButtonClick);
    
    return true;
  },

  /**
   * Настройка темы в соответствии с темой Telegram
   */
  setThemeParams() {
    if (!tg) return;

    // Применяем цвета из темы Telegram к CSS переменным
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#17212b');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#7d8b99');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#64beff');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2ea6ff');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#232e3c');
    document.documentElement.style.setProperty('--card-bg-color', tg.themeParams.secondary_bg_color || '#232e3c');
  },

  /**
   * Настройка главной кнопки
   * @param {string} text Текст кнопки
   * @param {Function} callback Функция-обработчик нажатия
   */
  setMainButton(text, callback) {
    if (!tg) return;

    tg.MainButton.text = text;
    
    // Устанавливаем обработчик
    if (callback) {
      tg.MainButton.onClick(callback);
    }
    
    // Показываем кнопку
    tg.MainButton.show();
  },

  /**
   * Обработчик нажатия основной кнопки
   */
  onMainButtonClick() {
    // Пример действия при нажатии кнопки
    alert('Данные обновлены!');
    // Или вызов функции обновления данных
  },

  /**
   * Отправка данных в Telegram
   * @param {Object} data Данные для отправки
   */
  sendData(data) {
    if (!tg) return;
    
    tg.sendData(JSON.stringify(data));
  },

  /**
   * Закрытие Web App
   */
  close() {
    if (!tg) return;
    
    tg.close();
  },

  /**
   * Показать уведомление в Telegram
   * @param {string} message Текст уведомления
   */
  showAlert(message) {
    if (!tg) return;
    
    tg.showAlert(message);
  },

  /**
   * Показать всплывающее сообщение в нижней части экрана
   * @param {string} message Текст сообщения
   */
  showPopup(message) {
    if (!tg) return;
    
    tg.showPopup({
      message
    });
  },

  /**
   * Получить данные пользователя
   * @returns {Object|null} Данные пользователя или null
   */
  getUserInfo() {
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
      return null;
    }
    
    return tg.initDataUnsafe.user;
  },
  
  /**
   * Отправить событие в бот
   * @param {string} eventName Название события
   * @param {Object} eventData Данные события
   */
  postEvent(eventName, eventData = {}) {
    if (!tg) return;
    
    tg.sendData(JSON.stringify({
      event: eventName,
      data: eventData
    }));
  }
};

export default telegramService;