# 🚀 Deployment Guide - ChatApp

Complete guide for deploying your ChatApp to production.

## Table of Contents
1. [Database Setup (MongoDB Atlas)](#mongodb-atlas)
2. [File Storage Setup (Cloudinary)](#cloudinary-setup)
3. [Backend Deployment (Render)](#backend-deployment)
4. [Frontend Deployment (Vercel)](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#checklist)

---

## 📊 MongoDB Atlas Setup

### 1. Create Account & Cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (M0 Free tier)
4. Choose cloud provider and region
5. Click "Create Cluster"

### 2. Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 3. Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose authentication method
4. Set username and password (save these!)
5. Set user privileges to "Read and write to any database"
6. Add user

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your password
5. Replace `<dbname>` with your database name (e.g., `chatapp`)

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
```

---

## ☁️ Cloudinary Setup

### 1. Create Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Complete email verification

### 2. Get Credentials
1. Go to Dashboard
2. Find your credentials:
   - Cloud Name
   - API Key
   - API Secret
3. Save these for later

---

## 🖥️ Backend Deployment (Render)

### 1. Prepare Repository
```bash
# Initialize git if not already done
cd backend
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: chatapp-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Set Environment Variables

Add these in Render dashboard:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CLIENT_URL=<your-frontend-url>
```

### 4. Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL (e.g., `https://chatapp-backend.onrender.com`)

---

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare for Production

Update frontend code:

```javascript
// src/context/AuthContext.js
// src/context/SocketContext.js
// src/services/api.js

// Make sure API_URL and SOCKET_URL use environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 2. Build Locally (Test)

```bash
cd frontend
npm run build
```

### 3. Deploy on Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts
# Set project name
# Choose defaults for other options
```

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: build
   - **Install Command**: `npm install`

### 4. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
REACT_APP_API_URL=<your-render-backend-url>
REACT_APP_SOCKET_URL=<your-render-backend-url>
```

Example:
```
REACT_APP_API_URL=https://chatapp-backend.onrender.com
REACT_APP_SOCKET_URL=https://chatapp-backend.onrender.com
```

### 5. Redeploy

Click "Redeploy" to apply environment variables

---

## 🔧 Environment Variables Summary

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CLIENT_URL=https://your-app.vercel.app
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

---

## ✅ Post-Deployment Checklist

### Backend
- [ ] MongoDB Atlas cluster is running
- [ ] Database user created with correct permissions
- [ ] IP whitelist configured (0.0.0.0/0 for production)
- [ ] Cloudinary account active
- [ ] All environment variables set in Render
- [ ] Backend URL accessible
- [ ] Health check endpoint working (`/api/health`)
- [ ] CORS configured for frontend URL

### Frontend
- [ ] Build completes without errors
- [ ] Environment variables set in Vercel
- [ ] API URLs point to production backend
- [ ] Can access login/register pages
- [ ] No console errors in browser

### Testing
- [ ] User registration works
- [ ] User login works
- [ ] Profile picture upload works
- [ ] Messages send in real-time
- [ ] Socket.io connects successfully
- [ ] Typing indicators work
- [ ] Online status updates
- [ ] Dark/light theme toggle works
- [ ] Mobile responsive design works

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] Cloudinary credentials are secure
- [ ] HTTPS enabled (automatic with Render/Vercel)
- [ ] No sensitive data in client-side code
- [ ] CORS properly configured

---

## 🔍 Troubleshooting

### Backend Won't Deploy
- Check build logs in Render
- Verify `package.json` scripts
- Ensure Node version compatibility
- Check MongoDB connection string

### Frontend Won't Build
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies installed
- Check environment variables

### Socket.io Not Connecting
- Verify Socket URL matches backend URL
- Check CORS configuration
- Ensure WebSocket support enabled
- Check browser console for errors

### MongoDB Connection Failed
- Verify connection string format
- Check IP whitelist in Atlas
- Confirm database user credentials
- Test connection locally first

### Images Not Uploading
- Verify Cloudinary credentials
- Check file size limits
- Ensure multer configured correctly
- Check network/firewall settings

---

## 📊 Monitoring & Maintenance

### Render Dashboard
- Monitor backend logs
- Check deployment status
- View metrics (CPU, memory)
- Set up alerts

### Vercel Dashboard
- Monitor build logs
- Check deployment history
- View analytics
- Performance insights

### MongoDB Atlas
- Monitor database metrics
- Set up alerts
- Backup configuration
- Performance advisor

---

## 🎯 Next Steps

After deployment:
1. Add custom domain (optional)
2. Set up CI/CD pipeline
3. Implement monitoring (e.g., Sentry)
4. Add analytics
5. Set up automated backups
6. Implement rate limiting
7. Add email notifications
8. Create admin panel

---

## 📧 Support

Issues after deployment?
- Check logs in respective dashboards
- Review this guide
- Verify environment variables
- Test locally first
- Check service status pages

---

**🎉 Congratulations! Your ChatApp is now live!**
