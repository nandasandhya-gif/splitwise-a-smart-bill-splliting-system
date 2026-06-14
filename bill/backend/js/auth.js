document.addEventListener("DOMContentLoaded", () => {
    // Form elements
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const togglePasswordButtons = document.querySelectorAll(".toggle-password");
    const strengthBar = document.querySelector(".strength-bar");
    const strengthText = document.querySelector(".strength-text");

    // Password visibility toggle
    togglePasswordButtons.forEach(button => {
        button.addEventListener("click", () => {
            const input = button.previousElementSibling;
            const type = input.type === "password" ? "text" : "password";
            input.type = type;
            button.querySelector("i").className = `fas fa-${type === "password" ? "eye" : "eye-slash"}`;
        });
    });

    // Password strength checker
    if (passwordInput && strengthBar && strengthText) {
        const checkPasswordStrength = (password) => {
            let strength = 0;
            let feedback = "";

            if (password.length >= 8) strength += 25;
            if (/[A-Z]/.test(password)) strength += 25;
            if (/[a-z]/.test(password)) strength += 25;
            if (/[0-9!@#$%^&*]/.test(password)) strength += 25;

            strengthBar.style.width = `${strength}%`;

            if (strength <= 25) {
                strengthBar.style.background = "#FF6B6B";
                feedback = "Too weak";
            } else if (strength <= 50) {
                strengthBar.style.background = "#FFB86B";
                feedback = "Could be stronger";
            } else if (strength <= 75) {
                strengthBar.style.background = "#51CC70";
                feedback = "Strong";
            } else {
                strengthBar.style.background = "#00C853";
                feedback = "Very strong";
            }

            strengthText.textContent = `Password strength: ${feedback}`;
        };

        passwordInput.addEventListener("input", (e) => {
            checkPasswordStrength(e.target.value);
        });
    }

    // Signup form handling
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                showError(confirmPasswordInput, "Passwords do not match");
                return;
            }

            const formData = {
                fullName: document.getElementById("fullName").value,
                email: document.getElementById("email").value,
                password: password
            };

            try {
                const users = JSON.parse(localStorage.getItem("users") || "[]");

                if (users.some(user => user.email === formData.email)) {
                    showError(document.getElementById("email"), "Email already exists");
                    return;
                }

                users.push({
                    ...formData,
                    id: Date.now(),
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem("users", JSON.stringify(users));

                showSuccess("Signup successful! Redirecting to login...");
                setTimeout(() => window.location.href = "login.html", 2000);

            } catch (error) {
                console.error("Signup error:", error);
                showError(null, "An error occurred during signup. Please try again.");
            }
        });
    }

    // Login form handling
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const users = JSON.parse(localStorage.getItem("users") || "[]");
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    localStorage.setItem("currentUser", JSON.stringify({
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email
                    }));

                    showSuccess("Login successful! Redirecting to dashboard...");
                    setTimeout(() => window.location.href = "dashboard.html", 1500);
                } else {
                    showError(null, "Invalid email or password");
                }
            } catch (error) {
                console.error("Login error:", error);
                showError(null, "An error occurred during login. Please try again.");
            }
        });
    }

    // Forgot Password handling
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value;

            fetch("http://localhost:3000/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                alert("If this email is registered, a reset link has been sent.");
                window.location.href = "login.html";
            })
            .catch(error => console.error("Error:", error));
        });
    }

    // Social authentication buttons (placeholder)
    document.querySelectorAll(".social-button").forEach(button => {
        button.addEventListener("click", () => {
            const provider = button.classList.contains("google") ? "Google" : "Facebook";
            alert(`${provider} authentication would be implemented here.`);
        });
    });

    // Helper functions
    function showError(input, message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;

        if (input) {
            const formGroup = input.closest(".form-group");
            formGroup.classList.add("error");

            const existingError = formGroup.querySelector(".error-message");
            if (existingError) existingError.remove();

            formGroup.appendChild(errorDiv);
        } else {
            const form = document.querySelector(".auth-form");
            form.insertBefore(errorDiv, form.firstChild);
        }

        setTimeout(() => {
            errorDiv.remove();
            if (input) input.closest(".form-group").classList.remove("error");
        }, 5000);
    }

    function showSuccess(message = "Success!") {
        const successDiv = document.createElement("div");
        successDiv.className = "success-message";
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

        const form = document.querySelector(".auth-form");
        form.insertBefore(successDiv, form.firstChild);

        Array.from(form.children).forEach(child => {
            if (child !== successDiv) child.style.display = "none";
        });

        setTimeout(() => {
            successDiv.remove();
            Array.from(form.children).forEach(child => child.style.display = "block");
        }, 2000);
    }
    document.getElementById("signupForm").addEventListener("submit", function (e) {
        e.preventDefault();
      
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
      
        // Validate password match
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
      
        // Get users from localStorage
        let users = JSON.parse(localStorage.getItem("users")) || [];
      
        // Add new user
        users.push({ fullName, email, password });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Signup successful!");
      
        // Optionally redirect
        window.location.href = "login.html";
      });
      
});
