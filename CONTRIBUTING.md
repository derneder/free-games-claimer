# 🤝 Направления по Вкладу

Правила для разработчиков, которые хотят внести вклад в Free Games Claimer.

---

## 🌟 Начинающие Шаги

### 1. Форк и Клонирование

```bash
# Fork репозитория на GitHub
# Clone ваший fork
git clone https://github.com/YOUR_USERNAME/free-games-claimer.git
cd free-games-claimer

# Настройте upstream remote
git remote add upstream https://github.com/derneder/free-games-claimer.git
```

### 2. Установка Окружения

```bash
# Проверить Node.js версию
nvm use  # От .nvmrc (18.18.2)

# Установить зависимости
npm install

# Активируются Husky pre-commit хуки (автоматически)
```

---

## 🎯 Код Оформления

### Обязательные Стандарты

#### 1. **EditorConfig**
Откройте расширение EditorConfig для вашей IDE:

- **VS Code:** EditorConfig for VS Code
- **JetBrains (WebStorm, IntelliJ):** Встроенная поддержка
- **Sublime Text:** EditorConfig

#### 2. **Type Hints и JSDoc**

**Всю JavaScript функцию нужно документировать:**

```javascript
/**
 * Фетчит данные пользователя из базы данных.
 *
 * @param {number} userId - Они пользователя
 * @param {boolean} [includeProfile=false] - Опционально: инслифировать профиль
 * @returns {Promise<Object>} Данные пользователя
 * @throws {Error} Если пользователь не найден
 *
 * @example
 * const user = await fetchUserData(42);
 * console.log(user.name);
 */
async function fetchUserData(userId, includeProfile = false) {
  // implementation
}
```

#### 3. **Название Переменных**

- сам удобочитаем, дескриптивные имена
- camelCase для переменных и функций
- UPPER_SNAKE_CASE для констант данных
- PascalCase для классов и компонентов React

```javascript
// ❌ Плохо

const u = fetchUser();
const x = 42;
function get_data() {}

// ✅ Хорошо
const currentUser = fetchUser();
const USER_MAX_AGE = 42;
function getUserData() {}
function GetUserComponent() {}  // React component
```

#### 4. **Комментарии**

Написание **ПОЧЕМУ**, не ЧТО:

```javascript
// ❌ Плохо
count++;  // increment count

// ✅ Хорошо
// Increment retry counter: we retry up to 3 times per RFC-4589
count++;

// ✅ Если конструкция сложная:
// Use setTimeout instead of setInterval to prevent overlapping
// requests when the clock is skewed (see issue #123)
timeout = setTimeout(() => {
  // ...
}, delay);
```

---

## 🚀 Git Воркфлоу

### Шаг 1: Создание Ветки

**Наименование веток:**
```
<type>/<task-id>/<description>
```

**Типы:**
- `feature/` - новая функция
- `bugfix/` - исправление ошибки
- `hotfix/` - критичное исправление production
- `refactor/` - рефакторинг
- `docs/` - документация
- `test/` - тесты
- `ci/` - CI/CD конфигурация

**Примеры:**
```bash
# ✅ Хорошо
git checkout -b feature/PROJ-123/add-user-auth
git checkout -b bugfix/PROJ-456/fix-null-pointer
git checkout -b docs/add-deployment-guide

# ❌ Плохо
git checkout -b feature1
git checkout -b fix-bug
git checkout -b update
```

### Шаг 2: Коммит На Каждые Тому

**Обязательные поле:**
- `<type>` - feat, fix, docs, style, refactor, test, chore, ci, perf, revert
- `<scope>` - (optional) область изменения (auth, api, db, etc)
- `<description>` - краткое описание

```
<type>(<scope>): <description>

[Optional body explaining the change]

[Optional footer with references]
```

**Примеры:**

```bash
# ✅ Хорошо
git commit -m "feat(auth): implement JWT token refresh"
git commit -m "fix(api): handle null values in response"
git commit -m "docs: update API documentation"
git commit -m "test(user): add validation tests"
git commit -m "refactor(db): simplify query builder"

# ❌ Плохо
git commit -m "update stuff"
git commit -m "Fixed error"
git commit -m "Add feature"
```

**Многостроковые коммиты:**

```bash
git commit -m "feat(auth): implement two-factor authentication

- Add TOTP support
- Integrate with authenticator apps
- Add recovery codes

Fixes #123
Closes #456"
```

### Шаг 3: Отправка и Pull Request

```bash
# Обновить upstream
git fetch upstream
git rebase upstream/implementation

# Отправить в fork
git push origin feature/PROJ-123/your-feature

# Открыть Pull Request на GitHub
```

---

## 🔍 Pre-Commit Чеклист

**Автоматически выполняется Husky:**

```bash
✔️ Prettier (code formatting)
✔️ ESLint (code quality)
✔️ TypeScript (type checking)
```

**Если ошибка:**
```bash
# Автоматически исправить
npm run format
npm run lint

# Опять
git add .
git commit -m "your message"
```

---

## 🧠 Pull Request Чеклист

**Перед сохранением PR:**

- [ ] Название PR следует конвенции (feat/fix/etc)
- [ ] Описание PR детально
- [ ] PR размер < 200 строк (макс 400)
- [ ] Все коммиты следуют Conventional Commits
- [ ] Нет debug statements (console.log, debugger)
- [ ] Нет commented-out кода
- [ ] Нет hardcoded паролей/ключей
- [ ] Добавлен JSDoc для всех public функций
- [ ] Добавлены тесты (минимум 80% coverage)
- [ ] Обновлена документация
- [ ] Нет breaking changes (without deprecation)
- [ ] CI чеки проходят

---

## 📚 Тестирование

### Рунить тесты

```bash
# Все тесты
npm run test

# С откладкой
npm run test:watch

# О покрытии
npm run test:coverage
```

### Как написать тесты

```javascript
// пример: backend/tests/user.test.js

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = await UserService.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(result.id).toBeDefined();
    });

    it('should throw error with invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Test',
      };

      await expect(UserService.createUser(invalidData)).rejects.toThrow(
        'Invalid email format'
      );
    });
  });
});
```

---

## 🔒 Секурность

### Обязательные Проверки

- ✔️ Не коммить `.env` или секреты
- ✔️ Все секреты в `.env.example` должны быть нормальными структурой (без реальных значений)
- ✔️ Validate user input — prevent SQL injection
- ✔️ Use prepared statements
- ✔️ Hash passwords with bcrypt
- ✔️ Enable CORS properly (not wildcard)

---

## 💫 Опросы?

При вопросах см. [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

---

Пспасибо за вклад! 🌟
