# project021
Урезанная версия для подключения к Rust Axum API

В этой версии:
* закомментирована связка с предыдущим .NET API, а также большинство незадействованных методов и компонентов
* Обновлены версии зависимостей
* Переписаны файлы docker, nginx и entrypoint
* Билд собирается в папке dist

### Функционал
* Авторизация
* Регистрация
* Создание проекта
* Получение проекта

### API
Подключение к серверу в файле `app/src/helpers/constants.ts`

Аутентификация через JWT, токен обновляется после каждого действия с записью через переменную в файле `app/src/api/request.ts`

**Postman**

    https://www.postman.com/avionics-geologist-93041432/workspace/exchange-2/request/25965762-dbac374f-9b80-4695-861b-0ae40b94250c
    
#### Примечание
В настройках CORS сервера необходимо указать URL веб-ресурса, для подтверждения передачи данных

### Режим разработки
Для поддержания работоспособности зависимостей используется Node v.14

    cd app
    nvm i 14
    yarn
    yarn start
    
### Запуск Docker
На основе платформы Nginx, упрощённая версия, без SSL

Единоразовый билд через `yarn build`, без SSR

**Порт:** 80

    docker-compose up

Пересобрать образ

    docker-compose up --build
    
Создание контейнера на основе уже собранного образа

    docker run -it --rm -d -p 80:80 --name CONTAINER_NAME project021-app

Остановить все контейнеры

    docker stop $(docker ps -a -q)

Остановить один контейнер

    docker stop CONTAINER_NAME

Удалить все контейнеры

    docker rm $(docker ps -a -q)

Удалить один контейнер

    docker rm CONTAINER_NAME