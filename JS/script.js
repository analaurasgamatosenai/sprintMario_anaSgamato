document.addEventListener('DOMContentLoaded', () => {

    const chicken = document.querySelector('.chicken');
    const coin = document.querySelector('.coin');
    const fox = document.querySelector('.fox');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');


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
    let baseFoxDuration = 1.6;
    let speedLevel = 0;
    let currentPlayer = '';
    let score = 0;
    let moedas = 0;
    let bonusMoedas = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;
    let personagemAtual = 'chicken';

    const characterCards = document.querySelectorAll('.character-card');

    characterCards.forEach((card) => {
        card.addEventListener('click', () => {
            characterCards.forEach((item) => {
                item.classList.remove('active');
            });

            card.classList.add('active');
            personagemAtual = card.dataset.character;

            console.log('Personagem selecionado:', personagemAtual);
        });
    });



    const savedName = localStorage.getItem('chicken_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    function startGame() {
        clearInterval(gameLoop);
        clearInterval(scoreLoop);


        resetElements();

        isPlaying = true;
        score = 0;
        moedas = 0;
        bonusMoedas = 0;

        scoreDisplay.textContent = 0;

        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';


        baseFoxDuration = 1.6;
        speedLevel = 0;
        fox.style.animationDuration = `${baseFoxDuration}s`;
        fox.style.animationPlayState = 'running';
        chicken.style.animationPlayState = 'running';


        gameBoard.classList.add('running');


        gameLoop = setInterval(() => {
            checkCollision();
            checkCoinCollision();
        }, 10);

        scoreLoop = setInterval(() => {
            if (!isPlaying) return;

            score += 1;
            scoreDisplay.textContent = score + bonusMoedas;

            const novoNivel = Math.floor(score / 30);

            if (novoNivel > speedLevel) {
                speedLevel = novoNivel;

                const velocidade = Math.min(
                    1 + speedLevel * 0.2,
                    3
                );

                const animacaoFantasma = fox.getAnimations().find(
                    animacao => animacao.animationName === 'fox-animation'
                );

                if (animacaoFantasma) {
                    animacaoFantasma.playbackRate = velocidade;
                }
            }
        }, 100);
    }




    function resetElements() {
        // Reinicia a raposa
        fox.style.animationPlayState = 'running';
        fox.style.animation = 'none';
        fox.style.left = '';
        fox.style.right = '-100px';

        // Reinicia a galinha
        if (personagemAtual === 'pintinho') {
            chicken.src = 'imagens/pintinho.gif';
        } else {
            chicken.src = 'imagens/chicken-walking.gif';
        }
        chicken.classList.toggle('is-pintinho', personagemAtual === 'pintinho');
        chicken.classList.remove('dead');

        chicken.style.animationPlayState = 'running';
        chicken.style.animation = 'none';
        chicken.style.bottom = '0px';
        chicken.style.width = '';
        chicken.style.marginLeft = '';
        chicken.style.display = '';
        chicken.classList.remove('jump');

        // Reinicia a moeda
        coin.dataset.collected = 'false';
        coin.style.display = '';
        coin.style.right = '-50px';
        coin.style.animation = 'none';

        if (jumpTip) {
            jumpTip.style.opacity = '1';
        }

        // Permite que as animações sejam iniciadas novamente
        void fox.offsetWidth;
        void chicken.offsetWidth;
        void coin.offsetWidth;

        fox.style.animation = '';
        chicken.style.animation = '';
        coin.style.animation = '';
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
        const foxRect = fox.getBoundingClientRect();

        // Diminui a área de colisão dos dois personagens
        const margemHorizontal = 20;
        const margemVertical = 20;

        const colidiu =
            chickenRect.right - margemHorizontal > foxRect.left + margemHorizontal &&
            chickenRect.left + margemHorizontal < foxRect.right - margemHorizontal &&
            chickenRect.bottom - margemVertical > foxRect.top + margemVertical &&
            chickenRect.top + margemVertical < foxRect.bottom - margemVertical;

        if (colidiu) {
            triggerGameOver();
        }
    }


    function checkCoinCollision() {
        if (!isPlaying || !coin || coin.dataset.collected === 'true') {
            return;
        }

        const chickenRect = chicken.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();

        const colidiu =
            chickenRect.right > coinRect.left &&
            chickenRect.left < coinRect.right &&
            chickenRect.bottom > coinRect.top &&
            chickenRect.top < coinRect.bottom;

        if (colidiu) {
            moedas++;
            score += 5;
            scoreDisplay.textContent = score + bonusMoedas;

            coin.dataset.collected = 'true';
            coin.style.animation = 'none';
            coin.style.display = 'none';

            setTimeout(() => {
                coin.dataset.collected = 'false';

                // Reinicia a moeda do lado direito da tela
                coin.style.display = '';
                coin.style.right = '-50px';
                coin.style.animation = 'none';

                // Faz a animação começar novamente
                void coin.offsetWidth;
                coin.style.animation = '';
            }, 1000);

            const bonus = document.createElement('span');
            bonus.textContent = '+5';
            bonus.className = 'coin-bonus';

            const boardRect = gameBoard.getBoundingClientRect();
            bonus.style.left = `${coinRect.left - boardRect.left}px`;
            bonus.style.top = `${coinRect.top - boardRect.top}px`;

            gameBoard.appendChild(bonus);

            setTimeout(() => bonus.remove(), 800);
        }
    }



    function triggerGameOver() {
        if (!isPlaying) return;

        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        gameBoard.classList.remove('running');

        // Congela a raposa na posição atual
        fox.style.animationPlayState = 'paused';

        // Congela a galinha
        chicken.style.animationPlayState = 'paused';
        if (personagemAtual === 'pintinho') {
            chicken.src = 'imagens/pintinho-morto.png';
        } else {
            chicken.src = 'imagens/galinha_morta.png';
        }

        chicken.style.width = '90px';
        chicken.style.marginLeft = 'auto';

        // Atualiza a tela de Game Over
        const pontuacaoTotal = score + bonusMoedas;
        finalScoreValue.textContent = pontuacaoTotal;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('active');

        saveScore(currentPlayer, pontuacaoTotal);
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
        e.preventDefault();

        const nameValue = playerInput.value.trim();

        if (!nameValue) {
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('chicken_jump_player', currentPlayer);

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

        startModal.classList.add('active');

        document.getElementById('character-selection').style.display = 'block';

        playerInput.value = currentPlayer;
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