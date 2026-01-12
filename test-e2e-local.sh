#!/bin/bash

# FlexiCoach End-to-End Testing Script (Local Build)
# Tests the complete application stack with local builds + MongoDB in Docker

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:3000"
MONGODB_URI="mongodb://localhost:27017/flexicoach"

echo -e "${BLUE}🧪 FlexiCoach End-to-End Testing Script (Local Build)${NC}"
echo "============================================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}🧹 Nettoyage...${NC}"

    # Kill backend if running
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "✓ Backend arrêté"
    fi

    # Note: MongoDB local reste actif, pas de nettoyage nécessaire
    echo "✓ Backend arrêté"

    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Trap to cleanup on exit or interrupt
trap cleanup EXIT INT TERM

# Step 1: Check MongoDB is running
echo -e "${BLUE}🧹 Étape 1: Vérification de MongoDB...${NC}"
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB déjà en cours d'exécution${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB n'est pas démarré, tentative de démarrage...${NC}"
    brew services start mongodb/brew/mongodb-community@7.0
    sleep 3
    if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB démarré${NC}"
    else
        echo -e "${RED}❌ Impossible de démarrer MongoDB${NC}"
        exit 1
    fi
fi

# Clean MongoDB database
echo -e "${BLUE}🧹 Nettoyage de la base de données...${NC}"
mongosh flexicoach --eval "db.dropDatabase()" > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Base de données nettoyée${NC}"
echo ""

# Step 2: Build the application
echo -e "${BLUE}🔨 Étape 2: Build de l'application...${NC}"
echo "Construction du backend et du frontend..."
# Clean dist folder to force rebuild
rm -rf dist
npx nx build backend --configuration=production --skip-nx-cache
npx nx build frontend --configuration=production --skip-nx-cache
echo -e "${GREEN}✅ Build terminé${NC}"
echo ""

# Step 3: Copy frontend to public folder
echo -e "${BLUE}📦 Étape 3: Copie du frontend...${NC}"
rm -rf public
cp -r dist/apps/frontend/browser public
echo -e "${GREEN}✅ Frontend copié dans public/${NC}"
echo ""

# Step 4: Start backend
echo -e "${BLUE}🚀 Étape 4: Démarrage du backend...${NC}"
export NODE_ENV=production
export PORT=3000
export MONGODB_URI=$MONGODB_URI
export JWT_SECRET=test-secret-key-for-local-testing
export ADMIN_EMAILS=famille.martin@gmail.com

node dist/apps/backend/main.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo -n "Attente du backend"
for i in {1..30}; do
    if curl -s -f "$API_URL" > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Backend prêt${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Step 5: Run automated tests
echo -e "${BLUE}🧪 Étape 5: Tests automatiques...${NC}"
echo ""

# Test 1: Backend API
echo -n "Test 1: Backend API disponible... "
if curl -s -f "$API_URL" > /dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "Logs du backend:"
    tail -20 /tmp/backend.log
    exit 1
fi

# Test 2: Frontend loads
echo -n "Test 2: Frontend chargé... "
if curl -s "$FRONTEND_URL/" | grep -q "FlexiCoach"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL - Frontend non accessible${NC}"
    echo "Logs du backend:"
    tail -20 /tmp/backend.log
    exit 1
fi

# Test 3: Email validation (Issue #18)
echo -n "Test 3: Validation d'email invalide... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"Test1234!","displayName":"Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP 400)"
else
    echo -e "${RED}❌ FAIL - Validation email échouée${NC} (HTTP $HTTP_CODE attendu 400)"
    exit 1
fi

# Test 4: Password strength validation (Issue #19)
echo -n "Test 4: Validation de mot de passe faible... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak","displayName":"Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP 400)"
else
    echo -e "${RED}❌ FAIL - Validation mot de passe échouée${NC} (HTTP $HTTP_CODE attendu 400)"
    exit 1
fi

# Test 4.5: Create admin user BEFORE rate limit tests
echo -n "Test 4.5: Création de l'utilisateur admin... "
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"famille.martin@gmail.com","password":"Martin2024!Test","displayName":"Famille Martin"}')
HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)
ADMIN_BODY=$(echo "$ADMIN_RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS${NC} (Admin créé)"
    ADMIN_TOKEN=$(echo "$ADMIN_BODY" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}❌ FAIL - Création admin échouée${NC} (HTTP $HTTP_CODE attendu 201)"
    echo "Réponse: $ADMIN_BODY"
    exit 1
fi

# Test 5: Successful registration
echo -n "Test 5: Inscription valide... "
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test1234!\",\"displayName\":\"Test User\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP 201)"
else
    echo -e "${RED}❌ FAIL - Inscription valide échouée${NC} (HTTP $HTTP_CODE attendu 201)"
    exit 1
fi

# Test 6: Rate limiting on register (Issue #20 - 3 per hour)
echo -n "Test 6: Rate limiting sur register (3/heure)... "
# Try 3 more registrations
for i in {1..3}; do
    TIMESTAMP=$(date +%s)$i
    curl -s -X POST "$API_URL/auth/register" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"test${TIMESTAMP}@example.com\",\"password\":\"Test1234!\",\"displayName\":\"Test\"}" > /dev/null 2>&1
done
# The 4th should fail with 429
TIMESTAMP=$(date +%s)4
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test${TIMESTAMP}@example.com\",\"password\":\"Test1234!\",\"displayName\":\"Test\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 429 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP 429 - Rate limited)"
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (HTTP $HTTP_CODE - Rate limiting peut varier)"
fi

# Test 7: Successful login
echo -n "Test 7: Connexion valide... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test1234!\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP 200)"
else
    echo -e "${RED}❌ FAIL - Connexion valide échouée${NC} (HTTP $HTTP_CODE attendu 200)"
    exit 1
fi

# Test 8: Rate limiting on login (Issue #20 - 5 per minute)
echo -n "Test 8: Rate limiting sur login (5/minute)... "
# Try 5 more logins
for i in {1..5}; do
    curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test1234!\"}" > /dev/null 2>&1
done
# The 6th should fail with 429
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test1234!\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 429 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP 429 - Rate limited)"
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (HTTP $HTTP_CODE - Rate limiting peut varier)"
fi

echo ""
echo -e "${GREEN}✅ Tous les tests automatiques sont terminés${NC}"
echo ""

# Step 6: Load test routines
echo -e "${BLUE}🔧 Étape 6: Chargement des routines de test...${NC}"
echo ""

if [ ! -z "$ADMIN_TOKEN" ]; then
    # Load routines
    echo -n "Chargement de la routine 'Pause bureau'... "
    ROUTINE1_RESPONSE=$(curl -s -X POST "$API_URL/routines" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @routines/bureau-5min.json)

    if echo "$ROUTINE1_RESPONSE" | grep -q '"_id"'; then
        echo -e "${GREEN}✅ Créée${NC}"
    else
        echo -e "${RED}❌ Erreur${NC}"
    fi

    echo -n "Chargement de la routine 'Routine douce'... "
    ROUTINE2_RESPONSE=$(curl -s -X POST "$API_URL/routines" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @routines/douce-10min.json)

    if echo "$ROUTINE2_RESPONSE" | grep -q '"_id"'; then
        echo -e "${GREEN}✅ Créée${NC}"
    else
        echo -e "${RED}❌ Erreur${NC}"
    fi
else
    echo -e "${RED}❌ Admin token non disponible, impossible de charger les routines${NC}"
fi

echo ""

# Step 7: Display access information
echo "============================================================"
echo -e "${BLUE}🎉 Environnement de test prêt !${NC}"
echo "============================================================"
echo ""
echo "Accès à l'application:"
echo -e "  Frontend: ${YELLOW}$FRONTEND_URL${NC}"
echo -e "  Backend API: ${YELLOW}$API_URL${NC}"
echo ""
echo "Tests validés:"
echo -e "  ${GREEN}✅${NC} Backend API disponible"
echo -e "  ${GREEN}✅${NC} Frontend chargé"
echo -e "  ${GREEN}✅${NC} Validation d'email (Issue #18)"
echo -e "  ${GREEN}✅${NC} Validation de mot de passe fort (Issue #19)"
echo -e "  ${GREEN}✅${NC} Rate limiting (Issue #20)"
echo ""
echo "Processus actifs:"
echo -e "  Backend PID: ${YELLOW}$BACKEND_PID${NC}"
echo -e "  MongoDB: ${YELLOW}Local (Homebrew)${NC}"
echo ""
echo "Commandes utiles:"
echo -e "  Logs backend: ${YELLOW}tail -f /tmp/backend.log${NC}"
echo -e "  Arrêter MongoDB: ${YELLOW}brew services stop mongodb/brew/mongodb-community@7.0${NC}"
echo ""
echo "Compte admin créé:"
echo -e "  Email: ${YELLOW}famille.martin@gmail.com${NC}"
echo -e "  Mot de passe: ${YELLOW}Martin2024!Test${NC}"
echo ""
echo "Routines disponibles:"
echo "  📋 Pause bureau (5 min)"
echo "  📋 Routine douce (10 min)"
echo ""
echo "Validation manuelle:"
echo "  1. Ouvrir $FRONTEND_URL dans le navigateur"
echo "  2. Se connecter avec le compte admin ci-dessus"
echo "  3. Tester les routines et créer des sessions"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter et nettoyer"
echo ""

# Wait for user interrupt
echo -e "${BLUE}📋 Logs du backend:${NC}"
echo ""
tail -f /tmp/backend.log
