# 🔐 Configuration Supabase - Récupération de Mot de Passe

## ⚠️ IMPORTANT - Configuration OBLIGATOIRE dans Supabase Dashboard

Pour que la récupération de mot de passe fonctionne correctement en production, vous DEVEZ configurer les URLs de redirection dans votre dashboard Supabase.

## 📋 Étapes de Configuration

### 1. Accéder aux paramètres d'authentification
1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : **EffiZen-AI**
3. Allez dans **Authentication** > **URL Configuration**

### 2. Configurer les URLs de redirection

#### 🌐 Pour la PRODUCTION

Modifiez les paramètres suivants :

```
Site URL: https://effizen-ai-prod.vercel.app

Redirect URLs (ajoutez toutes ces URLs):
- https://effizen-ai-prod.vercel.app/auth/callback
- https://effizen-ai-prod.vercel.app/auth/callback?type=recovery
- https://effizen-ai-prod.vercel.app/dashboard
- http://localhost:3000/auth/callback
- http://localhost:3001/auth/callback
- http://localhost:3002/auth/callback
- http://localhost:5173/auth/callback
```

### 3. Templates d'email (optionnel mais recommandé)

Dans **Authentication** > **Email Templates** :

#### Template "Reset Password" :
```html
<h2>Réinitialisation de votre mot de passe</h2>
<p>Bonjour,</p>
<p>Vous avez demandé à réinitialiser votre mot de passe pour EffiZen-AI.</p>
<p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
<p>Cordialement,<br>L'équipe EffiZen-AI</p>
```

### 4. Vérification de la configuration SMTP

Assurez-vous que votre configuration SMTP est correcte dans **Authentication** > **SMTP Settings** :

```
Host: smtp.gmail.com
Port: 587
Username: jbgerberon@gmail.com
Password: [Mot de passe d'application Gmail]
Sender email: jbgerberon@gmail.com
Sender name: EffiZen-AI
```

## 🧪 Test de la Configuration

### Test en local :
1. Lancez l'application : `npm run dev`
2. Allez sur http://localhost:3002/login
3. Cliquez sur "Mot de passe oublié" (une fois implémenté)
4. Entrez votre email et validez
5. Vérifiez votre boîte mail
6. Le lien devrait rediriger vers : `http://localhost:3002/auth/callback?type=recovery`

### Test en production :
1. Allez sur https://effizen-ai-prod.vercel.app/login
2. Répétez les étapes 3-5 ci-dessus
3. Le lien devrait rediriger vers : `https://effizen-ai-prod.vercel.app/auth/callback?type=recovery`

## 🔍 Dépannage

### Problème : "Site inaccessible" ou erreur localhost
**Solution :** Les URLs de redirection ne sont pas configurées correctement dans Supabase Dashboard

### Problème : "Email link is invalid or has expired"
**Solutions possibles :**
1. Le lien a expiré (validité par défaut : 1 heure)
2. Le lien a déjà été utilisé
3. Les URLs de redirection ne correspondent pas

### Problème : Erreur 403 sur /auth/v1/logout
**Solution :** Déjà corrigé dans le code avec `scope: 'local'`

## 📝 Notes Importantes

1. **TOUJOURS** tester en local avant de déployer en production
2. Les URLs de redirection sont **sensibles à la casse**
3. N'oubliez pas le protocole (http:// ou https://)
4. Les changements dans Supabase Dashboard prennent effet immédiatement

## 🚀 Implémentation Côté Code (Déjà fait)

Le code a déjà été modifié pour :
- ✅ Détection automatique de l'environnement (local/production)
- ✅ URLs de redirection adaptatives
- ✅ Fonction `resetPasswordForEmail` dans les hooks
- ✅ Page de réinitialisation de mot de passe (`AuthCallback.tsx`)
- ✅ Support du paramètre `?type=recovery`

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans Supabase Dashboard > **Logs** > **Auth**
2. Vérifiez la console du navigateur (F12)
3. Contactez : jbgerberon@gmail.com

---

**Dernière mise à jour :** 2025-08-28  
**Statut :** ⚠️ **EN ATTENTE DE CONFIGURATION SUPABASE DASHBOARD**