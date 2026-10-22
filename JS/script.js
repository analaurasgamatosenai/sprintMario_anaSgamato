document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Jogo
    const chicken = document.querySelector('.chicken');
    const ghost = document.querySelector('.ghost');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');

    // Modais e Telas
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('save-status-msg');
    const rankingBody = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');

    // Variáveis de Estado
    let baseGhostDuration = 1.6;
    let speedLevel = 0;
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;


    const savedName = localStorage.getItem('chicken_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }


    function startGame() {

        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        gameLoop = setInterval(checkCollision, 10);
        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';


        baseGhostDuration = 1.6;
        speedLevel = 0;
        ghost.style.animationDuration = `${baseGhostDuration}s`;


        gameBoard.classList.add('running');


        scoreLoop = setInterval(() => {
            if (!isPlaying) return;

            score += 1;
            scoreDisplay.textContent = score;



            const novoNivel = Math.floor(score / 30);

            if (novoNivel > speedLevel) {
                speedLevel = novoNivel;

                const novaDuracao = Math.max(
                    0.5,
                    baseGhostDuration - speedLevel * 0.2
                );

                // Aumenta a velocidade sem reiniciar a animação
                const animacaoFantasma = ghost.getAnimations().find(
                    animacao => animacao.animationName === 'pipe-animation'
                );

                if (animacaoFantasma) {
                    animacaoFantasma.playbackRate = baseGhostDuration / novaDuracao;
                }
            }

        }, 100);
    }


    function resetElements() {
        // Reseta cano
        ghost.style.animation = '';
        ghost.style.left = '';

        // Reseta chicken
        chicken.src = 'imagens/chicken-walking.gif';
        chicken.style.animation = '';
        chicken.style.bottom = '0px';
        chicken.style.width = '';
        chicken.style.marginLeft = '';
        chicken.classList.remove('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '1';
        }
    }

    function jump() {
        if (!isPlaying) return;
        if (chicken.classList.contains('jump')) return;

        chicken.classList.add('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            chicken.classList.remove('jump');
        }, 600);
    }

    function checkCollision() {
        if (!isPlaying) return;

        const chickenRect = chicken.getBoundingClientRect();
        const ghostRect = ghost.getBoundingClientRect();

        const margem = 0;

        const colidiu =
            chickenRect.right - margem > ghostRect.left + margem &&
            chickenRect.left + margem < ghostRect.right - margem &&
            chickenRect.bottom - margem > ghostRect.top + margem &&
            chickenRect.top + margem < ghostRect.bottom - margem;

        if (colidiu) {
            triggerGameOver();
        }
    }


    function triggerGameOver() {
        if (!isPlaying) return;

        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        gameBoard.classList.remove('running');

        // Congela o fantasma na posição atual
        ghost.style.animationPlayState = 'paused';

        // Congela a galinha
        chicken.style.animationPlayState = 'paused';
        chicken.src = 'imagens/galinha_morta.png';
        chicken.style.width = '75px';
        chicken.style.marginLeft = '50px';

        // Atualiza a tela de Game Over
        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('active');

        saveScore(currentPlayer, score);
    }


    function saveScore(playerName, finalScore) {
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    saveStatusMsg.textContent = 'Pontuação registrada no banco!';
                    saveStatusMsg.style.color = '#10b981';
                    if (data.ranking) {
                        renderRanking(data.ranking, playerName, finalScore);
                    }
                } else {
                    saveStatusMsg.textContent = '⚠️ ' + (data.message || 'Erro ao registrar.');
                    saveStatusMsg.style.color = '#ef4444';
                }
            })
            .catch(err => {
                console.error('Erro na requisição:', err);
                saveStatusMsg.textContent = '⚠️ Erro ao conectar ao servidor Laragon.';
                saveStatusMsg.style.color = '#ef4444';
            });
    }

    /**
     * Busca o ranking atualizado no banco
     */
    function fetchRanking() {
        fetch('ranking.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.ranking) {
                    renderRanking(data.ranking);
                }
            })
            .catch(err => console.error('Erro ao buscar ranking:', err));
    }

    /**
     * Atualiza a tabela HTML do ranking
     */
    function renderRanking(list, highlightName = null, highlightScore = null) {
        if (!rankingBody) return;
        rankingBody.innerHTML = '';

        if (!list || list.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda. Jogue para ser o 1º!</td></tr>';
            return;
        }

        let highlighted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            // Destaca a pontuação atual recém-salva se coincidir
            if (!highlighted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore) {
                tr.classList.add('highlight-current');
                highlighted = true;
            }

            let medal = `${index + 1}º`;
            if (index === 0) medal = '🥇 1º';
            else if (index === 1) medal = '🥈 2º';
            else if (index === 2) medal = '🥉 3º';

            tr.innerHTML = `
                <td class="ranking-pos">${medal}</td>
                <td><strong>${escapeHtml(item.nome)}</strong></td>
                <td>${parseInt(item.pontos, 10)} pts</td>
            `;

            rankingBody.appendChild(tr);
        });
    }

    /**
     * Função auxiliar para sanitizar strings no HTML
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Submit do Formulário de Início (INICIAR JOGO)
    startForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const nameValue = playerInput.value.trim();
        if (!nameValue) {
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('chicken_jump_player', currentPlayer);

        // Fecha tela de início e começa o jogo
        startModal.classList.remove('active');
        startGame();
    });

    // Botão "VER RANKING" na tela inicial
    btnViewRanking.addEventListener('click', () => {
        fetchRanking();
        finalScoreValue.textContent = '---';
        saveStatusMsg.textContent = '';
        startModal.classList.remove('active');
        gameoverModal.classList.add('active');
    });

    // Botão "JOGAR NOVAMENTE" no Game Over
    btnRestart.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        if (!currentPlayer) {
            startModal.classList.add('active');
            playerInput.focus();
        } else {
            startGame();
        }
    });

    // 4. Botão "TROCAR JOGADOR" no Game Over
    btnChangePlayer.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        resetElements();
        startModal.classList.add('active');
        playerInput.value = '';
        playerInput.focus();
    });

    // 5. Controle do Pulo por Teclado (Espaço ou Seta para Cima)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
            if (isPlaying) {
                e.preventDefault();
                jump();
            }
        }
    });
});