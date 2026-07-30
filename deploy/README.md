# VPS deployment

Target layout:

- Application: `/var/www/kye/frontend`
- SQLite database: `/var/lib/kye/site-content.sqlite`
- Uploaded images: `/var/lib/kye/uploads`
- Secrets: `/etc/kye.env`
- Local application port: `4012`

The first application start imports `data/site-content.json` into SQLite. Keep the JSON file in the deployment package for the initial migration. Later changes are stored only in SQLite.

## Server prerequisites

Install Node.js 22 LTS, Git, Nginx and Certbot on an Ubuntu/Debian VPS. The native SQLite dependency also needs the standard build toolchain when a matching prebuilt binary is unavailable.

```bash
sudo apt update
sudo apt install -y git nginx certbot python3-certbot-nginx build-essential
```

## Persistent directories

```bash
sudo install -d -o www-data -g www-data /var/lib/kye /var/lib/kye/uploads
sudo install -d -o www-data -g www-data /var/www/kye
```

Create `/etc/kye.env` with mode `600`:

```text
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_SESSION_SECRET=your-random-64-character-secret
SQLITE_DATABASE_PATH=/var/lib/kye/site-content.sqlite
UPLOAD_DIRECTORY=/var/lib/kye/uploads
```

## Build and service

Clone the repository into `/var/www/kye`, install production dependencies, and build the app:

```bash
cd /var/www/kye/frontend
npm ci
npm run build
sudo chown -R www-data:www-data /var/www/kye
```

Install `deploy/kye.service` as `/etc/systemd/system/kye.service`, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kye
sudo systemctl status kye
```

Replace `YOUR_DOMAIN` in `deploy/nginx-kye.conf`, install it as `/etc/nginx/sites-available/kye`, enable it, and request HTTPS:

```bash
sudo ln -s /etc/nginx/sites-available/kye /etc/nginx/sites-enabled/kye
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

Back up both the SQLite database and upload directory. For a consistent online SQLite backup, use SQLite's `.backup` command rather than copying an active WAL database directly.
