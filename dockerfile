# Use the official Node.js image from Docker Hub
FROM node:20.17.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Expose the port the app will run on (default Node.js port is 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
