window.onload = function() {

    var btn = document.getElementById('submitBtn');
    var form = document.getElementById('feedbackForm');

    if (btn && form) {
        btn.onclick = function(event) {
            if (event) event.preventDefault(); 
            alert('✨ 🚀 謝謝您的反饋 💖 🎉');
            form.reset();
        };
    }

 
    var gameWidget = document.createElement('div');
    gameWidget.id = 'game-widget';
    gameWidget.innerHTML = `
        <button id="game-toggle-btn">🎮 漲價屋摸魚專區</button>
        <div id="game-container">
            <div class="game-header">
                <span class="game-title">⚡ 3C 零件接接樂 v1.0</span>
                <button id="game-close-btn" class="game-close-btn">✖</button>
            </div>
            <canvas id="gameCanvas" width="280" height="300"></canvas>
            <div id="game-score">分數: 0 | 生命: 3</div>
            <div class="game-controls">
                <button id="game-start-btn" class="game-btn">開始遊戲</button>
            </div>
        </div>
    `;
    document.body.appendChild(gameWidget);

 
    var toggleBtn = document.getElementById('game-toggle-btn');
    var gameContainer = document.getElementById('game-container');
    var closeBtn = document.getElementById('game-close-btn');
    var startBtn = document.getElementById('game-start-btn');
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var scoreDisplay = document.getElementById('game-score');

    
    var gameInterval;
    var isPlaying = false;
    var score = 0;
    var lives = 3;
    
    var basket = {
        x: 115,
        y: 270,
        width: 50,
        height: 15,
        speed: 15
    };

    // 掉落物池
    var items = [];
    var itemTypes = [
        { icon: '💾', score: 10, color: '#38bdf8', type: 'good' },  // SSD
        { icon: '🧠', score: 20, color: '#22c55e', type: 'good' }, 
        { icon: '📼', score: 30, color: '#f59e0b', type: 'good' },  
        { icon: '🌊', score: -15, color: '#ef4444', type: 'bad' },  
        { icon: '💥', score: -20, color: '#ec4899', type: 'bad' }   
    ];

    // 切換顯示/隱藏遊戲視窗
    toggleBtn.onclick = function() {
        gameContainer.style.display = 'block';
        toggleBtn.style.display = 'none';
        initGameRender();
    };

    closeBtn.onclick = function() {
        gameContainer.style.display = 'none';
        toggleBtn.style.display = 'block';
        stopGame();
    };

    // 滑鼠在 Canvas 上移動時控制購物車
    canvas.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        var mouseX = e.clientX - rect.left - root.scrollLeft;
        
        // 限制購物車不超出邊界
        basket.x = mouseX - basket.width / 2;
        if (basket.x < 0) basket.x = 0;
        if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
    };

    startBtn.onclick = function() {
        if (!isPlaying) {
            startGame();
        }
    };

    function initGameRender() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('用滑鼠左右移動購物車', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('點擊下方按鈕開始接零件！', canvas.width / 2, canvas.height / 2 + 10);
        drawBasket();
    }

    function startGame() {
        isPlaying = true;
        score = 0;
        lives = 3;
        items = [];
        startBtn.innerText = '重來一次';
        startBtn.style.backgroundColor = '#64748b';
        updateScoreboard();

        // 核心遊戲迴圈 (每秒約 60 幀)
        gameInterval = setInterval(updateGame, 1000 / 60);
    }

    function stopGame() {
        isPlaying = false;
        clearInterval(gameInterval);
        startBtn.innerText = '開始遊戲';
        startBtn.style.backgroundColor = '#22c55e';
    }

    function updateScoreboard() {
        scoreDisplay.innerHTML = `分數: <span style="color:#f59e0b">${score}</span> | 生命: <span style="color:#ef4444">${'❤️'.repeat(lives) || '💀'}</span>`;
    }

    // 隨機產生掉落物
    function spawnItem() {
        if (Math.random() < 0.03) { // 3% 機率每幀生成
            var type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            items.push({
                x: Math.random() * (canvas.width - 20) + 10,
                y: 0,
                speed: Math.random() * 2 + 2,
                icon: type.icon,
                score: type.score,
                color: type.color,
                type: type.type
            });
        }
    }

    function drawBasket() {
        // 畫出原價屋風格黃色綠色相間的購物車
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText('🛒 漲價屋', basket.x + basket.width/2, basket.y + 11);
    }

    // 遊戲數據更新與渲染主體
    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. 產生與繪製掉落物
        spawnItem();
        drawBasket();

        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            item.y += item.speed;

            // 繪製零件 Emoji
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.icon, item.x, item.y);

            // 2. 碰撞偵測 (是否被購物車接住)
            if (item.y >= basket.y && item.y <= basket.y + basket.height) {
                if (item.x >= basket.x && item.x <= basket.x + basket.width) {
                    score += item.score;
                    if (score < 0) score = 0; // 分數不為負
                    
                    // 如果接到壞東西且是特殊懲罰，扣生命
                    if (item.type === 'bad') {
                        lives--;
                    }
                    
                    updateScoreboard();
                    items.splice(i, 1);
                    continue;
                }
            }

            // 3. 掉落到底部邊界
            if (item.y > canvas.height) {
                // 好零件沒接到，扣生命
                if (item.type === 'good') {
                    lives--;
                    updateScoreboard();
                }
                items.splice(i, 1);
            }
        }

        // 4. 檢查遊戲結束
        if (lives <= 0) {
            stopGame();
            ctx.fillStyle = '#ef4444';
            ctx.font = '20px Courier New';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier New';
            ctx.fillText(`最終組裝得分: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
        }
    }
};