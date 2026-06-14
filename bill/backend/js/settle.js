// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const settleModal = document.getElementById('settleModal');
const markPaidModal = document.getElementById('markPaidModal');
const closeButtons = document.querySelectorAll('.close-modal');
const settleButtons = document.querySelectorAll('.settle-btn');
const markPaidButtons = document.querySelectorAll('.mark-paid-btn');
const filterSelect = document.querySelector('.filter-select');
const searchInput = document.querySelector('.search-bar input');

function syncBalanceValues() {
    // Get values from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Calculate totals using same logic as activity page
    let totalOwed = 0;
    let totalOwing = 0;

    expenses.forEach(expense => {
        const amount = parseFloat(expense.amount);
        if (expense.payer === 'you') {
            // You paid, others owe you
            const othersShare = amount * ((expense.participants.length - 1) / expense.participants.length);
            totalOwing += othersShare;
        } else if (expense.participants.includes('You')) {
            // Someone else paid, you owe them
            const yourShare = amount / expense.participants.length;
            totalOwed += yourShare;
        }
    });

    // Update the overview cards
    const youOweElement = document.querySelector('.card:nth-child(1) .amount');
    const youAreOwedElement = document.querySelector('.card:nth-child(2) .amount');
    const totalBalanceElement = document.querySelector('.card:nth-child(3) .amount');

    if (youOweElement) youOweElement.textContent = `₹${totalOwed.toFixed(2)}`;
    if (youAreOwedElement) youAreOwedElement.textContent = `₹${totalOwing.toFixed(2)}`;
    if (totalBalanceElement) {
        const netBalance = totalOwing - totalOwed;
        totalBalanceElement.textContent = `${netBalance >= 0 ? '' : '-'}₹${Math.abs(netBalance).toFixed(2)}`;
    }
}

// Add event listeners for updates
document.addEventListener('DOMContentLoaded', syncBalanceValues);
window.addEventListener('storage', syncBalanceValues);
window.addEventListener('expensesUpdated', syncBalanceValues);

// New updateOverviewCards function
function updateOverviewCards(totalOwed, totalOwe) {
    syncBalanceValues(); // This will ensure values stay in sync
}

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners for Modals
settleButtons.forEach(button => {
    button.addEventListener('click', () => openModal(settleModal));
});

markPaidButtons.forEach(button => {
    button.addEventListener('click', () => openModal(markPaidModal));
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Filter Functionality
filterSelect.addEventListener('change', (e) => {
    const filter = e.target.value;
    const balanceCards = document.querySelectorAll('.balance-card');
    
    balanceCards.forEach(card => {
        switch(filter) {
            case 'owed-by-me':
                card.style.display = card.classList.contains('you-owe') ? 'block' : 'none';
                break;
            case 'owed-to-me':
                card.style.display = card.classList.contains('you-are-owed') ? 'block' : 'none';
                break;
            default:
                card.style.display = 'block';
        }
    });
});

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const balanceCards = document.querySelectorAll('.balance-card');
    
    balanceCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
});

// Payment Method Selection
const paymentMethods = document.querySelectorAll('.payment-method input');
paymentMethods.forEach(method => {
    method.addEventListener('change', () => {
        paymentMethods.forEach(m => {
            const content = m.nextElementSibling;
            if (m.checked) {
                content.style.borderColor = 'var(--primary)';
                content.style.background = 'rgba(var(--primary-rgb), 0.08)';
            } else {
                content.style.borderColor = 'var(--border-color)';
                content.style.background = 'var(--white)';
            }
        });
    });
});

// Initialize Progress Bars
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar .progress');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Function to load and display transactions
function loadTransactions() {
    console.log('Loading transactions from localStorage');
    
    // Update the key to match the one used in the dashboard
    const transactions = JSON.parse(localStorage.getItem('expenses')) || [];
    console.log('Transactions found:', transactions);
    
    const balancesList = document.querySelector('.balances-list');
    
    // Clear existing transactions
    balancesList.innerHTML = '';
    
    // Check if transactions exist
    if (transactions.length === 0) {
        console.warn('No transactions found in localStorage');
        balancesList.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet. Add an expense to get started!</p>
            </div>
        `;
        return;
    }
    
    // Calculate total balances
    let totalOwed = 0;
    let totalOwe = 0;
    
    // Sort transactions by date (most recent first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create transaction cards
    transactions.forEach(transaction => {
        const balanceCard = document.createElement('div');
        balanceCard.classList.add('balance-card');
        balanceCard.classList.add(transaction.type);
        
        // Update balance totals
        if (transaction.type === 'you-owe') {
            totalOwed += transaction.amount;
        } else {
            totalOwe += transaction.amount;
        }
        
        // Log the current totals for debugging
        console.log('Current Total Owed:', totalOwed);
        console.log('Current Total Owe:', totalOwe);
        
        balanceCard.innerHTML = `
            <div class="balance-header">
                <div class="user-info">
                    <img src="https://via.placeholder.com/40" alt="Participant">
                    <div class="text">
                        <h3>${transaction.type === 'you-owe' ? 'You owe' : 'Owed to you'}</h3>
                        <p>${transaction.description}</p>
                    </div>
                </div>
                <div class="amount ${transaction.type}">
                    <span>₹${Math.abs(transaction.amount).toFixed(2)}</span>
                </div>
            </div>
            <div class="balance-details">
                <div class="expense-info">
                    <p><i class="fas fa-receipt"></i> ${transaction.description}</p>
                    <p><i class="fas fa-calendar"></i> ${new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div class="balance-actions">
                    <button class="btn btn-primary settle-btn">
                        <i class="fas fa-money-bill-wave"></i>
                        ${transaction.type === 'you-owe' ? 'Pay Now' : 'Collect'}
                    </button>
                    <button class="btn btn-outline mark-paid-btn">
                        <i class="fas fa-check"></i>
                        Mark as ${transaction.type === 'you-owe' ? 'Paid' : 'Received'}
                    </button>
                </div>
            </div>
        `;
        balancesList.appendChild(balanceCard);
    });
    
    // Update overview cards
    syncBalanceValues();

    console.log(`Total Owed: ₹${totalOwed.toFixed(2)}, Total You're Owed: ₹${totalOwe.toFixed(2)}`);
}



// Function to calculate You Owe and You Are Owed
function calculateOwedValues() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const youOwe = expenses.reduce((sum, exp) => {
        if (exp.payer !== 'you') {
            const yourShare = exp.participants.includes('You') ? 
                parseFloat(exp.amount) / exp.participants.length : 0;
            return sum + yourShare;
        }
        return sum;
    }, 0);

    const youAreOwed = expenses.reduce((sum, exp) => {
        if (exp.payer === 'you') {
            const othersShare = parseFloat(exp.amount) * 
                ((exp.participants.length - 1) / exp.participants.length);
            return sum + othersShare;
        }
        return sum;
    }, 0);

    // Log the calculated values for debugging
    console.log('You Owe:', youOwe);
    console.log('You Are Owed:', youAreOwed);

    return { youOwe, youAreOwed };
}

// Call this function to update the UI on the settle page


// Initialize Animations
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    initializeProgressBars();
});

// Remind Button Functionality
const remindButtons = document.querySelectorAll('.remind-btn');
remindButtons.forEach(button => {
    button.addEventListener('click', () => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Reminder Sent';
        button.disabled = true;
        button.style.background = 'var(--gray-light)';
        button.style.color = 'var(--text-secondary)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.background = '';
            button.style.color = '';
        }, 3000);
    });
});

// Settle All Button Functionality
const settleAllBtn = document.getElementById('settleAllBtn');
settleAllBtn.addEventListener('click', () => {
    // Get the current "You Owe" value
    const youOweElement = document.querySelector('.card:nth-child(1) .amount');
    const youOweAmount = youOweElement ? parseFloat(youOweElement.textContent.replace('₹', '')) : 0;
    
    // Update the amount in settle modal
    const settleAmountInput = settleModal.querySelector('#settleAmount');
    if (settleAmountInput) {
        settleAmountInput.value = youOweAmount.toFixed(2);
    }
    
    openModal(settleModal);
});

// Add this function to keep settle amount in sync
function updateSettleAmount() {
    const youOweElement = document.querySelector('.card:nth-child(1) .amount');
    const settleAmountInput = document.querySelector('#settleAmount');
    
    if (youOweElement && settleAmountInput) {
        const youOweAmount = parseFloat(youOweElement.textContent.replace('₹', ''));
        settleAmountInput.value = youOweAmount.toFixed(2);
    }
}

// Add event listeners to keep amount in sync
document.addEventListener('DOMContentLoaded', updateSettleAmount);
window.addEventListener('storage', updateSettleAmount);
window.addEventListener('expensesUpdated', updateSettleAmount);