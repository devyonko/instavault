# Base image
FROM node:18-alpine

# Install Python and dependencies for yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Build the Next.js app
RUN npm run build

# Install yt-dlp globally
RUN python3 -m pip install yt-dlp

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
