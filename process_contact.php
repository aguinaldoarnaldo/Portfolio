<?php
// ==================== CONFIGURAÇÕES ====================
header('Content-Type: application/json');

// Configurar seu email aqui
$to = "aguinaldoarnaldo5@gmail.com"; // <<<< ALTERE AQUI PARA SEU EMAIL

// Configurações de segurança
$allowed_origins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://seudominio.com' // Adicione seu domínio de produção
];

// ==================== CORS ====================
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// ==================== VERIFICAR MÉTODO ====================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido'
    ]);
    exit;
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function limparInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// ==================== COLETAR E VALIDAR DADOS ====================
$erros = [];

// Nome
$nome = isset($_POST['nome']) ? limparInput($_POST['nome']) : '';
if (empty($nome)) {
    $erros[] = 'O nome é obrigatório';
} elseif (strlen($nome) < 3) {
    $erros[] = 'O nome deve ter pelo menos 3 caracteres';
}

// Email
$email = isset($_POST['email']) ? limparInput($_POST['email']) : '';
if (empty($email)) {
    $erros[] = 'O email é obrigatório';
} elseif (!validarEmail($email)) {
    $erros[] = 'Email inválido';
}

// Assunto
$assunto = isset($_POST['assunto']) ? limparInput($_POST['assunto']) : '';
if (empty($assunto)) {
    $erros[] = 'O assunto é obrigatório';
} elseif (strlen($assunto) < 5) {
    $erros[] = 'O assunto deve ter pelo menos 5 caracteres';
}

// Mensagem
$mensagem = isset($_POST['mensagem']) ? limparInput($_POST['mensagem']) : '';
if (empty($mensagem)) {
    $erros[] = 'A mensagem é obrigatória';
} elseif (strlen($mensagem) < 10) {
    $erros[] = 'A mensagem deve ter pelo menos 10 caracteres';
}

// ==================== VERIFICAR ERROS ====================
if (!empty($erros)) {
    echo json_encode([
        'success' => false,
        'message' => implode(', ', $erros)
    ]);
    exit;
}

// ==================== PROTEÇÃO ANTI-SPAM ====================
// Verificar se há muitas requisições do mesmo IP
session_start();
$current_time = time();
$spam_limit = 3; // Número máximo de envios
$spam_timeout = 3600; // 1 hora em segundos

if (!isset($_SESSION['contact_attempts'])) {
    $_SESSION['contact_attempts'] = [];
}

// Limpar tentativas antigas
$_SESSION['contact_attempts'] = array_filter(
    $_SESSION['contact_attempts'],
    function($timestamp) use ($current_time, $spam_timeout) {
        return ($current_time - $timestamp) < $spam_timeout;
    }
);

// Verificar limite
if (count($_SESSION['contact_attempts']) >= $spam_limit) {
    echo json_encode([
        'success' => false,
        'message' => 'Muitas tentativas. Aguarde 1 hora e tente novamente.'
    ]);
    exit;
}

// ==================== PREPARAR EMAIL ====================
$assunto_email = "Contato do Portfólio: " . $assunto;

$corpo_email = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f4f4f4;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-row {
            margin-bottom: 15px;
            padding: 10px;
            background: #f9f9f9;
            border-left: 4px solid #667eea;
        }
        .label {
            font-weight: bold;
            color: #667eea;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>📧 Nova Mensagem do Portfólio</h2>
        </div>
        <div class='content'>
            <div class='info-row'>
                <span class='label'>Nome:</span><br>
                $nome
            </div>
            <div class='info-row'>
                <span class='label'>Email:</span><br>
                $email
            </div>
            <div class='info-row'>
                <span class='label'>Assunto:</span><br>
                $assunto
            </div>
            <div class='info-row'>
                <span class='label'>Mensagem:</span><br>
                " . nl2br($mensagem) . "
            </div>
            <div class='info-row'>
                <span class='label'>Data/Hora:</span><br>
                " . date('d/m/Y H:i:s') . "
            </div>
            <div class='info-row'>
                <span class='label'>IP:</span><br>
                " . $_SERVER['REMOTE_ADDR'] . "
            </div>
        </div>
        <div class='footer'>
            Este email foi enviado através do formulário de contato do seu portfólio.
        </div>
    </div>
</body>
</html>
";

// Headers do email
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . $nome . ' <' . $email . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

// ==================== ENVIAR EMAIL ====================
try {
    $enviado = mail($to, $assunto_email, $corpo_email, implode("\r\n", $headers));
    
    if ($enviado) {
        // Registrar tentativa bem-sucedida
        $_SESSION['contact_attempts'][] = $current_time;
        
        // Salvar no arquivo de log (opcional)
        $log_entry = date('Y-m-d H:i:s') . " - Nome: $nome, Email: $email, Assunto: $assunto\n";
        file_put_contents('contact_log.txt', $log_entry, FILE_APPEND);
        
        echo json_encode([
            'success' => true,
            'message' => 'Mensagem enviada com sucesso! Retornarei em breve.'
        ]);
    } else {
        throw new Exception('Falha ao enviar email');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao enviar mensagem. Tente novamente mais tarde.'
    ]);
    
    // Log de erro (opcional)
    error_log("Erro no formulário de contato: " . $e->getMessage());
}

// ==================== OPÇÃO: SALVAR NO BANCO DE DADOS ====================
/*
// Descomente e configure para salvar as mensagens em banco de dados

$servername = "localhost";
$username = "seu_usuario";
$password = "sua_senha";
$dbname = "seu_banco";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = "INSERT INTO contatos (nome, email, assunto, mensagem, data_envio, ip) 
            VALUES (:nome, :email, :assunto, :mensagem, NOW(), :ip)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':nome' => $nome,
        ':email' => $email,
        ':assunto' => $assunto,
        ':mensagem' => $mensagem,
        ':ip' => $_SERVER['REMOTE_ADDR']
    ]);
    
} catch(PDOException $e) {
    error_log("Erro ao salvar no banco: " . $e->getMessage());
}
*/
?>