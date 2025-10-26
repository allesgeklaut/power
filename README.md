Perfect! Here’s a professional, user-facing **README.md** suitable for your GitHub repository:

***

# ⚡ Power Consumption Analysis Web App

An intuitive, modern, and self-hostable web application for analyzing power consumption and electricity market price data.
Built with **Node.js**, **Express**, and a sleek modern frontend, it’s tailored for Austrian energy data from:

- **Consumption data:** [mein.oekostrom.at/a-p](https://mein.oekostrom.at/a-p/)
- **Price data (Day-Ahead Market):** [markt.apg.at/transparenz/uebertragung/day-ahead-preise](https://markt.apg.at/transparenz/uebertragung/day-ahead-preise/)

***

## 🚀 Features

### 🔍 **Data Upload & Analysis**
- Supports **Excel** and **CSV** formats
- Automatically merges consumption and market price data
- Calculates total energy cost including:
  - Market cost (€/MWh)
  - Provider variable & fixed fees
  - Average cost per kWh

### 📅 **Interactive Time Controls**
- Select custom analysis periods
- Quick-actions:
  - “Start of Month”
  - “Full Range”
- Date range dynamically updates all charts and statistics

### 📈 **Comprehensive Visualizations**
- **Monthly Cost Breakdown:** Market + Variable + Fixed fees
- **Consumption Pattern Analysis:** Compare daily profiles and total usage
- Beautiful, responsive charts built with smooth animations

### ⚡ **Auto File Reload (Quick Upload)**
- Optional “Quick Upload” feature for Chrome/Edge users
- Monitors your Downloads folder for new files
- Automatically detects and loads new or updated files
- Works in **read-only mode** — no file deletions!

### 💾 **Server Persistence**
- Uploaded files saved server-side and automatically reloaded on restart
- No need to re-upload after refreshing or reopening the app

### 🌙 **Modern, Responsive UI**
- Clean, minimal interface inspired by premium dashboards
- Compact layout optimized for both desktop and mobile
- Includes drag & drop support for uploads
- Consistent dark-on-light theme with gradient highlights

***

## ⚙️ Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/power-consumption-analysis.git
cd power-consumption-analysis
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start the Server**
```bash
npm start
```

Server will start locally on:
```
http://localhost:3000
```

You’ll see diagnostics in the console confirming all endpoints are live.

***

## 🧠 How It Works

1. **Upload Files**
   - Upload your **consumption file (.xlsx)** and **price file (.csv)**
   - Files are merged on timestamp

2. **Data Processing**
   - Handles time zone alignment (Europe/Vienna)
   - Detects gaps and fills missing price data where possible
   - Fixes misaligned intervals (15-minute granularity)

3. **Cost Computation**
   - Calculates:
     - Market cost (based on hourly or quart-hourly prices)
     - Variable provider fees
     - Fixed monthly fees (€2.16 by default)

4. **Outputs**
   - Monthly total costs (EUR)
   - Average power price (cents/kWh)
   - Monthly consumption overview (kWh)

***

## 🖥️ Hosting on Raspberry Pi

1. **Install Node.js**
```bash
sudo apt install -y nodejs npm
```

2. **Run Server**
```bash
npm start
```

3. **Access on Local Network**
Open:
`http://<your-pi-ip>:3000`

To run as a background service, create a systemd service (instructions provided in `SETUP-GUIDE.md`).

***

## 🧩 File Sources

The app is optimized for real Austrian energy data:

| Data Type | Source | Format | Example |
|------------|---------|----------|----------|
| Consumption | mein.oekostrom.at | `.xlsx` | Timestamps (UNIX seconds), Consumption (kWh) |
| Market Prices | markt.apg.at | `.csv` | “Zeit von [CET/CEST]”, “Preis [EUR/MWh]” |

***

## 📂 Directory Structure

```
power-consumption-analysis/
├── public/                 # Frontend static files
├── uploads/                # Saved consumption/price files
├── server.js               # Node.js backend server
├── package.json            # Dependencies and scripts
├── SETUP-GUIDE.md          # Detailed Raspberry Pi setup guide
└── README.md               # Project documentation
```

***

## 🧰 Available Scripts

| Command | Description |
|----------|--------------|
| `npm start` | Launches production server |
| `npm run dev` | Starts development mode (with auto restart) |
| `npm install` | Installs dependencies |
| `systemctl start power-app` | Run as background service (on Raspberry Pi) |

***

## 🔒 Privacy & Security

- All processing happens locally on your server or machine
- No data leaves your environment
- Compatible with private networks and self-hosted deployments
- Read-only “Quick Upload” mode prevents system modifications

***

## 🧭 Browser Compatibility

| Feature | Chrome / Edge | Firefox | Safari |
|----------|----------------|----------|----------|
| File Upload | ✅ | ✅ | ✅ |
| Auto Reload (File System Access API) | ✅ | ❌ | ❌ |
| Drag & Drop | ✅ | ✅ | ✅ |
| Responsive Design | ✅ | ✅ | ✅ |

***

## 🧪 Testing & Troubleshooting

To debug:
- Open **Developer Tools → Console**
- Check for:
  - `Monitoring started`
  - `New/modified file detected`
  - `File uploaded successfully`
- If prices or consumption don’t align, confirm matching timestamps and correct timezone format.

***

## 🧑‍💻 Contributing

Contributions welcome!
If you’d like to improve visuals, support more data formats, or add new analysis features, feel free to submit a pull request.

***

## ☕ Acknowledgments

Built with ❤️ for open data and renewable energy users.

- Electricity consumption data © [Ökostrom AG](https://mein.oekostrom.at/a-p/)
- Market data © [Austrian Power Grid (APG)](https://markt.apg.at/transparenz/uebertragung/day-ahead-preise/)
- Developed using open standards and APIs available to the public.

***

## 📜 License

This project is licensed under the **MIT License**.

You are free to:
- Use
- Modify
- Distribute
- Self-host
as long as the original license and attribution are preserved.

***

Would you like me to include images or badges (e.g. npm version, screenshots of UI, “Built with Node.js” badge) for the GitHub version?
Those can make the README visually engaging for potential users.
