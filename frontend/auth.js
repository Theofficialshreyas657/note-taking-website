// Auth functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.auth-tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Toggle active class on buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Toggle active class on forms
            authForms.forEach(form => {
                if (form.id === `${tabName}-form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
            
            // Clear error messages
            document.getElementById('login-error').textContent = '';
            document.getElementById('signup-error').textContent = '';
        });
    });
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
        
        try {
            const response = await fetch(`http://localhost:3000/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })

            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Store token in localStorage
            localStorage.setItem('notesAppToken', data.token);
            localStorage.setItem('notesAppUser', JSON.stringify(data.user));
            
            // Redirect to main app
            window.location.href = 'index.html';
        } catch (error) {
            errorElement.textContent = error.message;
        }
    });
    
    // Sign up form submission
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorElement = document.getElementById('signup-error');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })

            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            // Store token in localStorage
            localStorage.setItem('notesAppToken', data.token);
            localStorage.setItem('notesAppUser', JSON.stringify(data.user));
            
            // Redirect to main app
            window.location.href = 'index.html';
        } catch (error) {
            errorElement.textContent = error.message;
        }
    });
    
    // Check if user is already logged in
    async function checkAuthStatus() {
        const token = localStorage.getItem('notesAppToken');
        if (!token) return;
    
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            const data = await response.json();
            if (response.ok && data.valid) {
                window.location.href = 'index.html';
            } else {
                localStorage.removeItem('notesAppToken');
                localStorage.removeItem('notesAppUser');
            }
        } catch (err) {
            console.error('Token validation failed:', err);
            localStorage.removeItem('notesAppToken');
            localStorage.removeItem('notesAppUser');
        }
    }
    
    
    // Run auth check on page load
    checkAuthStatus();
});
