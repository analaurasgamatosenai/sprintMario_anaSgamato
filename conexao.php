<?php
    $host = 'localhost';
    $port = '3306';
    $user = 'root';
    $pass = 'mysql';
    $dbname = 'mario';
    
    try{
        $pdo =  new PDO(
            "mysql:host=$host; port=$port; charset=utf8mb4",
            $user,
            $pass,
            [
                PDO:: ATTR_ERRMODE => PDO:: ERRMODE_EXCEPTION,
                PDO:: ATTR_DEFAULT_FETCH_MODE => PDO:: FETCH_ASSOC
            ]
        );

        $pdo->exec (
            "CREATE DATABASE IF NOT EXISTS `$dbname`"
        );

        $pdo->exec("USE `$dbname`");

        $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `ranking`(
        `id` int  primary key auto_increment,
        `nome` varchar(50) not null,
        `pontos` int not null,
        `data_registro` timestamp default current_timestamp not null)"
        );       
    } catch(PDOException $e){
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'status' => 'error',
            'message' => 'Não foi possível conectar ao banco de Dados.'
                .$e->getMessage()
        ]);
        exit;
    }
?> 