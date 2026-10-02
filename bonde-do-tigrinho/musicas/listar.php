<?php
// Responsabilidade: dizer ao jogo quais arquivos .tigrinho existem nesta pasta.
// Roda no servidor (HostGator). O navegador não consegue "olhar" uma pasta sozinho; o PHP consegue.
// Devolve só os NOMES, em JSON:  ["grupo1-heroes-tonight.tigrinho", ...]

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$arquivos = glob(__DIR__ . '/*.tigrinho');
if ($arquivos === false) {
    $arquivos = [];
}

$nomes = array_map('basename', $arquivos);
sort($nomes, SORT_NATURAL | SORT_FLAG_CASE);

echo json_encode(array_values($nomes), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
