document.addEventListener('DOMContentLoaded', function() {
    // Initial load
    updateActivityPage();

    // Listen for expense updates
    window.addEventListener('expensesUpdated', updateActivityPage);
    window.addEventListener('storage', updateActivityPage);
});

function updateActivityPage() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Calculate totals
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

    // Store activity data in localStorage
    const activityData = {
        youOwe: totalOwed,
        youreOwed: totalOwing
    };
    localStorage.setItem('activityData', JSON.stringify(activityData));

    // Update UI elements
    const elements = {
        totalBalance: document.querySelector('.total-balance .amount'),
        youOwe: document.querySelector('.you-owe .amount'),
        youAreOwed: document.querySelector('.you-are-owed .amount')
    };

    if (elements.totalBalance) {
        elements.totalBalance.textContent = `₹${(totalOwing - totalOwed).toFixed(2)}`;
    }
    if (elements.youOwe) {
        elements.youOwe.textContent = `₹${totalOwed.toFixed(2)}`;
    }
    if (elements.youAreOwed) {
        elements.youAreOwed.textContent = `₹${totalOwing.toFixed(2)}`;
    }

    // Dispatch an event to notify other components
    window.dispatchEvent(new CustomEvent('activityDataUpdated', { 
        detail: activityData 
    }));
}