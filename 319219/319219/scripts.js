window.onload = function() {
    var btn = document.getElementById('submitBtn');
    var form = document.getElementById('feedbackForm');

    if (btn) {
        btn.onclick = function() {
            alert('✨ 🚀 謝謝您的反饋 💖 🎉');
            form.reset();
        };
    }
};