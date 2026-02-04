<?php
// منع أي مخرجات غير مقصودة قبل JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header('Content-Type: application/json; charset=utf-8');

// التعامل مع طلبات OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---------------------------------------------------------
// إعدادات الاتصال بقاعدة البيانات
// ---------------------------------------------------------
// قم بتعديل القيم أدناه لتطابق بيانات Hostinger MySQL Database
$db_config = [
    'host' => 'localhost',
    'dbname' => 'u123456789_database_name', // استبدل هذا باسم قاعدة البيانات من هوستنجر
    'username' => 'u123456789_username',    // استبدل هذا باسم المستخدم من هوستنجر
    'password' => 'password'                // استبدل هذا بكلمة المرور
];

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$input = json_decode(file_get_contents('php://input'), true);

// ---------------------------------------------------------
// GET REQUESTS
// ---------------------------------------------------------
if ($method === 'GET') {
    if ($action === 'getData') {
        try {
            // جلب المعاملات
            $stmt = $pdo->query("SELECT * FROM transactions ORDER BY date DESC");
            $transactions = $stmt->fetchAll();
            
            foreach ($transactions as &$t) {
                $t['isPaid'] = (bool)$t['isPaid'];
                $t['amount'] = (float)$t['amount'];
                $t['quantity'] = (int)$t['quantity'];
                $t['exchangeRate'] = (float)$t['exchangeRate'];
            }

            // جلب المستخدمين
            $stmtUsers = $pdo->query("SELECT * FROM users");
            $users = $stmtUsers->fetchAll();

            // جلب الإعدادات
            $stmtRates = $pdo->query("SELECT value FROM settings WHERE key_name = 'rates'");
            $ratesRow = $stmtRates->fetch();
            $rates = $ratesRow ? json_decode($ratesRow['value'], true) : ["USD" => 1];

            $stmtConfig = $pdo->query("SELECT value FROM settings WHERE key_name = 'config'");
            $configRow = $stmtConfig->fetch();
            $appConfig = $configRow ? json_decode($configRow['value'], true) : ['sheetUrl' => '', 'googleSheetId' => ''];

            echo json_encode([
                'transactions' => $transactions,
                'users' => $users,
                'config' => array_merge($appConfig, ['rates' => $rates])
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit;
    }
}

// ---------------------------------------------------------
// POST REQUESTS
// ---------------------------------------------------------
if ($method === 'POST') {
    try {
        if ($action === 'saveTransaction') {
            $sql = "INSERT INTO transactions (id, invoiceNumber, date, type, description, amount, quantity, customerName, isPaid, currency, exchangeRate)
                    VALUES (:id, :invoiceNumber, :date, :type, :description, :amount, :quantity, :customerName, :isPaid, :currency, :exchangeRate)
                    ON DUPLICATE KEY UPDATE 
                    invoiceNumber=:invoiceNumber, date=:date, type=:type, description=:description, amount=:amount, quantity=:quantity, 
                    customerName=:customerName, isPaid=:isPaid, currency=:currency, exchangeRate=:exchangeRate";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $input['id'],
                ':invoiceNumber' => $input['invoiceNumber'],
                ':date' => $input['date'],
                ':type' => $input['type'],
                ':description' => $input['description'],
                ':amount' => $input['amount'],
                ':quantity' => $input['quantity'],
                ':customerName' => $input['customerName'],
                ':isPaid' => $input['isPaid'] ? 1 : 0,
                ':currency' => $input['currency'],
                ':exchangeRate' => $input['exchangeRate'] ?? 1
            ]);
            echo json_encode(['success' => true]);
        }

        elseif ($action === 'togglePaid') {
            $stmt = $pdo->prepare("UPDATE transactions SET isPaid = NOT isPaid WHERE id = :id");
            $stmt->execute([':id' => $input['id']]);
            echo json_encode(['success' => true]);
        }

        elseif ($action === 'updateRates') {
            $ratesJson = json_encode($input);
            $stmt = $pdo->prepare("INSERT INTO settings (key_name, value) VALUES ('rates', :val) ON DUPLICATE KEY UPDATE value=:val");
            $stmt->execute([':val' => $ratesJson]);
            echo json_encode(['success' => true]);
        }

        elseif ($action === 'addUser') {
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role) VALUES (:id, :name, :email, :password, :role)");
            $stmt->execute([
                ':id' => $input['id'],
                ':name' => $input['name'],
                ':email' => $input['email'],
                ':password' => $input['password'],
                ':role' => $input['role']
            ]);
            echo json_encode(['success' => true]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// ---------------------------------------------------------
// DELETE REQUESTS
// ---------------------------------------------------------
if ($method === 'DELETE') {
    try {
        if ($action === 'deleteTransaction') {
            $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);
            echo json_encode(['success' => true]);
        }
        
        elseif ($action === 'deleteUser') {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);
            echo json_encode(['success' => true]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>