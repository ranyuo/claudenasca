#!/usr/bin/env bash
# Crea (o reinicia) una instalación LOCAL de demostración del portal con datos ficticios,
# lista para tomar las capturas del manual. No toca ningún portal en línea.
# Requisitos: PHP 8.2+, MariaDB/MySQL en local, Node 18+ con Playwright.
# Uso: [PUERTO=8081 DB=portal_demo_2] herramientas/preparar-demo.sh [carpeta-de-trabajo]
# Con PUERTO y DB distintos se pueden tener varias instalaciones de prueba a la vez.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TRABAJO="${1:-${TMPDIR:-/tmp}/portal-demo-manual-${PUERTO:-8080}}"
DB=${DB:-portal_demo}; DBU=demo; DBP=demo_pass_local; PUERTO=${PUERTO:-8080}
ADMIN_USER=admin.ica; ADMIN_PASS=DemoManual2026

mysql -e "DROP DATABASE IF EXISTS $DB; CREATE DATABASE $DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '$DBU'@'localhost' IDENTIFIED BY '$DBP'; GRANT ALL ON $DB.* TO '$DBU'@'localhost'; FLUSH PRIVILEGES;"
rm -rf "$TRABAJO"; mkdir -p "$TRABAJO"
cp -r "$REPO/portal-private" "$REPO/public_html" "$TRABAJO/"
rm -f "$TRABAJO"/portal-private/config.php "$TRABAJO"/portal-private/*.lock
KEY=$(openssl rand -hex 24)
cat > "$TRABAJO/portal-private/config.php" <<PHP
<?php
return ['db_host'=>'127.0.0.1','db_port'=>3306,'db_name'=>'$DB','db_user'=>'$DBU','db_password'=>'$DBP',
  'install_key'=>'$KEY','secure_cookies'=>false,'timezone'=>'America/Lima'];
PHP
pkill -f "php -S 127.0.0.1:$PUERTO" 2>/dev/null || true
(cd "$TRABAJO/public_html" && setsid nohup php -S 127.0.0.1:$PUERTO > "$TRABAJO/php.log" 2>&1 < /dev/null &)
for _ in $(seq 1 30); do curl -sf -o /dev/null "http://127.0.0.1:$PUERTO/install.php" && break; sleep 0.3; done

# Instalación con el administrador de demostración
CJ="$TRABAJO/cookies.txt"
T=$(curl -s -c "$CJ" "http://127.0.0.1:$PUERTO/install.php" | grep -o 'name="_csrf" value="[^"]*"' | cut -d'"' -f4)
curl -s -b "$CJ" -c "$CJ" "http://127.0.0.1:$PUERTO/install.php" --data-urlencode "_csrf=$T" --data-urlencode "install_key=$KEY" \
  -d name=Administrador+del+portal -d username=$ADMIN_USER -d email=admin@ica.aplicacion.io \
  -d password=$ADMIN_PASS -d password_confirmation=$ADMIN_PASS | grep -q "Instalación completada"

# Sustituye identidad y personas reales por datos ficticios
mysql --default-character-set=utf8mb4 --raw -N $DB -e "SELECT data FROM pisco_state WHERE id=1" > "$TRABAJO/estado.json"
python3 -I "$(dirname "$0")/anonimizar.py" "$TRABAJO/estado.json" "$TRABAJO/estado-demo.json"
php -r '$pdo=new PDO("mysql:host=127.0.0.1;dbname='$DB';charset=utf8mb4","'$DBU'","'$DBP'");
  $pdo->prepare("UPDATE pisco_state SET data=?, revision=revision+1 WHERE id=1")->execute([file_get_contents($argv[1])]);' "$TRABAJO/estado-demo.json"
echo "Demo lista en http://127.0.0.1:$PUERTO  (usuario $ADMIN_USER)"
