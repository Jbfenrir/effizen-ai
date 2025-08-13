# Deploy Setup Script for EffiZen-AI
# Ce script prépare le projet pour le déploiement sur Vercel

Write-Host "=== EffiZen-AI Deploy Setup ===" -ForegroundColor Green

# 1. Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis le répertoire effizen-ai" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que le build fonctionne
Write-Host "Test du build local..." -ForegroundColor Yellow
wsl bash -c "cd /mnt/c/Users/FIAE/Desktop/effizen-ai && npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur: Le build a échoué" -ForegroundColor Red
    exit 1
}

# 3. Vérifier le statut git
Write-Host "Vérification du statut git..." -ForegroundColor Yellow
git status

# 4. Instructions pour le déploiement manuel
Write-Host "=== INSTRUCTIONS POUR LE DÉPLOIEMENT ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Le code est prêt et le build fonctionne" -ForegroundColor White
Write-Host "2. Pour pousser vers GitHub, utilisez:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Pour déployer sur Vercel:" -ForegroundColor White
Write-Host "   - Aller sur https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   - Cliquer 'New Project'" -ForegroundColor Cyan
Write-Host "   - Importer depuis GitHub: Jbfenrir/effizen-ai" -ForegroundColor Cyan
Write-Host "   - Ajouter les variables d'environnement (voir DEPLOYMENT.md)" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Fichiers créés:" -ForegroundColor White
Write-Host "   - vercel.json (configuration Vercel)" -ForegroundColor Cyan
Write-Host "   - DEPLOYMENT.md (instructions détaillées)" -ForegroundColor Cyan
Write-Host "   - .env.production (variables d'environnement)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le projet est prêt pour le déploiement !" -ForegroundColor Green