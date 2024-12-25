# Deployment

In this guide, [Cloudflare] and [Vultr] (Paid) will be used.

[Cloudflare]: https://www.cloudflare.com/
[Vultr]: https://www.vultr.com/

1. Generate an [SSH key] and add it to the ssh-agent.
2. Prepare a custom domain. Purchase one if needed.
3. In Cloudflare, [add the domain] and [enforce HTTPS].

[SSH key]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
[add the domain]: https://developers.cloudflare.com/fundamentals/setup/manage-domains/add-site/
[enforce HTTPS]: https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/

```
# https://dash.cloudflare.com

Websites
├── [+ Add a domain]
└── <selected-domain>
    └── SSL/TLS
        ├── Overview
        │   └── Current encryption mode: Full (strict)
        └── Edge Certificates
            └── ✅ Always Use HTTPS
```

4. In Vultr, [deploy a new instance]. ($5/month~)

[deploy a new instance]: ./vultr.md

5. Update the `.env.production.local` file.

```shell
EMAIL_API_KEY="" # required
EMAIL_SENDER="" # required

SERVER_ADDRESS="<vultr-instance-ip-address>" # required
SERVER_USERNAME="webadmin" # keep the default value
SERVER_DIRECTORY="server" # keep the default value
```

6. Build and send files to the server.

```shell
node --run build:send
```

7. SSH into the server.

```shell
ssh webadmin@<vultr-instance-ip-address>
```

8. Setup [fnm], Node.js, [PM2], and [cloudflared].

[fnm]: https://github.com/Schniz/fnm#readme
[PM2]: https://pm2.keymetrics.io/
[cloudflared]: https://github.com/cloudflare/cloudflared#readme

```shell
# server

curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
source ~/.bashrc

fnm install --lts # Installing Node v22.x.y
fnm use 22 # use the version logged above.

corepack install --global pnpm

pnpm setup
source ~/.bashrc

pnpm add pm2@latest --global
pm2 install pm2-logrotate

cloudflared tunnel login
# 1. Visit the URL in the client browser.
# 2. Select a zone (domain) and authorize it.

cloudflared tunnel create <NAME>
# Created tunnel <NAME> with id <Tunnel-UUID>

nano /etc/cloudflared/config.yml
# Replace <Tunnel-UUID> with the value logged above.

sudo cloudflared service install
sudo systemctl start cloudflared

sudo systemctl status cloudflared
# INF Registered tunnel connection connIndex=1
# INF Registered tunnel connection connIndex=2
# ...

cloudflared tunnel route dns <Tunnel-UUID> <hostname>
# Hostname is the desired domain. (e.g. example.com, sub.example.com)
# Hostname must match the domain authorized in the cloudflared login.
```

9. Start Node.js server using PM2

```shell
# server

cd ~/server
nano .env.production
# Update environment variables according to the comments.

pnpm i --prod
pnpm db:migrate:prod
node --run start:pm2

EDITOR=nano crontab -e
# Add this line to start the PM2 applications on system startup:
# @reboot source ~/.bashrc && cd ~/server && node --run start:pm2
```
