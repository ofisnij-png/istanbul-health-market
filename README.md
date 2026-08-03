# Istanbul Health Market — полный сайт

## Что уже есть
- Клиентская витрина без кнопки администратора
- Поиск по товарам
- Фото, цена, остаток и срок годности
- Корзина
- Отправка заказа в WhatsApp
- Отдельная защищённая страница `/login`
- Админка `/admin`
- Загрузка фото и добавление товаров
- База Supabase

## Как получить настоящую ссылку

### 1. Создайте Supabase
1. Откройте supabase.com и создайте бесплатный проект.
2. В SQL Editor вставьте файл `supabase/setup.sql` и нажмите Run.
3. В Authentication → Users создайте своего администратора: email + пароль.
4. В Project Settings → API скопируйте Project URL и anon public key.

### 2. Подготовьте переменные
Скопируйте `.env.example` в `.env.local` и вставьте:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_WHATSAPP_NUMBER=79289580400

### 3. Запустите на компьютере
```bash
npm install
npm run dev
```
Откройте http://localhost:3000

### 4. Получите бесплатную ссылку через Vercel
1. Загрузите проект в GitHub.
2. Откройте vercel.com → Add New Project.
3. Выберите репозиторий.
4. Добавьте те же переменные Environment Variables.
5. Нажмите Deploy.

После этого получите ссылку вида:
`https://istanbul-health-market.vercel.app`

Клиенту отправляйте главную ссылку `/`.
Админка открывается только через `/login`.
