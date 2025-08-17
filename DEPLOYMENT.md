# 🚀 Production Deployment Guide - Netlify + Render

This guide will help you deploy your Avengers Learning Academy to production using Netlify (frontend) and Render (backend).

## 📋 Prerequisites

1. **GitHub Repository** - Your code pushed to GitHub
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **Anthropic API Key** - From [console.anthropic.com](https://console.anthropic.com)
5. **GitHub OAuth App** - For production URLs

## 🔧 Step 1: Set Up GitHub OAuth App for Production

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a **new OAuth App** for production:
   - **Application name**: `Avengers Learning Academy Production`
   - **Homepage URL**: `https://your-app-name.netlify.app` (you'll get this from Netlify)
   - **Authorization callback URL**: `https://your-backend-app.onrender.com/auth/github/callback` (you'll get this from Render)
3. Save the **Client ID** and **Client Secret** for later

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create Web Service on Render

1. Go to [render.com](https://render.com) → Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `avengers-academy-backend` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: `Yes`

### 2.2 Add Environment Variables

In your Render service settings, add these environment variables:

```bash
# Required - Get from respective services
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Generate secure random strings (32+ characters)
JWT_SECRET=your_super_secure_jwt_secret_32_chars_plus
SESSION_SECRET=your_super_secure_session_secret_32_chars_plus

# Production URLs (update after getting Netlify URL)
CLIENT_URL=https://your-app-name.netlify.app
GITHUB_CALLBACK_URL=https://your-backend-app.onrender.com/auth/github/callback

# Environment
NODE_ENV=production
```

### 2.3 Get Your Backend URL

After deployment, note your backend URL: `https://your-backend-app.onrender.com`

## 🌐 Step 3: Deploy Frontend to Netlify

### 3.1 Build Settings

1. Go to [netlify.com](https://netlify.com) → Sites → Import from Git
2. Connect your GitHub repository
3. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

### 3.2 Add Environment Variables

In Netlify Site settings → Environment variables, add:

```bash
# Your Render backend URL
REACT_APP_API_URL=https://your-backend-app.onrender.com
```

### 3.3 Configure Redirects

Create `client/public/_redirects` file for React Router:

```
/* /index.html 200
```

## 🔄 Step 4: Update OAuth Settings

1. Go back to your GitHub OAuth App settings
2. Update the URLs with your actual deployment URLs:
   - **Homepage URL**: Your Netlify URL
   - **Authorization callback URL**: Your Render backend URL + `/auth/github/callback`

## ✅ Step 5: Test Your Deployment

1. Visit your Netlify URL
2. Test GitHub login
3. Try the different courses (SQL, React, Python)
4. Execute SQL queries to ensure backend connectivity

## 🛠️ Environment Variables Summary

### Backend (Render)
```bash
ANTHROPIC_API_KEY=your_key
GITHUB_CLIENT_ID=your_id  
GITHUB_CLIENT_SECRET=your_secret
JWT_SECRET=secure_32_char_string
SESSION_SECRET=secure_32_char_string
CLIENT_URL=https://your-app.netlify.app
GITHUB_CALLBACK_URL=https://your-backend.onrender.com/auth/github/callback
NODE_ENV=production
```

### Frontend (Netlify)
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 🔍 Troubleshooting

### Backend Issues
- Check Render logs for startup errors
- Verify all environment variables are set
- Ensure GitHub OAuth callback URL is correct

### Frontend Issues
- Check browser network tab for API call errors
- Verify `REACT_APP_API_URL` is set correctly
- Ensure `_redirects` file exists for React Router

### OAuth Issues
- Verify GitHub OAuth app URLs match your deployed URLs
- Check that `CLIENT_URL` and `GITHUB_CALLBACK_URL` are correct
- Test the OAuth flow step by step

## 📊 Expected Costs

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes)
- **Render**: Free tier (750 hours/month, sleeps after 15min inactivity)
- **Anthropic**: Pay-per-use (typically $0.01-0.10 per session)

## 🚀 Post-Deployment

1. **Monitor Performance**: Check Render and Netlify dashboards
2. **Set Up Alerts**: Configure uptime monitoring
3. **Update GitHub**: Add deployment URLs to your README
4. **Share**: Your app is now live and ready to share!

Your Avengers Learning Academy is now live! 🎉