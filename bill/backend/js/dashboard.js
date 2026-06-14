document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const modal = document.getElementById('addExpenseModal');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const addExpenseBtn2 = document.getElementById('addExpenseBtn2');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const prevStepBtn = document.getElementById('prevStep');
    const nextStepBtn = document.getElementById('nextStep');
    const submitExpenseBtn = document.getElementById('submitExpense');
    const expensesList = document.querySelector('.expenses-list');
    
    // Store expenses in localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Load and display existing expenses
    function loadExpenses() {
        // Update overview cards
        updateOverviewCards();
        
        // Clear existing expenses
        expensesList.innerHTML = '';
        
        // Sort expenses by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Display each expense
        expenses.forEach(expense => {
            addExpenseToList(expense);
        });
        
        // Update balances
        updateBalancesDisplay();
    }
    
    // Update overview cards
    function updateOverviewCards() {
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
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

        // Update the overview cards
        document.querySelector('.total-expenses .amount').textContent = 
            `₹${totalExpenses.toFixed(2)}`;
        document.querySelector('.you-owe .amount').textContent = 
            `₹${youOwe.toFixed(2)}`;
        document.querySelector('.you-are-owed .amount').textContent = 
            `₹${youAreOwed.toFixed(2)}`;
    }
    
    // Add expense to the list
    function addExpenseToList(expense) {
        const categoryIcons = {
            food: 'utensils',
            travel: 'plane',
            utilities: 'bolt',
            entertainment: 'film',
            shopping: 'shopping-bag',
            other: 'receipt'
        };

        const icon = categoryIcons[expense.category] || 'receipt';
        const participantsCount = expense.participants.length;
        const displayedParticipants = expense.participants.slice(0, 3);
        const remainingParticipants = participantsCount - displayedParticipants.length;
        
        const expenseHtml = `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="expense-details">
                    <h3>${expense.name}</h3>
                    <p>Paid by ${expense.payer}</p>
                    <div class="participants">
                        ${displayedParticipants.map(participant => `
                            <img src="https://via.placeholder.com/24" alt="${participant}">
                        `).join('')}
                        ${remainingParticipants > 0 ? 
                            `<span class="more">+${remainingParticipants}</span>` : ''}
                    </div>
                </div>
                <div class="expense-amount">
                    <p class="amount">₹${parseFloat(expense.amount).toFixed(2)}</p>
                    <p class="your-share ${expense.payer === 'you' ? 'positive' : 'negative'}">
                        ${expense.payer === 'you' ? 
                            `You lent ₹${((expense.amount * (expense.participants.length - 1)) / 
                                expense.participants.length).toFixed(2)}` : 
                            `You owe ₹${(expense.amount / expense.participants.length).toFixed(2)}`}
                    </p>
                </div>
                <div class="expense-actions">
                    <button class="btn-icon" title="Edit" onclick="editExpense('${expense.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Delete" onclick="deleteExpense('${expense.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        expensesList.insertAdjacentHTML('afterbegin', expenseHtml);
    }
    
    // Delete expense
    window.deleteExpense = function(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(exp => exp.id !== expenseId);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            loadExpenses();
        }
    };
    
    // Edit expense
    window.editExpense = function(expenseId) {
        const expense = expenses.find(exp => exp.id === expenseId);
        if (expense) {
            // Populate form with expense data
            document.getElementById('expenseName').value = expense.name;
            document.getElementById('amount').value = expense.amount;
            document.getElementById('payer').value = expense.payer;
            
            // Set category
            document.getElementById(`cat-${expense.category}`).checked = true;
            
            // Set participants
            document.querySelectorAll('input[name="participants[]"]').forEach(checkbox => {
                checkbox.checked = expense.participants.includes(checkbox.nextElementSibling.textContent);
            });
            
            // Set split type
            document.getElementById(`split-${expense.splitType}`).checked = true;
            
            // Open modal
            openModal();
            
            // Store expense ID for updating
            addExpenseForm.dataset.editingExpenseId = expenseId;
        }
    };

    // Form submission
    // Find this section in dashboard.js where form submission happens
    // Get the form element
const addExpenseForm = document.getElementById('addExpenseForm');

// Add event listener only if form exists
// Find this form submission code and replace it
if (addExpenseForm) {
    addExpenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateStep(currentStep)) {
            const formData = new FormData(addExpenseForm);
            const editingExpenseId = addExpenseForm.dataset.editingExpenseId;
            
            const expenseData = {
                id: editingExpenseId || Date.now().toString(),
                name: formData.get('expenseName'),
                amount: formData.get('amount'),
                payer: formData.get('payer'),
                category: formData.get('category'),
                splitType: formData.get('splitType'),
                participants: formData.getAll('participants[]').map(p => p === 'on' ? 'You' : p),
                date: new Date().toISOString()
            };

            if (editingExpenseId) {
                expenses = expenses.map(exp => 
                    exp.id === editingExpenseId ? expenseData : exp
                );
            } else {
                expenses.push(expenseData);
            }

            // Update localStorage
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Dispatch custom event for same-window updates
            window.dispatchEvent(new CustomEvent('expensesUpdated'));
            
            // Dispatch storage event for cross-window updates
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'expenses',
                newValue: JSON.stringify(expenses)
            }));

            // Close modal and reset form
            closeModalHandler();
            addExpenseForm.dataset.editingExpenseId = '';
            
            // Reload expenses list
            loadExpenses();

            // Log for debugging
            console.log('Expense added/updated:', expenseData);
            console.log('All expenses:', expenses);
        }
    });
}

            

    // Form elements
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    let currentStep = 1;

    // Modal functionality
    function openModal() {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        currentStep = 1;
        updateFormSteps();
    }

    function closeModalHandler(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (addExpenseForm) {
            addExpenseForm.reset();
            currentStep = 1;
            updateFormSteps();
        }
    }

    // Character count for expense name
    const expenseName = document.getElementById('expenseName');
    const charCount = document.querySelector('.char-count');
    
    expenseName.addEventListener('input', function() {
        const remaining = this.maxLength - this.value.length;
        charCount.textContent = `${this.value.length}/${this.maxLength}`;
    });

    // Custom category input
    const categoryOther = document.getElementById('cat-other');
    const customCategoryInput = document.getElementById('customCategoryInput');
    
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', function() {
            customCategoryInput.style.display = this.id === 'cat-other' ? 'block' : 'none';
        });
    });

    // Split type handling
    const splitTypeRadios = document.querySelectorAll('input[name="splitType"]');
    const splitDetails = document.getElementById('splitDetails');
    
    function updateSplitDetails() {
        const selectedType = document.querySelector('input[name="splitType"]:checked').value;
        const participants = Array.from(document.querySelectorAll('input[name="participants[]"]:checked'))
            .map(checkbox => checkbox.nextElementSibling.textContent);
        const totalAmount = parseFloat(document.getElementById('amount').value) || 0;
        
        let html = '';
        
        switch(selectedType) {
            case 'equal':
                const equalShare = totalAmount / participants.length;
                participants.forEach(participant => {
                    html += `
                        <div class="participant-share">
                            <span>${participant}</span>
                            <span class="share-amount">$${equalShare.toFixed(2)}</span>
                        </div>
                    `;
                });
                break;
                
            case 'percentage':
                const defaultPercentage = (100 / participants.length).toFixed(1);
                html += `
                    <div class="percentage-shares">
                        <div class="percentage-header">
                            <span>Participant</span>
                            <span>Percentage</span>
                            <span>Amount</span>
                        </div>
                        ${participants.map(participant => `
                            <div class="participant-share" data-participant="${participant}">
                                <span class="participant-name">${participant}</span>
                                <div class="percentage-input">
                                    <input type="number" 
                                        class="percentage-value" 
                                        min="0" 
                                        max="100" 
                                        step="0.1" 
                                        value="${defaultPercentage}"
                                        oninput="updatePercentageAmounts(this)">
                                    <span>%</span>
                                </div>
                                <span class="share-amount">$${((defaultPercentage * totalAmount) / 100).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div class="percentage-total">
                            <span>Total:</span>
                            <span class="total-percentage">100%</span>
                            <span class="total-amount">$${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                `;
                break;
                
            case 'custom':
                participants.forEach(participant => {
                    const defaultShare = (totalAmount / participants.length).toFixed(2);
                    html += `
                        <div class="participant-share">
                            <span>${participant}</span>
                            <input type="number" 
                                class="custom-amount" 
                                min="0" 
                                step="0.01" 
                                value="${defaultShare}"
                                oninput="updateCustomTotal(this)">
                        </div>
                    `;
                });
                html += `
                    <div class="custom-total">
                        <span>Total: </span>
                        <span class="total-amount">₹${totalAmount.toFixed(2)}</span>
                        <span class="remaining-amount">Remaining: $0.00</span>
                    </div>
                `;
                break;
        }
        
        splitDetails.innerHTML = html;
    }

    splitTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateSplitDetails);
    });

    // Update amounts when percentages change
    window.updatePercentageAmounts = function(input) {
        const totalAmount = parseFloat(document.getElementById('amount').value) || 0;
        const percentageShares = document.querySelector('.percentage-shares');
        const allInputs = percentageShares.querySelectorAll('.percentage-value');
        const totalPercentageEl = percentageShares.querySelector('.total-percentage');
        const totalAmountEl = percentageShares.querySelector('.total-amount');
        
        // Calculate total percentage
        let totalPercentage = 0;
        allInputs.forEach(inp => {
            totalPercentage += parseFloat(inp.value) || 0;
        });
        
        // Update total percentage display
        totalPercentageEl.textContent = `${totalPercentage.toFixed(1)}%`;
        totalPercentageEl.style.color = totalPercentage === 100 ? 'var(--success-color)' : 'var(--danger-color)';
        
        // Update individual amounts
        allInputs.forEach(inp => {
            const percentage = parseFloat(inp.value) || 0;
            const amount = (percentage * totalAmount) / 100;
            const shareAmount = inp.closest('.participant-share').querySelector('.share-amount');
            shareAmount.textContent = `$${amount.toFixed(2)}`;
        });
    }

    // Update total for custom amounts
    window.updateCustomTotal = function(input) {
        const totalAmount = parseFloat(document.getElementById('amount').value) || 0;
        const customShares = document.querySelectorAll('.custom-amount');
        const remainingAmount = document.querySelector('.remaining-amount');
        
        let currentTotal = 0;
        customShares.forEach(share => {
            currentTotal += parseFloat(share.value) || 0;
        });
        
        const remaining = totalAmount - currentTotal;
        remainingAmount.textContent = `Remaining: ₹${remaining.toFixed(2)}`;
        remainingAmount.style.color = remaining === 0 ? 'var(--success-color)' : 'var(--danger-color)';
    }

    // Add new participant
    const addParticipantBtn = document.getElementById('addParticipantBtn');
    const participantsSelect = document.querySelector('.participants-select');
    
    addParticipantBtn.addEventListener('click', function() {
        const participantName = prompt('Enter participant name:');
        if (participantName) {
            const participantId = 'participant' + (participantsSelect.children.length + 1);
            const participantHtml = `
                <div class="participant-checkbox">
                    <input type="checkbox" id="${participantId}" name="participants[]">
                    <label for="${participantId}">${participantName}</label>
                </div>
            `;
            participantsSelect.insertAdjacentHTML('beforeend', participantHtml);
        }
    });

    // Form navigation
    function updateFormSteps() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });
        
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= currentStep);
        });
        
        prevStepBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextStepBtn.style.display = currentStep === steps.length ? 'none' : 'block';
        submitExpenseBtn.style.display = currentStep === steps.length ? 'block' : 'none';
    }

    prevStepBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateFormSteps();
        }
    });

    nextStepBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length) {
                currentStep++;
                updateFormSteps();
            }
        }
    });

    function validateStep(step) {
        switch(step) {
            case 1:
                // Validate bill details
                const name = expenseName.value;
                const amount = document.getElementById('amount').value;
                const payer = document.getElementById('payer').value;
                const participants = document.querySelectorAll('input[name="participants[]"]:checked');
                
                if (!name || !amount || !payer || participants.length === 0) {
                    alert('Please fill in all required fields');
                    return false;
                }
                return true;
                
            case 2:
                // Validate category
                const category = document.querySelector('input[name="category"]:checked');
                if (!category) {
                    alert('Please select a category');
                    return false;
                }
                if (category.id === 'cat-other' && !customCategoryInput.querySelector('input').value) {
                    alert('Please enter a custom category name');
                    return false;
                }
                return true;
                
            case 3:
                return true; // Split type is pre-selected
        }
        return true;
    }

    // Event listeners
    if (addExpenseBtn) addExpenseBtn.addEventListener('click', openModal);
    if (addExpenseBtn2) addExpenseBtn2.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalHandler);

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalHandler();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalHandler();
        }
    });

    // Delete expense handler
    document.querySelectorAll('.expense-actions .btn-icon[title="Delete"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseItem = this.closest('.expense-item');
            if (confirm('Are you sure you want to delete this expense?')) {
                expenseItem.remove();
            }
        });
    });

    // Edit expense handler
    document.querySelectorAll('.expense-actions .btn-icon[title="Edit"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseItem = this.closest('.expense-item');
            // Here you would typically populate the modal with expense data
            openModal();
        });
    });

    // Calculate balances for each user
    function calculateBalances() {
        const balances = {};
        
        expenses.forEach(expense => {
            const amount = parseFloat(expense.amount);
            const participantsCount = expense.participants.length;
            const sharePerPerson = amount / participantsCount;
            
            // If you paid
            if (expense.payer === 'you') {
                expense.participants.forEach(participant => {
                    if (participant !== 'You') {
                        balances[participant] = (balances[participant] || 0) + sharePerPerson;
                    }
                });
            }
            // If someone else paid
            else {
                if (expense.participants.includes('You')) {
                    balances[expense.payer] = (balances[expense.payer] || 0) - sharePerPerson;
                }
            }
        });
        
        return balances;
    }

    // Update balances display
    function updateBalancesDisplay() {
        const balances = calculateBalances();
        const youOweList = document.getElementById('youOweList');
        const youAreOwedList = document.getElementById('youAreOwedList');
        
        youOweList.innerHTML = '';
        youAreOwedList.innerHTML = '';
        
        Object.entries(balances).forEach(([person, amount]) => {
            const balanceHtml = `
                <div class="balance-item">
                    <div class="balance-user">
                        <img src="https://via.placeholder.com/32" alt="${person}">
                        <div class="balance-user-info">
                            <span class="name">${person}</span>
                            <span class="last-expense">Last expense: ${getLastExpenseWith(person)}</span>
                        </div>
                    </div>
                    <span class="balance-amount ${amount < 0 ? 'negative' : 'positive'}">
                        ${amount < 0 ? '-' : ''}₹${Math.abs(amount).toFixed(2)}
                    </span>
                </div>
            `;
            
            if (amount < 0) {
                youOweList.insertAdjacentHTML('beforeend', balanceHtml);
            } else {
                youAreOwedList.insertAdjacentHTML('beforeend', balanceHtml);
            }
        });
        
        // Update empty states
        if (youOweList.children.length === 0) {
            youOweList.innerHTML = '<div class="empty-state">You don\'t owe anyone</div>';
        }
        if (youAreOwedList.children.length === 0) {
            youAreOwedList.innerHTML = '<div class="empty-state">No one owes you</div>';
        }
    }

    // Get the last expense with a specific person
    function getLastExpenseWith(person) {
        const relevantExpenses = expenses.filter(exp => 
            (exp.payer === person && exp.participants.includes('You')) ||
            (exp.payer === 'you' && exp.participants.includes(person))
        );
        
        if (relevantExpenses.length === 0) return 'No recent expenses';
        
        const lastExpense = relevantExpenses.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        )[0];
        
        return lastExpense.name;
    }

    // Load existing expenses when page loads
    loadExpenses();
});
