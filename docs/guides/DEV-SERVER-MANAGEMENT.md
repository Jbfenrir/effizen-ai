# Guide de gestion du serveur de développement

## 🎯 Port unique : localhost:3001

Le serveur de développement doit **TOUJOURS** utiliser le port **3001**.

## 🔧 Commandes essentielles

### Démarrer le serveur
```bash
# Depuis PowerShell
cd C:\Users\FIAE\Desktop\effizen-ai
wsl

# Dans WSL
cd /mnt/c/Users/FIAE/Desktop/effizen-ai
npm run dev
```

Le serveur démarre sur : **http://localhost:3001/**

### Arrêter le serveur
- **Dans le terminal actif** : `Ctrl+C`
- **Si le terminal est fermé** : Voir section "Nettoyer les ports"

## 🚨 Résolution des problèmes

### Problème : "Port 3001 is in use"
Le port est occupé par un ancien serveur. Solution :

```bash
# Méthode 1 : Tuer le processus sur le port 3001
lsof -ti:3001 | xargs -r kill -9

# Méthode 2 : Tuer tous les serveurs Vite
pkill -f vite

# Puis redémarrer
npm run dev
```

### Nettoyer tous les ports (3001-3004)
```bash
# Libérer tous les ports de développement
lsof -ti:3001,3002,3003,3004 | xargs -r kill -9
echo "Tous les ports ont été libérés"
```

### Vérifier quel processus utilise le port
```bash
# Voir qui utilise le port 3001
lsof -i:3001
```

## ⚠️ Bonnes pratiques

1. **Un seul serveur** : Ne jamais lancer plusieurs `npm run dev` simultanément
2. **Toujours arrêter proprement** : Utiliser `Ctrl+C` avant de fermer le terminal
3. **Port fixe** : Toujours utiliser le port 3001 (configuré dans package.json)
4. **Vérifier avant de démarrer** : S'assurer qu'aucun serveur ne tourne déjà

## 📝 Configuration permanente

Le fichier `package.json` est configuré pour toujours utiliser le port 3001 :

```json
"scripts": {
  "dev": "vite --port 3001"
}
```

## 🔄 Procédure de redémarrage propre

1. Arrêter le serveur actuel : `Ctrl+C`
2. Si nécessaire, nettoyer les ports : `lsof -ti:3001 | xargs -r kill -9`
3. Redémarrer : `npm run dev`
4. Ouvrir : **http://localhost:3001/**

---

**Important** : Si Claude Code lance plusieurs serveurs, demandez-lui de nettoyer et de n'utiliser que le port 3001.