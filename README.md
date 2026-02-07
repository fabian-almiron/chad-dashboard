# Chad Dashboard 🦞

Beautiful system monitoring dashboard for your homelab server running OpenClaw.

## Features

- 🦞 **OpenClaw Status** - Gateway status, model info, WhatsApp connection
- 💻 **System Resources** - Real-time CPU, RAM, and Disk usage with progress bars
- 🌐 **Network Info** - Local IP, Tailscale IP, and access URLs
- ⚙️ **System Info** - Hostname, uptime, and running processes
- 🔄 **Auto-refresh** - Updates every 3 seconds
- 🎨 **Beautiful UI** - Built with Next.js 16, TypeScript, and Tailwind CSS

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Node.js 22

## Deployment

### Server Setup (Already Done!)
- Dashboard runs on port 3000
- Auto-starts on boot
- Displays on HDMI screen in kiosk mode

### Local Development

1. Clone the repo:
```bash
git clone https://github.com/fabian-almiron/chad-dashboard.git
cd chad-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

### Deploying Changes

After pushing to GitHub, SSH into your server and run:
```bash
ssh falmiron@192.168.1.223
~/deploy-dashboard.sh
```

Or run remotely:
```bash
ssh falmiron@192.168.1.223 "~/deploy-dashboard.sh"
```

## Access

- **Local Network**: http://192.168.1.223:3000
- **Tailscale**: http://100.100.81.11:3000
- **OpenClaw**: https://homebot.tail76d480.ts.net/

## Server Info

- **Server**: homebot (Ubuntu)
- **OpenClaw Version**: 2026.2.6-3
- **AI Model**: Claude 3.5 Haiku (Anthropic)
- **WhatsApp**: Connected
