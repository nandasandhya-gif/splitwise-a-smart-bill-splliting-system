// Expense handling functionality
document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseFormContainer = document.querySelector('.expense-form-container');

    // Form submission handler
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    // Navbar Add Expense button handler
    if (addExpenseBtn && expenseFormContainer) {
        addExpenseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Toggle visibility of expense form
            expenseFormContainer.classList.toggle('active');
            
            // Scroll to the form
            expenseFormContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
});

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    // Get form elements
    const amountInput = document.getElementById('expenseAmount');
    const descriptionInput = document.getElementById('expenseDescription');
    const paymentModeInput = document.getElementById('paymentMode');
    const expenseFormContainer = document.querySelector('.expense-form-container');
    
    // Validate inputs
    if (!validateExpenseInputs(amountInput, descriptionInput, paymentModeInput)) {
        return;
    }
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const paymentMode = paymentModeInput.value;
    
    // Get existing expenses from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Create new expense object
    const newExpense = {
        id: Date.now(),
        amount: amount,
        description: description,
        paymentMode: paymentMode,
        date: new Date().toISOString(),
        payer: 'You', // Default payer
        participants: ['You'] // Default participants
    };
    
    // Add new expense to array
    expenses.push(newExpense);
    
    // Save back to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Sync with Settle Up page
    syncExpensesWithSettleUp(newExpense);
    
    // Reset form
    expenseForm.reset();
    
    // Hide expense form
    if (expenseFormContainer) {
        expenseFormContainer.classList.remove('active');
    }
    
    // Refresh the display
    if (typeof loadActivityData === 'function') {
        loadActivityData();
    }
    
    // Show success message
    showSuccessMessage('Expense added successfully!');
}

function validateExpenseInputs(amountInput, descriptionInput, paymentModeInput) {
    let isValid = true;
    
    // Amount validation
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showErrorMessage(amountInput, 'Please enter a valid amount');
        isValid = false;
    } else {
        clearErrorMessage(amountInput);
    }
    
    // Description validation
    const description = descriptionInput.value.trim();
    if (description.length === 0) {
        showErrorMessage(descriptionInput, 'Description cannot be empty');
        isValid = false;
    } else {
        clearErrorMessage(descriptionInput);
    }
    
    // Payment mode validation
    if (!paymentModeInput.value) {
        showErrorMessage(paymentModeInput, 'Please select a payment mode');
        isValid = false;
    } else {
        clearErrorMessage(paymentModeInput);
    }
    
    return isValid;
}

function showErrorMessage(inputElement, message) {
    // Remove any existing error
    clearErrorMessage(inputElement);
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Insert error message after the input
    inputElement.classList.add('input-error');
    inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
}

function clearErrorMessage(inputElement) {
    inputElement.classList.remove('input-error');
    
    // Remove any existing error message
    const existingError = inputElement.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    
    // Append to form or a designated message area
    const form = document.getElementById('expenseForm');
    form.appendChild(successMessage);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

function syncExpensesWithSettleUp(newExpense) {
    // Get existing settle up transactions
    const settleUpTransactions = JSON.parse(localStorage.getItem('settleUpTransactions')) || [];
    
    // Determine transaction type based on context
    // Assume positive amount means you're owed, negative means you owe
    const transactionType = newExpense.amount > 0 ? 'you-are-owed' : 'you-owe';
    
    // Create a settle up transaction from the expense
    const settleUpTransaction = {
        id: newExpense.id,
        amount: Math.abs(newExpense.amount), // Always store absolute amount
        description: newExpense.description,
        paymentMode: newExpense.paymentMode,
        date: newExpense.date,
        payer: newExpense.payer,
        participants: newExpense.participants,
        status: 'pending', // Default status
        type: transactionType
    };
    
    console.log('Creating Settle Up Transaction:', settleUpTransaction);
    
    // Add to settle up transactions
    settleUpTransactions.push(settleUpTransaction);
    
    // Save to localStorage
    localStorage.setItem('settleUpTransactions', JSON.stringify(settleUpTransactions));
    
    // Update balances
    updateBalances(settleUpTransactions);
    
    // Trigger page reload if on settle page
    if (window.location.pathname.includes('settle.html')) {
        location.reload();
    }
}

function updateBalances(transactions) {
    // Calculate total owed and total you're owed
    const balances = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'you-owe') {
            acc.totalOwed += transaction.amount;
        } else if (transaction.type === 'you-are-owed') {
            acc.totalOwe += transaction.amount;
        }
        return acc;
    }, { totalOwed: 0, totalOwe: 0 });
    
    // Store balances in localStorage
    localStorage.setItem('balances', JSON.stringify(balances));
}
