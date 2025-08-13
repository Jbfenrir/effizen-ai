#!/bin/bash

# Script pour démarrer l'application EffiZen-AI

echo "🚀 Démarrage d'EffiZen-AI..."

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install --legacy-peer-deps
fi

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant! Copie depuis env.example..."
    cp env.example .env
fi

# Démarrer l'application
echo "🌐 Lancement du serveur de développement..."
npm run dev -- --host --port 3000