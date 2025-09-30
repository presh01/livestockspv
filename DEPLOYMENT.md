# Livestock Fattening SPV - Deployment Guide

## 🚀 Quick Deployment

The web application is already deployed and accessible at:
**https://at252622ikl5c.ok.kimi.link**

## 📋 Complete Deployment Instructions

### Option 1: Deploy to Vercel (Recommended)

#### Prerequisites
- Node.js 16+ installed
- Git repository
- Vercel account

#### Steps
1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd livestock-spv
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   ```bash
   # backend/.env
   DATABASE_URL=your-database-url
   JWT_SECRET=your-jwt-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=https://your-domain.com
   ```

4. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy backend
   cd backend
   vercel --prod

   # Deploy frontend
   cd ../
   vercel --prod
   ```

### Option 2: Deploy to Heroku

#### Steps
1. **Create Heroku apps**
   ```bash
   heroku create livestock-spv-backend
   heroku create livestock-spv-frontend
   ```

2. **Set environment variables**
   ```bash
   heroku config:set DATABASE_URL=your-database-url --app livestock-spv-backend
   heroku config:set JWT_SECRET=your-jwt-secret --app livestock-spv-backend
   ```

3. **Deploy backend**
   ```bash
   cd backend
   git init
   heroku git:remote -a livestock-spv-backend
   git add .
   git commit -m "Deploy backend"
   git push heroku master
   ```

### Option 3: Traditional VPS Deployment

#### Server Setup
1. **Update system**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

4. **Setup Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE livestock_spv;
   CREATE USER spv_user WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE livestock_spv TO spv_user;
   \q
   ```

5. **Install Nginx**
   ```bash
   sudo apt install nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

#### Backend Deployment
1. **Create application directory**
   ```bash
   sudo mkdir -p /var/www/livestock-spv
   sudo chown -R $USER:$USER /var/www/livestock-spv
   ```

2. **Upload files**
   ```bash
   cd /var/www/livestock-spv
   git clone <your-repository-url> .
   ```

3. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Setup PM2 process manager**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name livestock-spv-backend
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           root /var/www/livestock-spv;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

6. **Enable site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/livestock-spv /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/livestock_spv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=livestock_spv
DB_USER=postgres
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=LivestockSPV <noreply@livestockspv.com>

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# Optional: SMS Service
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

#### Frontend Configuration
```env
# API Endpoint
REACT_APP_API_URL=https://your-domain.com/api
# or for local development
REACT_APP_API_URL=http://localhost:5000/api
```

### Database Setup

1. **Run Schema Migration**
   ```bash
   cd backend
   psql -U postgres -d livestock_spv -f database/schema.sql
   ```

2. **Verify Tables**
   ```bash
   psql -U postgres -d livestock_spv
   \dt
   ```

## 🔐 Security Setup

### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# Install UFW
sudo apt install ufw

# Configure rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs livestock-spv-backend

# Process status
pm2 status
```

### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

## 🚀 Production Optimizations

### Performance
1. **Enable Gzip Compression**
   ```bash
   sudo nano /etc/nginx/nginx.conf
   # Add: gzip on; gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Setup Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Database Optimization**
   ```bash
   # Create indexes for better performance
   psql -U postgres -d livestock_spv -f database/optimize.sql
   ```

### Security
1. **Security Headers**
   ```nginx
   add_header X-Frame-Options DENY;
   add_header X-Content-Type-Options nosniff;
   add_header X-XSS-Protection "1; mode=block";
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
   ```

2. **Rate Limiting**
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   location /api {
       limit_req zone=api burst=20 nodelay;
   }
   ```

## 📧 Email Configuration

### Gmail Setup
1. **Enable 2-Factor Authentication**
2. **Generate App Password**
   - Go to Google Account Settings
   - Security > App Passwords
   - Generate password for "Mail"

### Alternative Email Services
- **SendGrid**: Free tier with 100 emails/day
- **Mailgun**: Pay-as-you-go pricing
- **Amazon SES**: AWS integration

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   psql -U postgres -d livestock_spv -c "SELECT 1;"
   ```

2. **PM2 Process Not Starting**
   ```bash
   # Check PM2 logs
   pm2 logs livestock-spv-backend --lines 50
   
   # Restart process
   pm2 restart livestock-spv-backend
   ```

3. **Nginx 502 Bad Gateway**
   ```bash
   # Check backend is running
   pm2 status
   
   # Test backend directly
   curl http://localhost:5000/health
   ```

4. **CORS Issues**
   ```bash
   # Check environment variables
   echo $FRONTEND_URL
   
   # Restart backend
   pm2 restart livestock-spv-backend
   ```

### Debug Mode
```bash
# Start backend in debug mode
cd backend
DEBUG=true npm run dev

# Monitor real-time logs
pm2 logs livestock-spv-backend --lines 100 --timestamp
```

## 📊 Performance Monitoring

### Database Performance
```sql
-- Check slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE calls > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Application Performance
```bash
# Install monitoring tools
npm install -g clinic

# Profile application
clinic doctor -- node server.js
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Daily backup
pg_dump -U postgres livestock_spv > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres livestock_spv | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Add to crontab
0 2 * * * /path/to/backup.sh
```

### Application Backup
```bash
# Backup application files
tar -czf livestock-spv-backup.tar.gz /var/www/livestock-spv/

# Backup PM2 processes
pm2 save
pm2 resurrect
```

## 📞 Support

### Getting Help
1. **Check Logs**: PM2 and application logs
2. **Review Documentation**: API and integration guides
3. **Community Support**: GitHub issues and discussions
4. **Professional Support**: Contact development team

### Maintenance Schedule
- **Daily**: Check logs and monitor performance
- **Weekly**: Review security updates and patches
- **Monthly**: Database optimization and backup verification
- **Quarterly**: Full system audit and performance review

## 🎉 Deployment Complete!

Your Livestock Fattening SPV application is now deployed and ready for use. The system includes:

✅ **Complete Frontend** - Responsive design with animations
✅ **Robust Backend** - API with authentication and security
✅ **Database Schema** - Optimized for performance and scalability
✅ **Admin Panel** - Comprehensive management tools
✅ **Documentation** - Full integration and deployment guides

**Access your application at: https://at252622ikl5c.ok.kimi.link**

---

*This deployment guide provides comprehensive instructions for deploying the Livestock Fattening SPV application to various platforms. Follow the steps carefully and refer to the troubleshooting section for common issues.*