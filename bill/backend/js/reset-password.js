// File: js/reset-password.js

document.getElementById("resetPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const email = document.getElementById("resetEmail").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    // Simulating user DB with localStorage (in real case, use backend DB)
    let users = JSON.parse(localStorage.getItem("users")) || [];
  
    const userIndex = users.findIndex(user => user.email === email);
  
    if (userIndex === -1) {
      alert("Email not found!");
      return;
    }
  
    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Password updated successfully!");
    window.location.href = "login.html";
  });
  