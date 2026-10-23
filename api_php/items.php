<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $sql = "SELECT i.*, c.nama AS kategori_nama, w.nama AS warehouse_nama 
                FROM items i 
                LEFT JOIN categories c ON i.category_id = c.id 
                LEFT JOIN warehouses w ON i.warehouse_id = w.id 
                WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (i.nama LIKE :s1 OR i.sku LIKE :s2 OR i.barcode LIKE :s3)";
            $params[':s1'] = "%$search%";
            $params[':s2'] = "%$search%";
            $params[':s3'] = "%$search%";
        }

        $sql .= " ORDER BY i.id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'source' => 'PHP PDO Architecture',
            'data' => $items
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode HTTP tidak didukung']);
}
