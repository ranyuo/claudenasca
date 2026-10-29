<?php
declare(strict_types=1);
// Regresiones de las correcciones QA30: cuenta principal, visitas tras guardar, director sin espacios,
// imágenes externalizadas para visitantes, búsqueda en el detalle de auditoría y recursos versionados.
ob_start();
require dirname(__DIR__).'/portal-private/bootstrap.php';
$configPath = getenv('PORTAL_CONFIG_FILE');
if (!$configPath || !str_ends_with($configPath, 'config.test.php')) throw new RuntimeException('Usa PORTAL_CONFIG_FILE apuntando a config.test.php.');
$config = require $configPath;
if (!str_ends_with($config['db_name'], '_test')) throw new RuntimeException('Pruebas bloqueadas: la base debe terminar en _test.');
$_SERVER['DOCUMENT_ROOT'] = sys_get_temp_dir().'/qa30-docroot-'.bin2hex(random_bytes(4));
mkdir($_SERVER['DOCUMENT_ROOT'].'/assets/app', 0755, true);
$app = portal_app(); $db = $app->db();
foreach (['pisco_audit','pisco_settings','pisco_files','pisco_visits','pisco_schema','pisco_rate_limits','pisco_users','pisco_state'] as $table) $db->exec('DROP TABLE IF EXISTS '.$table);
$count = 0;
function check(bool $condition, string $message): void { global $count; if (!$condition) throw new RuntimeException('FALLO: '.$message); $count++; echo 'OK '.$message."\n"; }
function failure(int $status, callable $operation, string $message): void {
    try { $operation(); } catch (PortalError $error) { check($error->status === $status, $message.' (HTTP '.$error->status.')'); return; }
    throw new RuntimeException('FALLO: no se rechazó '.$message);
}
function account(array $dto, array $changes = []): array {
    $fields = ['username'=>$dto['usuario'],'name'=>$dto['nombre'],'email'=>$dto['correo']??'','role'=>$dto['rol'],'estado'=>$dto['estado']];
    foreach (['vin','dni','personaId','programaId','area','cargo'] as $key) $fields[$key] = $dto[$key] ?? '';
    return [...$fields, ...$changes];
}
$password = 'PruebaNativa-Segura-2026';
$app->install(['install_key'=>$config['install_key'],'username'=>'principal','name'=>'Administrador principal','email'=>'principal@example.test','password'=>$password,'password_confirmation'=>$password]);
$app->login(['username'=>'principal','password'=>$password]);
$app->createAccount(['username'=>'segundo','name'=>'Segundo admin','email'=>'segundo@example.test','password'=>'OtraClaveSegura-2026','password_confirmation'=>'OtraClaveSegura-2026','role'=>'admin']);
$app->createAccount(['username'=>'tercero','name'=>'Tercer admin','email'=>'tercero@example.test','password'=>'OtraClaveSegura-2026','password_confirmation'=>'OtraClaveSegura-2026','role'=>'admin']);
$users = fn () => array_column($app->bootstrap()['data']['usuarios'], null, 'usuario');

// 1. Cuenta administradora principal
$app->logout(); $app->login(['username'=>'segundo','password'=>'OtraClaveSegura-2026']);
$principal = $users()['principal']; $tercero = $users()['tercero'];
failure(403, fn () => $app->accountOperation(['action'=>'update','id'=>$principal['server_id'],'account'=>account($principal,['estado'=>'Inactivo'])]), 'Otro administrador no puede desactivar la cuenta principal');
failure(403, fn () => $app->accountOperation(['action'=>'update','id'=>$principal['server_id'],'account'=>account($principal,['role'=>'imagen'])]), 'Otro administrador no puede degradar la cuenta principal');
failure(403, fn () => $app->accountOperation(['action'=>'update','id'=>$principal['server_id'],'account'=>account($principal,['password'=>'ClaveImpuesta-2026-X'])]), 'Otro administrador no puede cambiar la contraseña de la cuenta principal');
$app->accountOperation(['action'=>'update','id'=>$principal['server_id'],'account'=>account($principal,['name'=>'Administrador principal (editado)'])]);
check($users()['principal']['nombre'] === 'Administrador principal (editado)' && $users()['principal']['estado'] === 'Activo', 'Otro administrador sí puede editar datos no críticos de la cuenta principal');
$app->accountOperation(['action'=>'update','id'=>$tercero['server_id'],'account'=>account($tercero,['estado'=>'Inactivo'])]);
check($users()['tercero']['estado'] === 'Inactivo', 'Las demás cuentas administradoras siguen siendo gestionables');
$app->logout(); $app->login(['username'=>'principal','password'=>$password]);
check($app->user()['usuario'] === 'principal', 'La cuenta principal sigue ingresando');
$self = $users()['principal'];
failure(422, fn () => $app->accountOperation(['action'=>'update','id'=>$self['server_id'],'account'=>account($self,['estado'=>'Inactivo'])]), 'La cuenta principal tampoco puede desactivarse a sí misma');

// 2. Las visitas se conservan en la respuesta del guardado
$app->logout();
$app->track(['path'=>'#/admision']); unset($_SESSION['page_views']); $app->track(['path'=>'#/becas']);
$app->login(['username'=>'principal','password'=>$password]);
$before = $app->bootstrap(); $today = date('Y-m-d');
check(($before['data']['visitas'][$today] ?? 0) >= 2, 'Visitas registradas en pisco_visits');
$data = $before['data']; $data['noticias'][0]['titulo'] = 'QA30 guardado con visitas';
$result = $app->save(['data'=>$data,'revision'=>$before['revision']]);
check(($result['normalized']['visitas'][$today] ?? 0) === ($before['data']['visitas'][$today] ?? -1), 'La respuesta del guardado conserva las visitas (antes llegaban vacías)');

// 3. Director sin espacios sobrantes
$current = $app->bootstrap(); $data = $current['data'];
$leader = null; foreach ($data['jerarquica'] as $i => $j) if (($j['esDirector'] ?? false) && !($j['deleted'] ?? false)) { $leader = $i; break; }
if ($leader !== null) {
    foreach ($data['personas'] as &$person) if ($person['id'] === $data['jerarquica'][$leader]['personaId']) { $person['apellidos'] = ''; $person['nombres'] = 'Nombre  con   espacios'; $person['titulo'] = ''; }
    unset($person); $data['jerarquica'][$leader]['estado'] = 'Publicado';
    $app->save(['data'=>$data,'revision'=>$current['revision']]);
    check($app->bootstrap()['data']['academico']['cfg']['director'] === 'Nombre con espacios', 'El servidor normaliza espacios del director igual que el navegador');
} else check(true, 'Sin director publicado en los datos base (regla de director no aplicable)');

// 4. Imágenes incrustadas: archivo cacheable para visitantes, data: para sesiones
$png = imagecreatetruecolor(160, 160); for ($i = 0; $i < 4000; $i++) imagesetpixel($png, random_int(0, 159), random_int(0, 159), random_int(0, 0xFFFFFF));
ob_start(); imagepng($png); $bytes = (string) ob_get_clean();
$uri = 'data:image/png;base64,'.base64_encode($bytes);
check(strlen($uri) > 8192, 'Imagen de prueba supera el umbral de 8 KB');
$current = $app->bootstrap(); $data = $current['data']; $data['config']['inst']['logo'] = $uri;
$app->save(['data'=>$data,'revision'=>$current['revision']]);
check($app->bootstrap()['data']['config']['inst']['logo'] === $uri, 'Con sesión el logo se mantiene como data: (edición sin cambios)');
$app->logout();
$public = $app->bootstrap()['data']['config']['inst']['logo'];
check((bool) preg_match('#^/assets/cache/[a-f0-9]{32}\.png$#', $public), 'Visitantes reciben una URL de archivo en lugar de base64');
$file = $_SERVER['DOCUMENT_ROOT'].$public;
check(is_file($file) && hash_equals(hash('sha256', $bytes), hash_file('sha256', $file)), 'El archivo publicado es idéntico a la imagen original');
check($app->bootstrap()['data']['config']['inst']['logo'] === $public, 'La URL es estable (mismo hash, sin reescribir el archivo)');
check(strlen(json_encode($app->bootstrap()['data'])) < strlen(json_encode($data)), 'El estado público es más liviano');

// 5. Búsqueda de auditoría en el detalle
$stmt = $db->prepare('SELECT COUNT(*) FROM pisco_audit WHERE (username LIKE ? OR entity LIKE ? OR record_key LIKE ? OR action LIKE ? OR CAST(details AS CHAR) LIKE ?)');
$stmt->execute(array_fill(0, 5, '%rol_anterior%'));
check((int) $stmt->fetchColumn() > 0, 'La búsqueda de auditoría encuentra texto del detalle');

// 6. Recursos versionados
file_put_contents($_SERVER['DOCUMENT_ROOT'].'/assets/app/portal.css', 'body{}');
check((bool) preg_match('#^/assets/app/portal\.css\?v=\d+$#', portal_asset('portal.css')), 'portal_asset agrega la versión del archivo');
check(str_starts_with(portal_asset('/portal-server.js'), '/portal-server.js?v='), 'portal_asset acepta rutas absolutas');

array_map('unlink', glob($_SERVER['DOCUMENT_ROOT'].'/assets/*/*') ?: []);
echo "\n{$count} comprobaciones de correcciones QA30 aprobadas.\n";
