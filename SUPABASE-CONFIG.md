# Configuration Supabase pour EffiZen-AI

## 📧 Configuration Email Magic Links

### 1. Dans votre dashboard Supabase :
- Allez dans **Authentication** > **Settings**
- Section **"SMTP Settings"**

### 2. Options de configuration email :

#### Option A - Email Supabase par défaut (rapide) :
- Aucune configuration supplémentaire nécessaire
- Les emails viendront de `noreply@mail.app.supabase.co`
- **Limitation** : 3 emails/heure pour les comptes gratuits

#### Option B - Gmail SMTP (recommandé) :
```
Host: smtp.gmail.com  
Port: 587
Username: votre-email@gmail.com
Password: [Mot de passe d'application Gmail]
```

#### Option C - SendGrid (professionnel) :
```
Host: smtp.sendgrid.net
Port: 587  
Username: apikey
Password: [Votre clé API SendGrid]
```

### 3. Template d'email personnalisé (optionnel) :
- Section **"Email Templates"**
- Personnaliser le message de **"Magic Link"**

## 🔐 Configuration URL de redirection

Dans **Authentication** > **URL Configuration** :
- **Site URL** : `http://localhost:5173` (développement)
- **Redirect URLs** : 
  - `http://localhost:5173/dashboard`
  - `http://localhost:5173/auth/callback`

## 👤 Création du premier administrateur

### Méthode 1 - SQL Direct :
```sql
-- Après que jbgerberon@gmail.com se soit connecté une première fois
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'jbgerberon@gmail.com';
```

### Méthode 2 - Interface Admin :
1. Se connecter avec jbgerberon@gmail.com
2. Exécuter le SQL ci-dessus depuis l'éditeur SQL Supabase
3. Se déconnecter/reconnecter pour voir les droits admin

## ✅ Validation de la configuration

1. **Test base de données** : Vérifier que les tables sont créées
2. **Test auth** : Envoyer un magic link à un email de test  
3. **Test admin** : Vérifier l'accès au dashboard admin avec jbgerberon@gmail.com