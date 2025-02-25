# Deploy a new instance in Vultr

- Create a new [firewall group](https://my.vultr.com/firewall/) with a 'SSH Only' description.
- Add the default rule to create the following inbound rules:

| Action | Protocol | Port (or range) | Source (IPv4) |
| ------ | -------- | --------------- | ------------- |
| accept | SSH      | 22              | 0.0.0.0/0     |

- Deploy a [new instance](https://my.vultr.com/deploy/) with the following options:

| Item                | Value                                       |
| ------------------- | ------------------------------------------- |
| Location            | Any                                         |
| Type                | Shared CPU                                  |
| Plan                | `vc2-1c-1gb` ($5/month)                     |
| Operating System    | Rocky Linux 9 x64                           |
| SSH Keys            | None                                        |
| Firewall Group      | SSH Only                                    |
| Additional Features | ✅ Public IPv4<br />✅ Cloud-Init User-Data |

- Add the following content into the Cloud-Init user data text field.
- Add your SSH public key(s) to the `ssh_authorized_keys` array.

```yaml
#cloud-config

disable_root: true
ssh_pwauth: false

users:
  - default
  - name: webadmin
    shell: /bin/bash
    lock_passwd: true
    sudo:
      - 'ALL=(ALL) NOPASSWD:/bin/cloudflared service install'
      - 'ALL=(ALL) NOPASSWD:/bin/systemctl * cloudflared'
      - 'ALL=(ALL) NOPASSWD:/bin/systemctl * nginx'
      - 'ALL=(ALL) NOPASSWD:/usr/sbin/nginx'
    ssh_authorized_keys:
      - ssh-rsa AAAAB3... # add actual key(s)

yum_repos:
  cloudflared-stable:
    # Reference https://pkg.cloudflare.com/index.html
    name: cloudflared-stable
    baseurl: https://pkg.cloudflare.com/cloudflared/rpm
    enabled: true
    type: rpm
    gpgcheck: true
    gpgkey: https://pkg.cloudflare.com/cloudflare-ascii-pubkey.gpg

  nginx-stable:
    # Reference http://nginx.org/en/linux_packages.html#RHEL
    name: nginx stable repo
    baseurl: http://nginx.org/packages/centos/$releasever/$basearch/
    enabled: true
    gpgcheck: true
    gpgkey: https://nginx.org/keys/nginx_signing.key
    module_hotfixes: true

package_update: true
package_upgrade: true
package_reboot_if_required: true

packages:
  - cloudflared
  - nginx
  - yum-utils

write_files:
  - path: /etc/cloudflared/config.yml
    content: |
      url: http://localhost:8000
      tunnel: <Tunnel-UUID>
      credentials-file: /home/webadmin/.cloudflared/<Tunnel-UUID>.json

  - path: /etc/nginx/conf.d/default.conf
    content: |
      limit_req_zone $binary_remote_addr zone=sveltekit_limit:10m rate=10r/s;

      server {
        listen 8000;
        client_max_body_size 1m;
        server_tokens off;

        location / {
          root /home/webadmin/server/static;
          try_files $uri @sveltekit;
          expires 30d;
        }

        location ~ \.(css|js|woff2)$ {
          proxy_pass http://localhost:3000;
        }

        location @sveltekit {
          limit_req zone=sveltekit_limit burst=20 nodelay;
          proxy_pass http://localhost:3000;
        }
      }

  - path: /home/webadmin/.bash_profile
    content: |
      if [ -f ~/.bashrc ]; then
        source ~/.bashrc
      fi

  - path: /home/webadmin/.bashrc
    append: true
    content: |

      # fnm
      FNM_PATH="/home/webadmin/.local/share/fnm"
      if [ -d "$FNM_PATH" ]; then
        export PATH="$FNM_PATH:$PATH"
        eval "$(fnm env --use-on-cd --corepack-enabled)"
      fi

bootcmd:
  - fallocate -l 2G /swapfile
  - chmod 600 /swapfile
  - mkswap /swapfile
  - swapon /swapfile
  - echo '/swapfile none swap sw 0 0' >> /etc/fstab

runcmd:
  - setfacl -m u:webadmin:rw- /etc/cloudflared/config.yml

  - setfacl -R -m u:webadmin:rwx /etc/nginx/conf.d
  - setfacl -d -m u:webadmin:rw- /etc/nginx/conf.d

  - setfacl -R -m u:webadmin:r-x /var/log/nginx
  - setfacl -d -m u:webadmin:r-- /var/log/nginx

  - mkdir -p /home/webadmin/server/static
  - chown -R webadmin:webadmin /home/webadmin
  - chmod 700 /home/webadmin

  - setfacl -m u:nginx:r-x /home/webadmin
  - setfacl -m u:nginx:r-x /home/webadmin/server
  - setfacl -R -m u:nginx:r-x /home/webadmin/server/static
  - setfacl -d -m u:nginx:r-x /home/webadmin/server/static

  - setsebool -P httpd_can_network_connect 1
  - semanage port -a -t http_port_t -p tcp 8000 || semanage port -m -t http_port_t -p tcp 8000
  - semanage fcontext -a -t httpd_sys_content_t "/home/webadmin/server/static(/.*)?"
  - restorecon -Rv /home/webadmin/server/static

  - systemctl enable nginx
  - systemctl start nginx
```
