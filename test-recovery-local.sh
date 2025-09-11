#!/bin/bash

echo "🧪 Test du système d'authentification et de chargement"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de test
URL="http://localhost:3002"

echo "📝 Test 1: Vérification que le serveur répond"
echo "----------------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" $URL)
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Serveur accessible (HTTP $response)${NC}"
else
    echo -e "${RED}❌ Serveur inaccessible (HTTP $response)${NC}"
    exit 1
fi

echo ""
echo "📝 Test 2: Vérification du contenu de la page"
echo "----------------------------------------------"
content=$(curl -s $URL)

# Vérifier si on a "Chargement..." dans la page
if echo "$content" | grep -q "Chargement..."; then
    echo -e "${YELLOW}⚠️ La page contient 'Chargement...'${NC}"
    
    # Attendre 4 secondes et retester
    echo "   Attente de 4 secondes pour voir si le chargement se termine..."
    sleep 4
    content2=$(curl -s $URL)
    if echo "$content2" | grep -q "Chargement..."; then
        echo -e "${RED}   ❌ Toujours en chargement après 4 secondes${NC}"
    else
        echo -e "${GREEN}   ✅ Chargement terminé${NC}"
    fi
fi

# Vérifier si on a le titre EffiZen-AI
if echo "$content" | grep -q "EffiZen-AI"; then
    echo -e "${GREEN}✅ Titre 'EffiZen-AI' présent${NC}"
else
    echo -e "${RED}❌ Titre 'EffiZen-AI' absent${NC}"
fi

# Vérifier si on a des éléments de login
if echo "$content" | grep -q "email"; then
    echo -e "${GREEN}✅ Éléments de connexion détectés${NC}"
else
    echo -e "${YELLOW}⚠️ Pas d'éléments de connexion visibles${NC}"
fi

echo ""
echo "📝 Test 3: Test de la page de login directe"
echo "----------------------------------------------"
login_content=$(curl -s $URL/login)
if echo "$login_content" | grep -q "Connexion\|email\|password"; then
    echo -e "${GREEN}✅ Page de login accessible${NC}"
else
    echo -e "${RED}❌ Page de login non accessible${NC}"
fi

echo ""
echo "📝 Test 4: Vérification de la production"
echo "----------------------------------------------"
prod_response=$(curl -s -o /dev/null -w "%{http_code}" https://effizen-ai-prod.vercel.app)
if [ "$prod_response" = "200" ]; then
    echo -e "${GREEN}✅ Production accessible (HTTP $prod_response)${NC}"
    
    # Vérifier le contenu
    prod_content=$(curl -s https://effizen-ai-prod.vercel.app)
    if echo "$prod_content" | grep -q "Chargement..."; then
        echo -e "${YELLOW}   ⚠️ Production affiche 'Chargement...'${NC}"
    else
        echo -e "${GREEN}   ✅ Production ne reste pas en chargement${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Production non testée (HTTP $prod_response)${NC}"
fi

echo ""
echo "=================================================="
echo "📊 Résumé des tests"
echo "=================================================="
echo -e "${GREEN}Tests terminés. Vérifiez les résultats ci-dessus.${NC}"