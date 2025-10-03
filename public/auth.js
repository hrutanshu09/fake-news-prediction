document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authMessage = document.getElementById('auth-message');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                authMessage.textContent = 'Passwords do not match.';
                authMessage.className = 'auth-message error';
                return;
            }

            const res = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, confirmPassword })
            });

            const data = await res.json();
            authMessage.textContent = data.message;
            if (data.success) {
                authMessage.className = 'auth-message success';
                setTimeout(() => window.location.href = '/login.html', 1500);
            } else {
                authMessage.className = 'auth-message error';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (res.ok) {
                window.location.href = '/';
            } else {
                const data = await res.json();
                authMessage.textContent = data.message;
                authMessage.className = 'auth-message error';
            }
        });
    }
});