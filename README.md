# Istanbul Health Market — каталог с заказом в WhatsApp

## Что работает
- публичная витрина товаров;
- поиск, категории, цены, наличие, срок годности;
- корзина;
- отправка готового заказа в WhatsApp на +7 928 958-04-00;
- вход администратора;
- добавление, изменение и удаление товаров;
- загрузка фотографий в Supabase Storage.

## 1. Supabase
1. Откройте `SQL Editor`.
2. Вставьте содержимое файла `supabase/setup.sql` и нажмите Run.
3. Authentication → Users → Add user. Создайте свой email и пароль.
4. Table Editor → `admins` → Insert row. В поле `user_id` вставьте ID созданного пользователя.

## 2. Vercel Environment Variables
Добавьте:
- `NEXT_PUBLIC_SUPABASE_URL` = адрес проекта, например `https://xxxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Publishable key `sb_publishable_...`
- `NEXT_PUBLIC_WHATSAPP_NUMBER` = `79289580400`

## 3. GitHub
Загрузите все файлы проекта в корень репозитория и нажмите Commit changes. Vercel автоматически выполнит deploy.

## Админка
Откройте `/admin`, например:
`https://ваш-сайт.vercel.app/admin`

Важно: WhatsApp открывается у клиента с уже составленным заказом. Для полностью автоматической отправки сообщений без нажатия клиента нужен платный WhatsApp Business Cloud API.
