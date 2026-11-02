<?php
// Themis Expert – formular de contact.
// Trimite mesajul pe e-mail folosind funcția mail() a serverului (cPanel).
// Protecții: doar POST, câmp-capcană anti-bot, timp minim de completare, limită de trimiteri pe IP,
// validare strictă și fără date ale vizitatorului în antetele e-mailului (anti header injection).

declare(strict_types=1);

const DESTINATAR = 'contact@administrez.ro';   // adresa care primește mesajele (nu apare pe site)
const EXPEDITOR  = 'no-reply@administrez.ro'; // o adresă de pe domeniu (creată în cPanel → Email Accounts)
const LIMITA_PE_ORA = 5;

function inapoi(string $rezultat): void {
    header('Location: /?trimis=' . $rezultat . '#contact', true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit;
}

// Capcană: boții completează câmpul ascuns.
if (!empty($_POST['website'])) { inapoi('ok'); }

// Formular completat prea repede (sub 3 secunde) sau marcaj lipsă.
$t = (int)($_POST['t'] ?? 0);
if ($t === 0 || time() - $t < 3 || time() - $t > 86400) { inapoi('eroare'); }

// Limită de trimiteri pe IP (stocată în afara folderului public).
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$dir = dirname(__DIR__) . '/themis_ratelimit';
if (!is_dir($dir)) { @mkdir($dir, 0700, true); }
$fisier = $dir . '/' . hash('sha256', $ip) . '.json';
$acum = time();
$istoric = [];
if (is_file($fisier)) {
    $istoric = array_filter(json_decode((string)file_get_contents($fisier), true) ?: [], fn($x) => $acum - (int)$x < 3600);
}
if (count($istoric) >= LIMITA_PE_ORA) { inapoi('eroare'); }
if (!$istoric && is_file($fisier)) { @unlink($fisier); } // fără înregistrări recente: ștergem fișierul

function camp(string $nume, int $max): string {
    $v = trim((string)($_POST[$nume] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
}

$nume        = camp('nume', 100);
$email       = camp('email', 150);
$telefon     = camp('telefon', 30);
$asociatie   = camp('asociatie', 150);
$apartamente = camp('apartamente', 6);
$mesaj       = camp('mesaj', 3000);
$acord       = ($_POST['acord'] ?? '') === '1'; // confirmarea citirii politicii de confidențialitate

if ($nume === '' || $mesaj === '' || !$acord || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    inapoi('eroare');
}

$corp = "Mesaj nou de pe administrez.ro\n\n"
      . "Nume: $nume\n"
      . "E-mail: $email\n"
      . "Telefon: $telefon\n"
      . "Asociație: $asociatie\n"
      . "Apartamente: $apartamente\n"
      . "Data: " . date('Y-m-d H:i') . "\n\n"
      . "Mesaj:\n$mesaj\n";

$antete = [
    'From' => 'Site Themis Expert <' . EXPEDITOR . '>',
    'Reply-To' => $email, // validat mai sus cu FILTER_VALIDATE_EMAIL, deci fără linii noi
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer' => 'administrez.ro',
];

$subiect = '=?UTF-8?B?' . base64_encode('Cerere nouă de contact – ' . mb_substr($nume, 0, 60)) . '?=';
$trimis = mail(DESTINATAR, $subiect, $corp, $antete, '-f' . EXPEDITOR);

if ($trimis) {
    $istoric[] = $acum;
    @file_put_contents($fisier, json_encode(array_values($istoric)), LOCK_EX);
    inapoi('ok');
}
inapoi('eroare');
