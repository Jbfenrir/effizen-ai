# Guide de Résolution des Problèmes

## 🚀 Problèmes de démarrage

### npm command not found
```bash
# OBLIGATOIRE : Utiliser WSL sur Windows
cd C:\Users\FIAE\Desktop\effizen-ai
wsl
cd /mnt/c/Users/FIAE/Desktop/effizen-ai
npm install
npm run dev
```

### Port déjà utilisé
```bash
# Vérifier et tuer le processus
lsof -i :3000
kill -9 [PID]
# Ou utiliser un autre port
npm run dev -- --port 3001
```

## 🔐 Problèmes d'authentification

### Connexion impossible
1. Vérifier les variables d'environnement dans `.env`
2. Vérifier que l'email existe dans Supabase Dashboard
3. Utiliser la récupération de mot de passe

### Boucle infinie au chargement
- Vérifier le système auth actif dans `src/config/auth-switch.ts`
- Basculer entre 'NEW' et 'OLD' si nécessaire
- En dernier recours : `git reset --hard 57b058e`

### Création utilisateur échoue
```env
# Vérifier dans .env
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 🏗️ Problèmes de build

### TypeScript errors
```bash
# Utiliser le build sans vérification TypeScript
npm run build  # au lieu de npm run build:check
```

### Module not found
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📊 Problèmes de données

### Données non visibles après filtrage
- Vérifier que les données sont dans Supabase (pas localStorage)
- Utiliser le bouton "Récupérer Données" dans l'admin
- Vérifier les dates de filtrage

### Export CSV vide ou incomplet
- S'assurer d'avoir des données dans la période sélectionnée
- Vérifier la console pour les erreurs
- Tester avec une période plus large

## 🖼️ Problèmes avec les screenshots

### "File does not exist" pour screenshots
```bash
# Problème de caractères spéciaux Windows/WSL
# Solution : créer une copie avec nom simple
cd screenshots/
ls -la  # voir les fichiers
cp 'Capture d'\''écran 2025-XX-XX.png' temp.png
```

## 🔄 Modifications non prises en compte

### Code modifié mais pas de changement
```bash
# TOUJOURS relancer le serveur après modifications
Ctrl+C  # Arrêter le serveur
npm run dev  # Relancer
```

### Cache navigateur
- Faire Ctrl+F5 pour forcer le rechargement
- Ouvrir en navigation privée
- Vider le cache du navigateur

## 🚨 Restauration d'urgence

### Retour à une version stable
```bash
# Dans WSL
cd /mnt/c/Users/FIAE/Desktop/effizen-ai

# Voir l'historique des commits
git log --oneline -10

# Restaurer un commit stable
git reset --hard 57b058e  # Commit de sauvegarde connu

# Ou restaurer le dernier commit
git reset --hard HEAD~1
```

### Sauvegarder l'état actuel avant modification
```bash
git add .
git commit -m "🔧 Sauvegarde avant modifications"
```

## 📞 Support et ressources

### Dashboards utiles
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repo](https://github.com/Jbfenrir/effizen-ai)

### Logs à vérifier
1. Console navigateur (F12)
2. Terminal Vite (où `npm run dev` tourne)
3. Logs Vercel (pour la production)
4. Logs Supabase (Dashboard → Logs)

### Contact maintainer
- Email : jbgerberon@gmail.com
- Compte admin : jbgerberon@gmail.com