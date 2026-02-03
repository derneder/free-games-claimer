import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    ns: ['common', 'games', 'admin', 'analytics'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: {
        common: {
          'language': 'English',
          'dashboard': 'Dashboard',
          'games': 'Games',
          'analytics': 'Analytics',
          'admin': 'Admin',
          'settings': 'Settings',
          'logout': 'Logout',
          'login': 'Login',
          'register': 'Register',
          'welcome': 'Welcome to Free Games Claimer',
          'totalValue': 'Total Value',
          'gamesClaimed': 'Games Claimed',
          'activeUsers': 'Active Users'
        }
      },
      es: {
        common: {
          'language': 'Español',
          'dashboard': 'Panel de Control',
          'games': 'Juegos',
          'analytics': 'Analítica',
          'admin': 'Administrador',
          'settings': 'Configuración',
          'logout': 'Cerrar Sesión',
          'login': 'Iniciar Sesión',
          'register': 'Registrarse',
          'welcome': 'Bienvenido a Free Games Claimer',
          'totalValue': 'Valor Total',
          'gamesClaimed': 'Juegos Reclamados',
          'activeUsers': 'Usuarios Activos'
        }
      },
      ru: {
        common: {
          'language': 'Русский',
          'dashboard': 'Панель',
          'games': 'Игры',
          'analytics': 'Аналитика',
          'admin': 'Администратор',
          'settings': 'Параметры',
          'logout': 'Выход',
          'login': 'Вход',
          'register': 'Регистрация',
          'welcome': 'Добро пожаловать в Free Games Claimer',
          'totalValue': 'Общая Стоимость',
          'gamesClaimed': 'Игры Получены',
          'activeUsers': 'Активные Пользователи'
        }
      },
      de: {
        common: {
          'language': 'Deutsch',
          'dashboard': 'Dashboard',
          'games': 'Spiele',
          'analytics': 'Analytik',
          'admin': 'Administrator',
          'settings': 'Einstellungen',
          'logout': 'Abmelden',
          'login': 'Anmelden',
          'register': 'Registrieren',
          'welcome': 'Willkommen bei Free Games Claimer',
          'totalValue': 'Gesamtwert',
          'gamesClaimed': 'Spiele Beansprucht',
          'activeUsers': 'Aktive Benutzer'
        }
      },
      fr: {
        common: {
          'language': 'Français',
          'dashboard': 'Tableau de Bord',
          'games': 'Jeux',
          'analytics': 'Analytique',
          'admin': 'Administrateur',
          'settings': 'Paramètres',
          'logout': 'Déconnexion',
          'login': 'Connexion',
          'register': 'Inscription',
          'welcome': 'Bienvenue sur Free Games Claimer',
          'totalValue': 'Valeur Totale',
          'gamesClaimed': 'Jeux Réclamés',
          'activeUsers': 'Utilisateurs Actifs'
        }
      },
      zh: {
        common: {
          'language': '中文',
          'dashboard': '仪表板',
          'games': '游戏',
          'analytics': '分析',
          'admin': '管理员',
          'settings': '设置',
          'logout': '登出',
          'login': '登入',
          'register': '注册',
          'welcome': '欢迎来到 Free Games Claimer',
          'totalValue': '总价值',
          'gamesClaimed': '已领取的游戏',
          'activeUsers': '活跃用户'
        }
      },
      ja: {
        common: {
          'language': '日本語',
          'dashboard': 'ダッシュボード',
          'games': 'ゲーム',
          'analytics': '分析',
          'admin': '管理者',
          'settings': '設定',
          'logout': 'ログアウト',
          'login': 'ログイン',
          'register': '登録',
          'welcome': 'Free Games Claimerへようこそ',
          'totalValue': '総価値',
          'gamesClaimed': '請求済みゲーム',
          'activeUsers': 'アクティブユーザー'
        }
      }
    }
  });

export default i18n;
