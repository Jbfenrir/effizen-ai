# Script PowerShell pour lancer l'application EffiZen-AI
# Utilisation : .\start-app.ps1 depuis le dossier effizen-ai

Write-Host "🚀 Démarrage d'EffiZen-AI..." -ForegroundColor Green

# Vérifier si on est dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Vous devez être dans le dossier effizen-ai" -ForegroundColor Red
    Write-Host "💡 Naviguez vers le dossier avec: cd C:\Users\FIAE\Desktop\effizen-ai" -ForegroundColor Yellow
    exit 1
}

# Vérifier si WSL est disponible
try {
    wsl --version | Out-Null
    Write-Host "✅ WSL détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ WSL n'est pas disponible" -ForegroundColor Red
    exit 1
}

# Lancer l'application via WSL
Write-Host "🔧 Lancement du serveur via WSL..." -ForegroundColor Cyan
wsl -e bash -c "cd /mnt/c/Users/FIAE/Desktop/effizen-ai && npx vite --host --port 3000"