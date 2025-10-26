# Power Consumption Analysis - Complete Setup Guide

This guide will help you set up and run the Power Consumption Analysis web application on your Raspberry Pi with server-side file storage.

## 📋 Prerequisites

- Raspberry Pi (any model with network access)
- Raspberry Pi OS (or any Linux distribution)
- Internet connection for initial setup

## 🚀 Installation Steps

### Step 1: Install Node.js

```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install -y nodejs npm

# Verify installation
node --version  # Should show v14 or higher
npm --version
```

### Step 2: Download and Extract the Application

1. Download the `power-consumption-analysis.zip` file
2. Extract it to your desired location:

```bash
# Create directory
mkdir -p ~/power-app
cd ~/power-app

# Extract the downloaded ZIP file
unzip /path/to/power-consumption-analysis.zip

# You should now have these files:
# - index.html
# - server.js
# - package.json
# - (other HTML/CSS/JS files)
```

### Step 3: Install Dependencies

```bash
# Navigate to the app directory
cd ~/power-app

# Install Node.js dependencies
npm install

# This will install:
# - express (web server)
# - multer (file upload handling)
# - cors (cross-origin resource sharing)
```

### Step 4: Start the Server

```bash
# Start the server
npm start

# You should see:
# ╔═══════════════════════════════════════════════════════════╗
# ║   ⚡ Power Consumption Analysis Server                    ║
# ║   Server running on: http://localhost:3000                ║
# ╚═══════════════════════════════════════════════════════════╝
```

### Step 5: Access the Application

Open your web browser and navigate to:
- **On Raspberry Pi**: http://localhost:3000
- **From another device on the same network**: http://[RASPBERRY_PI_IP]:3000

To find your Raspberry Pi's IP address:
```bash
hostname -I
# Example output: 192.168.1.100
```

## 📁 File Structure

After installation, your directory should look like:

```
~/power-app/
├── index.html              # Main web application
├── server.js               # Node.js backend server
├── package.json            # Node.js dependencies
├── package-lock.json       # Dependency lock file (auto-generated)
├── node_modules/           # Installed dependencies (auto-generated)
└── uploads/                # Saved files directory (auto-created)
    ├── consumption_latest.xlsx
    └── price_latest.csv
```

## 🔄 How It Works

1. **Upload Files**: When you upload consumption and price files, they are:
   - Sent to the server via HTTP POST
   - Saved to the `uploads/` directory
   - Automatically named `consumption_latest.*` and `price_latest.*`

2. **Auto-Load**: When you open the app:
   - The app checks if saved files exist on the server
   - If found, they are automatically loaded and processed
   - Analysis displays immediately without re-uploading

3. **File Replacement**: Uploading new files automatically overwrites the saved ones

4. **Clear Saved Files**: Click the "Clear Saved Files" button to delete all saved files from the server

## 🛠️ Advanced Configuration

### Change Port Number

Edit `server.js` or set environment variable:
```bash
PORT=8080 npm start
```

Or edit the line in `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000 to your desired port
```

### Run as Background Service (systemd)

Create a systemd service to auto-start on boot:

```bash
sudo nano /etc/systemd/system/power-app.service
```

Add this content:
```ini
[Unit]
Description=Power Consumption Analysis Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/power-app
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable power-app
sudo systemctl start power-app

# Check status
sudo systemctl status power-app

# View logs
sudo journalctl -u power-app -f
```

### Access from Outside Your Network

To access from the internet, you'll need to:
1. Set up port forwarding on your router (forward port 3000 to your Raspberry Pi)
2. Use a dynamic DNS service (like No-IP or DuckDNS)
3. Consider using HTTPS with Let's Encrypt (recommended for security)

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is already in use
sudo lsof -i :3000

# Kill the process using the port
sudo kill -9 [PID]
```

### Permission errors
```bash
# Make sure you own the directory
sudo chown -R pi:pi ~/power-app

# Make uploads directory writable
chmod 755 ~/power-app/uploads
```

### Files not saving
```bash
# Check if uploads directory exists
ls -la ~/power-app/uploads

# Create it manually if needed
mkdir -p ~/power-app/uploads
```

### Cannot access from other devices
```bash
# Check firewall
sudo ufw status

# Allow port 3000
sudo ufw allow 3000
```

## 📝 API Endpoints

The server provides these endpoints:

- `POST /api/upload/consumption` - Upload consumption file
- `POST /api/upload/price` - Upload price file
- `GET /api/files` - Check if saved files exist
- `GET /api/download/consumption` - Download saved consumption file
- `GET /api/download/price` - Download saved price file
- `POST /api/clear` - Delete all saved files
- `GET /api/health` - Server health check

## 🔐 Security Notes

For production use on the internet:
1. Add authentication (username/password)
2. Use HTTPS (SSL/TLS certificates)
3. Limit file upload sizes (already set to 50MB)
4. Add rate limiting to prevent abuse
5. Consider using a reverse proxy (nginx)

## 📊 Usage

1. Open http://localhost:3000 in your browser
2. Upload your consumption file (Excel or CSV)
3. Upload your price file (CSV)
4. Files are automatically saved to the server
5. Next time you open the app, files load automatically
6. Click "Clear Saved Files" if you want to start fresh

## 🔄 Updating the Application

To update the app with a new version:
```bash
# Stop the server (Ctrl+C if running in terminal)
# Or if using systemd:
sudo systemctl stop power-app

# Backup your saved files
cp -r uploads/ uploads_backup/

# Extract new version (overwrite old files)
unzip -o /path/to/new-version.zip

# Restore saved files
cp -r uploads_backup/* uploads/

# Restart server
npm start
# Or if using systemd:
sudo systemctl start power-app
```

## 📞 Support

If you encounter issues:
1. Check the server console output for error messages
2. Check browser console (F12) for frontend errors
3. Verify file permissions in the uploads directory
4. Ensure Node.js version is 14 or higher

## 🎉 You're Done!

Your Power Consumption Analysis application is now running with server-side file persistence. Uploaded files will be automatically loaded each time you access the app!
