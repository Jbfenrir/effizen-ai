# Script PowerShell simplifié pour EffiZen-AI
Write-Host "🚀 Démarrage d'EffiZen-AI..." -ForegroundColor Green

# Vérifier le dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Vous devez être dans le dossier effizen-ai" -ForegroundColor Red
    exit 1
}

# Lancement via WSL avec commande simplifiée
Write-Host "🔧 Lancement du serveur..." -ForegroundColor Cyan
wsl bash -c "cd /mnt/c/Users/FIAE/Desktop/effizen-ai; npx vite --host --port 3000"