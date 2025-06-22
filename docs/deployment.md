# Deployment

Prepare [Cloudflare], [Tailscale], [Vultr] accounts and a custom domain.

[Cloudflare]: https://www.cloudflare.com/
[Tailscale]: https://tailscale.com/
[Vultr]: https://www.vultr.com/

1. In the Cloudflare dashboard, [add the domain] and [enforce HTTPS].

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

2. In the Vultr dashboard, [deploy a new instance].

[deploy a new instance]: https://my.vultr.com/deploy/

| Item                | Value                     |
| ------------------- | ------------------------- |
| Type                | Shared CPU                |
| Location            | Any                       |
| Plan                | `vhf-1c-1gb` ($6/mo)      |
| Operating System    | Rocky Linux x64 (latest)  |
| SSH Keys            | None                      |
| Firewall Group      | SSH Only                  |
| Additional Features | ✅ Public IPv4            |
| Additional Features | ✅ [Cloud-Init User-Data] |

| Plan         | Price | Type             | Storage    | Bandwidth |
| ------------ | ----- | ---------------- | ---------- | --------- |
| `vhf-1c-1gb` | $6/mo | High Frequency   | 32 GB NVMe | 1 TB/mo   |
| `vhp-1c-1gb` | $6/mo | High Performance | 25 GB NVMe | 2 TB/mo   |
| `vc2-1c-1gb` | $5/mo | Cloud Compute    | 25 GB SSD  | 1 TB/mo   |

[Cloud-Init User-Data]: ./cloud-init.yml

3. In the server (newly created instance), enable [Tailscale SSH].

[Tailscale SSH]: https://tailscale.com/kb/1193/tailscale-ssh

```shell
# Use the web console and the generated root account.
# Reference https://docs.vultr.com/vultr-web-console-faq

root # Login after the initial boot and setup are complete.
Password: # The password is shown alongside the IP address.

tailscale up --ssh # Reference https://tailscale.com/kb/1080/cli#ssh
```

4. In the Tailscale admin console, disable the server's [key expiry].

[key expiry]: https://tailscale.com/kb/1028/key-expiry#disabling-key-expiry

5. In the local machine, build and send the files to the server.

```properties
# Check and update the `.env.local` file.

# IP address or the Tailscale machine name:
SERVER_ADDRESS="<vultr-instance-identifier>"
SERVER_USERNAME="webadmin" # keep as-is
SERVER_DIRECTORY="server" # keep as-is
```

```shell
node --run build:send
```

6. In the local machine, SSH into the server.

```shell
ssh webadmin@<vultr-instance-identifier>
```

7. In the server, install and configure [fnm], [PM2], and [cloudflared].

[fnm]: https://github.com/Schniz/fnm#readme
[PM2]: https://pm2.keymetrics.io/
[cloudflared]: https://github.com/cloudflare/cloudflared#readme

<!-- Cannot install fnm using `su` or `sudo -u` in runcmd. -->
<!-- Reference https://github.com/Schniz/fnm/issues/1315 -->

```shell
bash ~/init.sh # Setup fnm and PM2.
source ~/.bashrc

cloudflared tunnel login
# Visit the provided URL in a web browser.
# Select a zone (domain) and authorize it.

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

8. In the server, start the SvelteKit application.

```shell
cd ~/server
nano .env.production # Update environment variables.

pnpm i --prod
pnpm db:migrate:prod
node --run start:pm2

echo "@reboot source ~/.bashrc && cd ~/server && node --run start:pm2" | crontab -
```

## Maintenance

Update PM2 Processes to Latest Node.js LTS

```shell
pm2 info server
# node.js version │ 22.14.0

fnm install --lts
# Installing Node v22.15.1 (x64)

fnm default 22
fnm use 22 # Using Node v22.15.1

pm2 update

pm2 info server
# node.js version │ 22.15.1
```
