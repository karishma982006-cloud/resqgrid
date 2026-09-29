# RESQ-GRID — Hosting & Multi-Device Access Guide

This guide explains how to access **RESQ-GRID** from **any system, laptop, iPad, or mobile phone** on your local network (Wi-Fi/LAN), as well as how to share it over the public Internet.

---

## 1. Live Network Access (Active Right Now)

Your computer's local network IPv4 address is: **`10.12.180.52`**

Both backend and frontend are already bound to `0.0.0.0` (all network interfaces).

### URLs to open from ANY device connected to your Wi-Fi:

| Access Type | URL | Description |
|---|---|---|
| **Single-Port Production App** | **`http://10.12.180.52:5000`** | Unified build. Express backend serves both React UI & API on port 5000. No CORS, no separate frontend needed. |
| **Vite Dev Server (HMR)** | **`http://10.12.180.52:5173`** | Live dev server with hot-reload for pair programming & testing. |
| **Local Host** | **`http://localhost:5173`** or **`http://localhost:5000`** | On the host machine itself. |

> [!TIP]
> Make sure the device (phone/other laptop) is connected to the same Wi-Fi network or mobile hotspot as your host machine.
> If a device cannot connect, ensure Windows Firewall allows Node.js on Private Networks.

---

## 2. One-Click Launcher (`start-host.bat`)

Double-click [`start-host.bat`](file:///f:/resqgrid/start-host.bat) in the root of the project to launch both servers with network hosting enabled automatically.

---

## 3. Share Across the Internet (For Remote Judges / Evaluators)

If someone is outside your Wi-Fi network and needs to view the project:

### Option A: Free Instant Public Tunnel via LocalTunnel (Zero Install)
Run this command in any terminal:
```bash
npx localtunnel --port 5000
```
It will output a public URL like:
`https://clean-water-42.loca.lt`
Send this link to anyone in the world to access the complete application!

### Option B: Free Instant Tunnel via Ngrok
```bash
npx ngrok http 5000
```

---

## 4. Free Cloud Hosting Deployment

If you want permanent 24/7 cloud hosting:

### Backend + Frontend (Unified on Render.com)
1. Push `resqgrid` to GitHub.
2. Create a new **Web Service** on [Render.com](https://render.com).
3. Set:
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variable:** `NODE_ENV=production`
4. Render will provide a permanent `https://resqgrid.onrender.com` URL accessible by everyone worldwide.
