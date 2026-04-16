<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/../data/data.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($dataFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Archivo no encontrado']);
        exit;
    }
    echo file_get_contents($dataFile);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = file_get_contents('php://input');
    $decoded = json_decode($body);
    if ($decoded === null) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON inválido']);
        exit;
    }
    $result = file_put_contents(
        $dataFile,
        json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo guardar el archivo']);
        exit;
    }
    echo json_encode(['ok' => true]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
