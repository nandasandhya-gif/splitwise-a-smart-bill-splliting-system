document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseModal = document.getElementById('expenseModal');
    const expenseForm = document.getElementById('expenseForm');
    const closeBtn = document.getElementById('closeExpenseModal');

    // Show modal when Add Expense button is clicked
    addExpenseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        expenseModal.style.display = 'block';
    });

    // Close modal when close button is clicked
    closeBtn.addEventListener('click', function() {
        expenseModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === expenseModal) {
            expenseModal.style.display = 'none';
        }
    });

    // Handle form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const amount = document.getElementById('expenseAmount').value;
        const description = document.getElementById('expenseDescription').value;
        const paymentMode = document.getElementById('paymentMode').value;
        
        // Create expense object
        const expense = {
            amount: parseFloat(amount),
            description: description,
            paymentMode: paymentMode,
            date: new Date().toISOString(),
            id: Date.now()
        };

        // Get existing expenses from localStorage
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        
        // Add new expense
        expenses.push(expense);
        
        // Save back to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Reset form and close modal
        expenseForm.reset();
        expenseModal.style.display = 'none';
        
        // Refresh the page to show new expense
        location.reload();
    });
});
