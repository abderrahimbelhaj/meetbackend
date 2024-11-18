const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const { OpenAI } = require('openai');
const bodyParser = require('body-parser'); // Si vous utilisez une ancienne version d'Express
const axios = require('axios');
const User = require('../models/User');
const Transcription = require('../models/transcription'); // Assurez-vous de bien importer le modèle

const Meeting = require('../models/Meeting'); // Assurez-vous que le chemin est correct
require('dotenv').config();  // To load environment variables

const router = express.Router();




// Configuration de multer pour l'upload de la photo de CIN
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cin/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });







router.post('/register/client',  async (req, res) => {
    const { nom, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = new User({
        nom,
        email,
        password: hashedPassword,
        role: 'utilisateur',
       
      });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error); // Afficher l'erreur dans la console
      res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
    }
  });
  




  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Chercher l'utilisateur par email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Ce compte n'existe pas, veuillez vous inscrire." });
      }
  
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }
  
     
  
      
  
      // Générer un token JWT avec l'ID de l'utilisateur
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '5h' });
  
      // Vérifier le rôle de l'utilisateur et retourner le message approprié
      let roleMessage = "";
      switch (user.role) {
        case 'admin':
          roleMessage = "Hello admin";
          break;
        case 'utilisateur':
          roleMessage = "Hello client";
          break;
        
        default:
          return res.status(400).json({ message: "Rôle invalide." });
      }
  
      res.status(200).json({
        message: roleMessage,
        token, // Le token qui contient l'ID de l'utilisateur
        userId: user._id // L'ID de l'utilisateur connecté
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la connexion", error });
    }
  });
  
  




// Route pour créer une réunion pour un utilisateur spécifique via son ID
router.post('/meeting/:userId', async (req, res) => {
    const { sujetReunion, date, heure, nombreParticipants } = req.body;
    const { userId } = req.params;  // Récupérer l'ID de l'utilisateur depuis l'URL
  
    try {
      // Vérification des données reçues
      if (!sujetReunion || !date || !heure || !nombreParticipants) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
      }
  
      // Création de la réunion dans la base de données
      const newMeeting = new Meeting({
        sujetReunion,
        date,
        heure,
        nombreParticipants,
        userId  // Associer la réunion à l'ID utilisateur passé dans l'URL
      });
  
      await newMeeting.save();
      res.status(201).json({
        message: 'Réunion créée avec succès',
        meeting: newMeeting
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la création de la réunion', error: error.message });
    }
  });




// Endpoint pour la transcription de l'audio
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier audio téléchargé' });
      }
  
      const filePath = req.file.path;
      const audioBytes = fs.readFileSync(filePath);
  
      const url = 'https://api.deepgram.com/v1/listen';
      const headers = {
        'Authorization': `Token 541551308b8c945dbc05b3b3e56ef731aeb3f62f`,
        'Content-Type': 'audio/mp3',
      };
  
      const params = {
        language: 'fr',
        punctuate: true,
        redaction: false,
      };
  
      const response = await axios.post(url, audioBytes, {
        headers,
        params,
      });
  
      const transcription = response.data.results.channels[0].alternatives[0].transcript;
  
     
  
      const newTranscription = new Transcription({
        audioPath: filePath,
        transcript: transcription,
      });
  
      await newTranscription.save();
      fs.unlinkSync(filePath);
  
      res.json({ transcription });
    } catch (error) {
      console.error('Error during transcription:', error);
      res.status(500).json({ error: 'Something went wrong during transcription' });
    }
  });  













// Création d'une instance OpenAI avec votre clé API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Assurez-vous d'avoir défini votre clé API dans les variables d'environnement
  });
  
  router.post('/summarize', async (req, res) => {
    const { text } = req.body; // Récupérer le texte à partir du corps de la requête
  
    // Vérification que le texte est bien fourni
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Le texte à résumer est requis.' });
    }
  
    try {
      // Demander à OpenAI de résumer le texte
      const response = await openai.completions.create({
        model: 'text-davinci-003', // Utiliser un modèle approprié d'OpenAI pour le résumé
        prompt: `Please summarize the following text: ${text}`,
        max_tokens: 200, // Limite de tokens pour le résumé
      });
  
      // Récupérer le résumé généré par OpenAI
      const summarizedText = response.choices[0].text.trim();
  
      // Renvoyer la réponse avec le résumé
      res.json({ summary: summarizedText });
    } catch (error) {
      console.error('Error during summary generation:', error);
      res.status(500).json({ error: 'Quelque chose s\'est mal passé lors de la génération du résumé' });
    }
  });

  











  module.exports = router;