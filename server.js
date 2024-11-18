const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0', // OpenAPI version
        info: {
            title: 'API Documentation', // Title of the API
            version: '1.0.0', // Version of the API
            description: 'API documentation for authentication', // Description of the API
        },
        servers: [
            {
                url: `http://91.134.19.144:${process.env.PORT || 5222}`, // Server URL
                url: `http://91.134.19.144:${process.env.PORT || 5222}`, // Server URL
            },
        ],
    },
    apis: ['./routes/*.js'], // Chemin vers les fichiers d'API
};

// Initialiser swagger-jsdoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Servir la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5222;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
