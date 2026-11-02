# Ghid: publicarea site-ului Themis Expert pe administrez.ro

Fluxul: eu scriu codul în GitHub → tu apeși „Update from Remote” și „Deploy” în cPanel → site-ul se actualizează.
Nu ai nevoie să îmi dai nicio parolă.

## Pasul 1. Creezi repository-ul pe GitHub (2 minute)
1. Intră pe https://github.com/new (cu contul `imsocurious`).
2. Repository name: `themis-site`.
3. Alege **Private**.
4. NU bifa „Add a README”, lasă-l complet gol.
5. Apasă **Create repository** și scrie-mi în chat că e gata.
6. Dacă nu ai făcut-o deja, dă-mi acces din https://claude.ai/connect-github .

Eu urc apoi fișierele site-ului în acest repository.

## Pasul 2. Cheia de acces între cPanel și GitHub (o singură dată)
Repository-ul fiind privat, cPanel are nevoie de o „cheie de citire” (deploy key). Ea permite doar citirea acestui repository, nimic altceva.

1. cPanel → **SSH Access** → **Manage SSH Keys** → **Generate a New Key**.
   - Key Name: `github_themis`
   - Key Type: RSA, Key Size: 4096
   - Parola cheii: lasă **goală** (altfel cPanel nu o poate folosi automat).
   - Apasă **Generate Key**.
2. Înapoi în **Manage SSH Keys**, la „Public Keys”, apasă **View/Download** pe `github_themis.pub` și copiază tot textul (începe cu `ssh-rsa`).
3. Pe GitHub: repository-ul `themis-site` → **Settings** → **Deploy keys** → **Add deploy key**.
   - Title: `cPanel administrez.ro`
   - Key: lipește textul copiat
   - **NU** bifa „Allow write access”.
   - **Add key**.
4. cPanel are nevoie să știe ce cheie să folosească pentru github.com. În cPanel → **Terminal** (dacă există) rulează:
   ```
   printf 'Host github.com\n  IdentityFile ~/.ssh/github_themis\n  IdentitiesOnly yes\n' >> ~/.ssh/config
   chmod 600 ~/.ssh/config
   ssh -T git@github.com
   ```
   La întrebarea „Are you sure you want to continue connecting” scrie `yes`. Mesajul „successfully authenticated” înseamnă că merge.
   Dacă nu ai Terminal în cPanel, spune-mi și găsim altă cale (ex. repository public, care nu are nevoie de cheie: codul site-ului nu conține secrete).

## Pasul 3. Clonezi repository-ul în cPanel
1. cPanel → **Git™ Version Control** → **Create**.
2. **Clone a Repository**: activat.
3. Clone URL: `git@github.com:imsocurious/themis-site.git`
4. Repository Path: `repositories/themis-site` (**nu** în public_html).
5. Repository Name: `themis-site` → **Create**.

## Pasul 4. Publicarea (de fiecare dată când îți spun că am o versiune nouă)
**Înainte de prima publicare:** fă o copie a ce există acum în `public_html` (cPanel → File Manager → selectezi tot → Compress), pentru că site-ul nou va scrie peste fișierele cu același nume.

1. cPanel → **Git™ Version Control** → la `themis-site` apasă **Manage** → tab-ul **Pull or Deploy**.
2. **Update from Remote** (aduce ultima versiune de pe GitHub).
3. **Deploy HEAD Commit** (copiază site-ul în `public_html` conform fișierului `.cpanel.yml`).

Notă: în `.cpanel.yml` trebuie înlocuit `UTILIZATOR` cu numele contului tău cPanel. Spune-mi-l (nu e secret) și îl pun eu.

## Pasul 5. Securitate (o singură dată)
1. **SSL/TLS Status** → verifică să fie activ certificatul (AutoSSL) pentru `administrez.ro` și `www.administrez.ro`. Site-ul redirecționează automat pe HTTPS.
2. **Email Accounts** → creează `no-reply@administrez.ro` (folosit ca expeditor de formularul de contact; e nevoie doar să existe).
3. **Zona privată Themis**: cPanel → **Directory Privacy** → `public_html/themis` → bifează „Password protect this directory” → nume „Themis beta” → **Save**, apoi creează câte un utilizator pentru fiecare client beta. Parolele le gestionezi tu, nu mi le trimite.
4. **MultiPHP Manager** → PHP 8.1 sau mai nou pentru administrez.ro.
