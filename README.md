# OstashkovAG-Back
Бэкенд проект для лаборатории РТУ МИРЭА.
Является сервисом для автоматизации процесса отслеживания актуальных мероприятий в провинциальном городке Осташков. 
Пользователям дается возможность отслеживать события, о которых им придет оповещение на почту. Пользователи могу оставлять отзывы о событиях.
Имеется возможность оставить заявку на события и сообщение о неисправности в городе, некоторые функции доступны только авторизованным пользователем
# Архитектура
Так как проект является небольшим и не высоконагруженным, в нем лучше использовать монолитную архитектуру
# Запуск
Для правильной работы приложения требуется СУБД PostgreSQL, в которой просто требуется создать БД, в файле .env необходимо указать DATABASE_USER - пользователя, DATABASE_PASSWORD - пароль, DATABASE_NAME - название БД.
Для запуска требуется из директории ostashkovag выполнить команду
```
npm i
npm start
```
# Swagger
После запуска по маршруту /adpi-docs доступно описание всех эндпоинтов
