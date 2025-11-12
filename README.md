# 🎵 Spotification
Spotification is an automated service that tracks changes in a Spotify playlist and notifies users via email whenever new songs are added. It uses scheduled polling, database comparison, and email alerts to keep you updated — without manual checking.

## 🚀 Features
 - 🔄 Cron job polling every 5 minutes to check playlist updates
 - 🎧 Fetches latest tracks using Spotify API
 - 🛢 Stores playlist history in MongoDB
 - 🔍 Compares old vs new songs efficiently
 - 📬 Sends email alerts via Gmail SMTP when new songs are found
 - 🧠 Modular codebase (polling, mailer, DB, cron separation)
 - ⚡ Runs automatically once the server starts

## 🏗 System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                         │
│                       (server.js)                           │
│                                                             │
│   ┌────────────────────────────────────────────────────┐    │
│   │               CRON JOB (node-cron)                 │    │
│   │         Runs every 5 minutes automatically         │    │
│   └────────────────────────────────────────────────────┘    │
│                             ↓                               │
│              ┌──────────────────────────────┐               │
│              │     POLLING SERVICE          │               │
│              │ (playlist-polling-service.js)│               │
│              └──────────────────────────────┘               │
│                             ↓                               │
│              ┌──────────────┴──────────────┐                │
│              ↓                             ↓                │
│        ┌──────────────┐           ┌──────────────┐          │
│        │  SPOTIFY API │           │   MONGODB    │          │  
│        └──────────────┘           └──────────────┘          │
│              ↓                             ↓                │
│             ┌──────────────────────────────┐                │  
│             │      COMPARISON LOGIC        │                │
│             │ Compare new vs stored tracks │                │
│             └──────────────────────────────┘                │
│                            ↓                                │
│                     New songs found?                        │
│                      ↙            ↘                         │
│                    YES            NO                        │
│                     ↓             ↓                         │
│           ┌────────────────┐     (Do nothing)               │
│           │  EMAIL SERVICE │                                │
│           │ email-service.js│                               │  
│           └────────────────┘                                │
│                    ↓                                        │
│         ┌─────────────────────┐                             │ 
│         │  Gmail SMTP Server  │                             │
│         └─────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
                📧 Your Recipient Email Inbox
```

## 🛠 Tech Stack

| Technology        | Purpose              |
|------------------|----------------------|
| Node.js + Express | Server & API         |
| Spotify API       | Fetch playlist data  |
| MongoDB           | Store playlist history |
| Node-cron         | Schedule polling jobs |
| Nodemailer        | Send email alerts    |
| Gmail SMTP        | Email delivery       |

## ⚙️ Setup & Installation
### 1️⃣ Clone the repository
```
git clone https://github.com/Ansu-mann/spotification.git
```
```
cd spotification
```
### 2️⃣ Install dependencies
```
npm install
```
### 3️⃣ Create .env file
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token
PLAYLIST_ID=your_playlist_id
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RECIPIENT_EMAIL=receiver_email@gmail.com
```
### 4️⃣ Start the server
```
npm start
```
✅ Cron job will now auto-run every 5 minutes and notify on new songs 🎶
BASE_URL/api/spotify/playlist/:playlistId/check

## 📂 Project Structure
```
spotification/
│
├── server.js                      # Main server file
├── playlist-polling-service.js    # Polling & comparison logic
├── email-service.js               # Email handler
├── .env                           # required secret IDs and codes
├── package.json
└── README.md
```