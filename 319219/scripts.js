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

    // ========================================================
    // 💥 新增項目：漲價屋線上估價單跨頁與儲存核心邏輯
    // ========================================================
    
    // 從快取讀取已選取的商品資料物件
    let cart = JSON.parse(localStorage.getItem('coolpc_cart')) || {};

    // --- 分流邏輯 A：如果身處商品目錄頁 ---
    const checkboxes = document.querySelectorAll('.prod-chk');
    if (checkboxes.length > 0) {
        // 同步初始化核取方塊勾選狀態
        checkboxes.forEach(chk => {
            const id = chk.getAttribute('data-id');
            if (cart[id]) {
                chk.checked = true;
            }
        });

        // 監聽勾選狀態變動
        checkboxes.forEach(chk => {
            chk.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                const price = parseInt(e.target.getAttribute('data-price'), 10);

                if (e.target.checked) {
                    cart[id] = { name, price };
                } else {
                    delete cart[id];
                }
                localStorage.setItem('coolpc_cart', JSON.stringify(cart));
            });
        });
    }

    // --- 分流邏輯 B：如果身處 cart.html 估價單明細頁 ---
    const cartTbody = document.getElementById('cart-items-tbody');
    if (cartTbody) {
        
        function renderCartPage() {
            cartTbody.innerHTML = '';
            let total = 0;
            const keys = Object.keys(cart);

            // 若購物車完全沒有勾選東西
            if (keys.length === 0) {
                cartTbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center; color:#64748b; padding: 40px; font-size:14px;">
                            🛒 您的預算估價單目前空空如也... 快去目錄勾選需要的零件吧！
                        </td>
                    </tr>`;
                return;
            }

            // 動態列出每項商品資料
            keys.forEach(id => {
                const item = cart[id];
                total += item.price;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <a href="#" class="delete-item-btn" data-id="${id}" style="color:#ef4444; text-decoration:none; font-weight:bold;">[刪除]</a>
                    </td>
                    <td style="text-align:left; padding-left:15px;">${item.name}</td>
                    <td>1</td>
                    <td class="coolpc-price">$${item.price.toLocaleString()}</td>
                `;
                cartTbody.appendChild(tr);
            });

            // 補上總計金額欄位列
            const totalTr = document.createElement('tr');
            totalTr.style.backgroundColor = '#1e3a8a';
            totalTr.innerHTML = `
                <td colspan="3" style="text-align:right; font-weight:bold; color:#fff; padding:10px;">總計金額：</td>
                <td class="coolpc-price" style="font-size:16px; color:#f59e0b; font-weight:bold;">$${total.toLocaleString()}</td>
            `;
            cartTbody.appendChild(totalTr);

            // 重新綁定每一列單項的刪除事件
            const deleteBtns = document.querySelectorAll('.delete-item-btn');
            deleteBtns.forEach(dBtn => {
                dBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const idToDelete = e.target.getAttribute('data-id');
                    delete cart[idToDelete];
                    localStorage.setItem('coolpc_cart', JSON.stringify(cart));
                    renderCartPage(); // 重新整理網頁元件
                });
            });
        }

        // 首次進網頁立即宣染
        renderCartPage();

        // 綁定「一鍵清空」按鈕邏輯
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.onclick = function() {
                if (confirm('確定要清空目前暫存的估價清單嗎？')) {
                    cart = {};
                    localStorage.removeItem('coolpc_cart');
                    renderCartPage();
                }
            };
        }

        // 其他附帶按鈕提示效果
        const printBtn = document.getElementById('print-cart-btn');
        if(printBtn) { printBtn.onclick = () => window.print(); }
        
        const checkoutBtn = document.getElementById('checkout-stub-btn');
        if(checkoutBtn) { checkoutBtn.onclick = () => alert('✔️ 模擬傳送成功！請至全台現場門市告知店員開啟單號進行排單組裝。'); }
    }

    // ========================================================
    // 下方完全保留原有的 🎮 摸魚小遊戲 Widget 邏輯 (無調整變動)
    // ========================================================
    var gameWidget = document.createElement('div');
    gameWidget.id = 'game-widget';
    gameWidget.innerHTML = `
        <button id="game-toggle-btn">🎮 漲價屋摸魚專區</button>
        <div id="game-container">
            <div class="game-header">
                <span class="game-title">⚡ 3C 零件接接樂 v1.0</span>
                <button id="game-close-btn" class="game-close-btn">✖</button>
            </div>
            <canvas id="gameCanvas" width="280" height="300\"></canvas>
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
    var scoreboard = document.getElementById('game-score');
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas ? canvas.getContext('2d') : null;

    if (!canvas || !ctx) return;

    toggleBtn.onclick = function() {
        if (gameContainer.style.display === 'block') {
            gameContainer.style.display = 'none';
        } else {
            gameContainer.style.display = 'block';
        }
    };

    closeBtn.onclick = function() {
        gameContainer.style.display = 'none';
    };

    var score = 0;
    var lives = 3;
    var gameInterval = null;
    var spawnInterval = null;
    var isPlaying = false;

    var basket = {
        x: 120,
        y: 270,
        width: 50,
        height: 15,
        speed: 15
    };

    var items = [];
    var goodPool = [
        { icon: '🧠', score: 20, name: 'CPU' },
        { icon: '📼', score: 15, name: 'GPU' },
        { icon: '🎛️', score: 10, name: 'RAM' },
        { icon: '💾', score: 10, name: 'SSD' }
    ];
    var badPool = [
        { icon: '💥', score: -30, name: '縮缸藍屏' },
        { icon: '🔥', score: -20, name: '超頻過熱' },
        { icon: '🧾', score: -10, name: '老闆漲價' }
    ];

    document.addEventListener('keydown', function(e) {
        if (!isPlaying) return;
        if (e.key === 'ArrowLeft' || e.key === 'Left') {
            basket.x -= basket.speed;
            if (basket.x < 0) basket.x = 0;
        } else if (e.key === 'ArrowRight' || e.key === 'Right') {
            basket.x += basket.speed;
            if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
        }
    });

    startBtn.onclick = function() {
        if (isPlaying) return;
        startGame();
    };

    function startGame() {
        isPlaying = true;
        score = 0;
        lives = 3;
        items = [];
        basket.x = 120;
        updateScoreboard();
        startBtn.style.display = 'none';

        gameInterval = setInterval(updateGame, 1000 / 30);
        spawnInterval = setInterval(spawnItem, 1000);
    }

    function stopGame() {
        isPlaying = false;
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        startBtn.style.display = 'inline-block';
        startBtn.textContent = '再玩一次';
    }

    function updateScoreboard() {
        scoreboard.textContent = '分數: ' + score + ' | 生命: ' + lives;
    }

    function spawnItem() {
        var isGood = Math.random() > 0.35; 
        var proto = isGood ? goodPool[Math.floor(Math.random() * goodPool.length)] : badPool[Math.floor(Math.random() * badPool.length)];
        
        items.push({
            x: Math.random() * (canvas.width - 20) + 10,
            y: 0,
            speed: Math.random() * 3 + 2,
            icon: proto.icon,
            score: proto.score,
            type: isGood ? 'good' : 'bad'
        });
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
        ctx.fillStyle = '#0f172a';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🛒購物車', basket.x + basket.width/2, basket.y + 11);

        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            item.y += item.speed;

            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.icon, item.x, item.y);

            if (item.y >= basket.y && item.y <= basket.y + basket.height) {
                if (item.x >= basket.x && item.x <= basket.x + basket.width) {
                    score += item.score;
                    if (score < 0) score = 0; 
                    
                    if (item.type === 'bad') {
                        lives--;
                    }
                    
                    updateScoreboard();
                    items.splice(i, 1);
                    continue;
                }
            }

            if (item.y > canvas.height) {
                if (item.type === 'good') {
                    lives--;
                    updateScoreboard();
                }
                items.splice(i, 1);
            }
        }

        if (lives <= 0) {
            stopGame();
            ctx.fillStyle = '#ef4444';
            ctx.font = '20px Courier New';
            ctx.fillText('GAME OVER...', canvas.width / 2, canvas.height / 2);
        }
    }
};