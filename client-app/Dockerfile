# --------- BUILD STAGE ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build -- --configuration production
    
    # --------- SERVE STAGE ----------
    FROM nginx:alpine
    
    # Angular 17+ output folder is usually:
    # dist/client-app/browser
    COPY --from=build /app/dist/client-app/browser /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]