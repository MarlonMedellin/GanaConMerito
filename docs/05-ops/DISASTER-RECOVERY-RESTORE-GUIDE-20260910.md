---
id: DISASTER-RECOVERY-RESTORE-GUIDE-20260910
name: disaster-recovery-restore-guide
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: ops
last_reviewed: 2026-09-10
---

# Guía de Restauración de Sistema Post-Instalación Limpia (Disaster Recovery)

<!--
Agent: Google_Antigravity
Model: gemini-3.6-flash
Via: CLI
Contributor: Google_Antigravity
Environment: ASUS_WINDOWS11_WSL2
Validation: Backup archive verified on OneDrive & Git remote pushed
-->

## 1. Contexto del Respaldo de Emergencia (2026-09-10)

Debido a un fallo inminente del equipo físico de desarrollo, se realizó un respaldo completo de emergencia que fue guardado en **OneDrive**:

* **Archivo ZIP Maestro**: `gcm-full-system-disaster-recovery-20260910.zip`
* **Ramas de Respaldo Git en Remote GitHub (`origin`)**:
  * `backup/emergency-vnext-20260910`
  * `backup/emergency-gcm-local-20260910`

---

## 2. Contenido del Archivo `gcm-full-system-disaster-recovery-20260910.zip`

El archivo ZIP guardado en OneDrive contiene la siguiente estructura interna:

```text
gcm-full-system-disaster-recovery-20260910/
├── ssh/
│   ├── ssh-key-2026-04-03.key         # Llave privada SSH para Oracle VPS (ganaconmerito)
│   ├── id_ed25519                     # Llave privada SSH para Hostinger VPS
│   ├── id_ed25519.pub                 # Llave pública SSH
│   ├── id_vps_re                      # Llave SSH auxiliar VPS
│   ├── config                         # Configuración de Hosts SSH (~/.ssh/config)
│   └── known_hosts                    # Fingerprints de servidores conocidos
├── env/
│   ├── gcm-practice-tutor-vnext.env   # Variables de entorno .env de la aplicación
│   ├── gcm-practice-tutor-vnext.env.local
│   ├── gcm-practice-tutor-vnext.env.local.invalid-dns-backup
│   └── gcm-local.env.local            # Variables de entorno local
├── infra/
│   ├── iagent-origin-cert.pem         # Certificado SSL Origen de Cloudflare
│   ├── iagent-origin-key.pem          # Clave privada SSL Origen de Cloudflare
│   ├── technical_audit_vps.md         # Mapeo técnico de IPs, subdominios y puertos VPS
│   ├── tls.yml                        # Configuración de proxy TLS
│   └── docker-compose.yml             # Composición de contenedores
├── prd/
│   └── GCM-PRD-Experiencia-Practica-Tutor-vNext.md  # Especificación funcional del Tutor
├── shell/
│   ├── bashrc                         # Personalización de terminal bash (~/.bashrc)
│   ├── gitconfig                      # Configuración de autor Git (~/.gitconfig)
│   └── profile                        # Perfil de sesión Linux (~/.profile)
├── AdminVPS/                          # Scripts y configuraciones completas de Admin VPS
└── HostingerOpenClaw/                 # Composiciones Docker y configs de Hostinger
```

---

## 3. Guía Paso a Paso para la Instalación Limpia

### Paso 1: Configurar WSL2 en la nueva máquina
1. En Windows Terminal (PowerShell como Administrador), ejecuta:
   ```powershell
   wsl --install -d Ubuntu-24.04
   ```
2. Inicia sesión en Ubuntu y actualiza el sistema:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl wget unzip build-essential
   ```

### Paso 2: Copiar el ZIP desde OneDrive a la nueva WSL2
1. Copia `gcm-full-system-disaster-recovery-20260910.zip` desde OneDrive a tu usuario en WSL (por ejemplo en `~/`):
   ```bash
   cp /mnt/c/Users/TU_USUARIO_WINDOWS/OneDrive/gcm-full-system-disaster-recovery-20260910.zip ~/
   cd ~
   unzip gcm-full-system-disaster-recovery-20260910.zip -d ~/gcm-backup-restored
   ```

### Paso 3: Restaurar Llaves SSH y Configuración de Servidores
1. Crea la carpeta `~/.ssh` y copia las llaves con permisos estrictos:
   ```bash
   mkdir -p ~/.ssh
   cp ~/gcm-backup-restored/ssh/* ~/.ssh/
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/*
   ```
2. Verifica la conectividad con el VPS de Oracle (OCI):
   ```bash
   ssh ganaconmerito
   ```
3. Verifica la conectividad con Hostinger:
   ```bash
   ssh hostinger
   ```

### Paso 4: Clonar el Repositorio desde GitHub
1. Configura Git con tu perfil:
   ```bash
   cp ~/gcm-backup-restored/shell/gitconfig ~/.gitconfig
   ```
2. Crea la estructura de carpetas habitual y clona el repositorio principal:
   ```bash
   mkdir -p ~/GIT-ANTIGRAVITY-WSL/OpenClaw-03042026
   cd ~/GIT-ANTIGRAVITY-WSL/OpenClaw-03042026
   git clone https://github.com/MarlonMedellin/GanaConMerito.git gcm-practice-tutor-vnext
   ```

### Paso 5: Restaurar Archivos de Entorno (`.env`), Certificados SSL e Infraestructura
1. Restaurar `.env` en `gcm-practice-tutor-vnext`:
   ```bash
   cd ~/GIT-ANTIGRAVITY-WSL/OpenClaw-03042026/gcm-practice-tutor-vnext
   cp ~/gcm-backup-restored/env/gcm-practice-tutor-vnext.env .env
   cp ~/gcm-backup-restored/env/gcm-practice-tutor-vnext.env.local .env.local
   ```
2. Restaurar Certificados SSL Origen e Infraestructura en la carpeta raíz `OpenClaw-03042026`:
   ```bash
   cd ~/GIT-ANTIGRAVITY-WSL/OpenClaw-03042026
   cp ~/gcm-backup-restored/infra/* ./
   cp ~/gcm-backup-restored/prd/* ./
   cp ~/gcm-backup-restored/ssh/ssh-key-2026-04-03.key ./
   cp -r ~/gcm-backup-restored/AdminVPS ./
   cp -r ~/gcm-backup-restored/HostingerOpenClaw ./
   ```
3. Restaurar configuraciones de terminal:
   ```bash
   cp ~/gcm-backup-restored/shell/bashrc ~/.bashrc
   source ~/.bashrc
   ```

### Paso 6: Reinstalar Dependencias y Probar Entorno Local
1. Instala Node.js 20+ y pnpm/npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
2. Instala dependencias del proyecto:
   ```bash
   cd ~/GIT-ANTIGRAVITY-WSL/OpenClaw-03042026/gcm-practice-tutor-vnext
   npm install
   ```
3. Inicia el servidor de desarrollo local para confirmar que todo funciona:
   ```bash
   npm run dev
   ```

---

## 4. Estado de Producción y Referencias

* **URL Pública de Producción**: `https://ganaconmerito.com`
* **IP VPS Oracle (OCI)**: `149.130.188.157` (Usuario: `ubuntu`)
* **IP VPS Hostinger**: `168.231.64.247` (Usuario: `root`)
* **Contenedor Activo en Producción**: `gcm-production-e4b3456` (Puerto `3008`)
* **Base de Datos Supabase de Producción**: `https://dhiytzbwodfvdrnwhkcw.supabase.co`
