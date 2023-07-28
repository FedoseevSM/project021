# stage1 as builder
FROM node:14-buster as builder

# copy the package.json to install dependencies
COPY . .

# Install the dependencies and make the folder
RUN yarn

WORKDIR /app

COPY . .

# Build the project and copy the files
RUN yarn build
RUN mkdir ./dist
RUN mv ./build/* ./dist


FROM nginx:latest as production
WORKDIR /app

# Copy from the stahg 1
COPY --from=builder /app/dist /app/
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]