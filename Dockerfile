FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Copy prisma schema before npm install
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Prisma generate (important)
RUN npx prisma generate

# Expose backend port
EXPOSE 8000

# Start the server
CMD ["npm", "run", "start"]
