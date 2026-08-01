# Self-Deploy Guide

This walks through running your own PLInt instance on a Linux server you
control. It's written for anyone deploying PLInt, not just the original
author - adjust paths, domains, and service names to fit your setup.

## Prerequisites

- A Linux server (Debian/Ubuntu commands are used below; adjust for your
  distro) with SSH access.
- **Node.js 22.12 or newer** (TanStack Start requires it). Check with `node -v`.
- **PM2** for process management: `npm install -g pm2`.
- **Git**, for cloning the repo and pulling updates.
- A domain name pointed at your server, if you want it reachable from the
  internet (optional - PLInt works fine on `localhost` too).

## 1. Get the code

```bash
git clone https://github.com/<your-fork-or-org>/PLInt.git
cd PLInt
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

- `PORT` / `HOST` - where the app listens. `127.0.0.1` is a sensible
  default if you're putting a reverse proxy in front of it (see step 5).
- `GITHUB_WEBHOOK_SECRET` - only needed if you want auto-updates (step 6).
  Generate one with `openssl rand -hex 32`.

## 3. Build

```bash
npm run build
```

This produces `.output/server/index.mjs`, a self-contained Node server.

> **Note on the build tool:** PLInt builds with Nitro v3, which at the time
> of writing is a beta package (`nitro@3.0.260603-beta` in `package.json`).
> It's been reliable in testing, but if you hit a build or startup error
> that looks Nitro-related, two options: pin an older/newer `nitro` version
> in `package.json`, or switch `vite.config.ts` to the older
> `@tanstack/nitro-v2-vite-plugin`. Check `npm ls nitro` and the [TanStack
> Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/hosting)
> for what's current.

## 4. Run it with PM2

```bash
pm2 start ecosystem.config.cjs --only plint
pm2 save
pm2 startup   # follow the printed instructions to start PM2 on boot
```

Check it's up:

```bash
curl http://127.0.0.1:3006
pm2 logs plint
```

## 5. Put it behind a reverse proxy (recommended)

Running Node directly on port 80/443 needs root and isn't great practice.
Pick one:

### Option A: Caddy (simplest, automatic HTTPS)

```
# /etc/caddy/Caddyfile
your-domain.example {
    reverse_proxy 127.0.0.1:3006
}
```

```bash
sudo systemctl reload caddy
```

### Option B: nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.example;

    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then get a certificate with `certbot`.

### Option C: Cloudflare Tunnel (no open inbound ports at all)

If your domain's DNS is on Cloudflare, a Tunnel avoids opening any inbound
port on your server or router entirely - useful behind CGNAT or a
restrictive firewall.

```bash
# Install cloudflared, then:
cloudflared tunnel login
cloudflared tunnel create plint
cloudflared tunnel route dns plint your-domain.example
```

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: plint
credentials-file: /home/<you>/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: your-domain.example
    service: http://127.0.0.1:3006
  - service: http_status:404
```

Run it as a service:

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

## 6. Auto-updates via GitHub webhook (optional)

PLInt ships a tiny, dependency-free webhook listener
(`scripts/deploy/webhook-server.js`) that redeploys automatically on every
push to your deploy branch.

Start it:

```bash
pm2 start ecosystem.config.cjs --only plint-webhook
pm2 save
```

It listens on `127.0.0.1:9000/webhook` by default (see `WEBHOOK_PORT` in
`.env`). Expose that path publicly through your reverse proxy - for
example, with Caddy:

```
your-domain.example {
    reverse_proxy /webhook 127.0.0.1:9000
    reverse_proxy 127.0.0.1:3006
}
```

Or route it through the same Cloudflare Tunnel by adding another `ingress`
entry pointing `/webhook` at `http://127.0.0.1:9000`.

Then, in your GitHub repo: **Settings → Webhooks → Add webhook**

- **Payload URL**: `https://your-domain.example/webhook`
- **Content type**: `application/json`
- **Secret**: the same value as `GITHUB_WEBHOOK_SECRET` in `.env`
- **Which events**: "Just the push event"

Push to your deploy branch (`main` by default - change with `DEPLOY_BRANCH`
in `.env`) and check `logs/deploy.log` to confirm it ran.

## 7. Install language interpreters as you need them

Every server-executed language works out of the box in the sense that it
tells you exactly what's missing if its interpreter isn't installed - the
app never needs a restart to pick up a newly-installed one. See
`scripts/install-interpreters.sh` for an apt-based installer, split into a
light default tier and a heavier opt-in tier:

```bash
bash scripts/install-interpreters.sh --list      # see what's covered
bash scripts/install-interpreters.sh             # install the light tier
bash scripts/install-interpreters.sh --tier2     # add the heavier tier
```

## Updating manually

If you're not using the webhook, or just want to force an update:

```bash
bash scripts/deploy/update.sh
```

## Troubleshooting

- **`pm2 logs plint` shows a port-in-use error** - something else is
  already bound to `PORT`. Change it in `.env`, then reload by referencing
  the ecosystem file so PM2 actually re-reads it:
  `pm2 reload ecosystem.config.cjs --only plint --update-env`.
  (Plain `pm2 restart plint` reuses PM2's cached env and won't pick up
  the change.)
- **The webhook returns a Cloudflare 502** - this means nothing is
  answering on the port Cloudflare Tunnel is routing to, not that your
  app rejected the request. The most common cause: you changed
  `WEBHOOK_PORT` (in `.env` or `ecosystem.config.cjs`) or the tunnel's
  routed port, but `plint-webhook` is still running with its old,
  cached port from whenever it was last started. `git pull` alone
  doesn't restart it, PM2 caches env vars at start time. Fix:
  `pm2 reload ecosystem.config.cjs --only plint-webhook --update-env`,
  then confirm it's actually listening: `ss -tlnp | grep <port>`. Pushes
  that touch `ecosystem.config.cjs` or `scripts/deploy/webhook-server.js`
  now trigger this automatically (see `scripts/deploy/update.sh`), but
  a change you deploy manually or via commands run directly on the
  server still needs the manual reload above.
- **A language always says "not found"** - its interpreter isn't
  installed, or isn't on the `PATH` that PM2's process sees. Confirm with
  `which <the-binary>` as the same user PM2 runs as.
- **The webhook returns 401** - the secret in `.env` doesn't match what
  you entered in GitHub's webhook settings. Also confirm
  `GITHUB_WEBHOOK_SECRET` actually reaches the process:
  `pm2 env plint-webhook | grep GITHUB_WEBHOOK_SECRET` (empty means the
  reload above didn't pick up `.env`, e.g. it's not next to
  `ecosystem.config.cjs`).
- **Build fails after a `git pull`** - check `npm ls nitro` against the
  version pinned in `package.json`; see the Nitro note in step 3.
