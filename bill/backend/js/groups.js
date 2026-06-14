document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const createGroupBtn = document.getElementById('createGroupBtn');
    const createGroupModal = document.getElementById('createGroupModal');
    const closeModalBtn = document.getElementById('closeGroupModalBtn');
    const createGroupForm = document.getElementById('createGroupForm');
    const membersInput = document.getElementById('memberInput');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const addedMembersContainer = document.querySelector('.added-members');

    window.addEventListener('activityDataUpdated', updateGroupCards);
    window.addEventListener('storage', function(e) {
        if (e.key === 'activityData') {
            updateGroupCards();
        }
    });

    // Add this new function
    function updateGroupCards() {
        const activityData = JSON.parse(localStorage.getItem('activityData')) || {
            youOwe: 0,
            youreOwed: 0
        };

        // Update all group cards
        document.querySelectorAll('.group-card').forEach(card => {
            const youreOwedElement = card.querySelector('.stat .value.positive');
            const youOweElement = card.querySelector('.stat .value.negative');
            
            if (youreOwedElement) {
                youreOwedElement.textContent = `₹${activityData.youreOwed.toFixed(2)}`;
            }
            if (youOweElement) {
                youOweElement.textContent = `₹${activityData.youOwe.toFixed(2)}`;
            }
        });
    }
    
    // Logging function
    function logGroupCreation(action, details) {
        const log = {
            timestamp: new Date().toISOString(),
            action: action,
            details: details
        };
        
        const logs = JSON.parse(localStorage.getItem('groupCreationLogs') || '[]');
        logs.push(log);
        
        // Keep only last 50 logs
        if (logs.length > 50) {
            logs.shift();
        }
        
        localStorage.setItem('groupCreationLogs', JSON.stringify(logs));
    }
    
    // Get groups from localStorage or use default empty array
    let groups = JSON.parse(localStorage.getItem('groups')) || [];
    
    // Open create group modal
    function openModal() {
        try {
            // Ensure modal exists
            if (!createGroupModal) {
                console.error('Create group modal not found');
                return;
            }

            // Force display styles
            createGroupModal.style.display = 'flex';
            createGroupModal.style.opacity = '1';
            createGroupModal.style.visibility = 'visible';
            
            // Add active class for CSS transitions
            createGroupModal.classList.add('active');
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
            
            // Log modal opening
            logGroupCreation('modal_opened', {});
            
            // Optional: Focus first input
            const firstInput = createGroupModal.querySelector('input');
            if (firstInput) firstInput.focus();
        } catch (error) {
            console.error('Error opening group modal:', error);
            alert('Failed to open group creation modal');
        }
    }
    
    // Close create group modal
    function closeModalHandler(e) {
        try {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            createGroupModal.classList.remove('active');
            createGroupModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (createGroupForm) {
                createGroupForm.reset();
                addedMembersContainer.innerHTML = '';
            }
            logGroupCreation('modal_closed', {});
        } catch (error) {
            console.error('Error closing group modal:', error);
            alert('Failed to close group creation modal');
        }
    }
    
    // Add member to the group
    function addMember(e) {
        try {
            if (e) e.preventDefault();
            const memberName = membersInput.value.trim();
            
            // Validate member name
            if (!memberName) {
                alert('Member name cannot be empty');
                return;
            }
            
            if (!/^[a-zA-Z\s]{2,30}$/.test(memberName)) {
                alert('Member name must be 2-30 characters and contain only letters');
                return;
            }
            
            // Check for duplicate members
            const existingMembers = Array.from(addedMembersContainer.children)
                .map(member => member.querySelector('span').textContent.trim());
            
            if (existingMembers.includes(memberName)) {
                alert('This member has already been added');
                return;
            }
            
            const memberElement = document.createElement('div');
            memberElement.className = 'added-member';
            memberElement.innerHTML = `
                <span>${memberName}</span>
                <button type="button" class="remove-member" title="Remove member">&times;</button>
            `;
            addedMembersContainer.appendChild(memberElement);
            membersInput.value = '';
            membersInput.focus();
            
            // Add remove functionality
            memberElement.querySelector('.remove-member').addEventListener('click', function() {
                memberElement.remove();
            });
            
            logGroupCreation('member_added', { memberName });
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member');
        }
    }
    
    // Create new group
    function createGroup(e) {
        try {
            e.preventDefault();
            
            const formData = new FormData(createGroupForm);
            const groupName = formData.get('groupName').trim();
            const groupType = formData.get('groupType');
            
            // Input validation
            if (!groupName || !groupType) {
                alert('Please fill in all required fields');
                return;
            }

            // Validate group name
            if (!/^[a-zA-Z0-9\s-_]{3,50}$/.test(groupName)) {
                alert('Group name must be 3-50 characters and contain only letters, numbers, spaces, hyphens, and underscores');
                return;
            }
            
            const members = Array.from(addedMembersContainer.children).map(
                member => member.querySelector('span').textContent
            );
            
            // Validate member count
            if (members.length === 0) {
                alert('Please add at least one member to the group');
                return;
            }

            if (members.length > 20) {
                alert('Maximum group size is 20 members');
                return;
            }

            // Check for duplicate members
            const uniqueMembers = new Set(members);
            if (uniqueMembers.size !== members.length) {
                alert('Duplicate member names are not allowed');
                return;
            }
            
            const groupData = {
                id: Date.now().toString(),
                name: groupName,
                type: groupType,
                members: ['You', ...members],
                totalExpenses: 0,
                balance: 0,
                expenses: [],
                createdAt: new Date().toISOString(),
                isArchived: false
            };
            
            // Add group to array and save to localStorage
            groups.push(groupData);
            localStorage.setItem('groups', JSON.stringify(groups));
            
            // Add group card to UI
            addGroupCard(groupData);
            
            // Close modal and update counts
            closeModalHandler();
            updateGroupCounts();
            alert('Group created successfully!');
            
            // Log group creation
            logGroupCreation('group_created', { 
                groupName: groupData.name, 
                groupType: groupData.type, 
                memberCount: groupData.members.length 
            });
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group. Please try again.');
            logGroupCreation('group_creation_failed', { error: error.message });
        }
    }

    function addGroupCard(group) {
        const groupsList = document.querySelector(
            group.isArchived ? '.archived .groups-list' : '.groups-section:not(.archived) .groups-list'
        );
        
        // Get activity data from localStorage
        const activityData = JSON.parse(localStorage.getItem('activityData')) || {
            youOwe: 0,
            youreOwed: 0
        };
        
        const groupIcons = {
            home: 'home',
            trip: 'plane',
            couple: 'heart',
            other: 'users'
        };
        
        const groupIconColors = {
            home: 'orange',
            trip: 'blue',
            couple: 'green',
            other: 'purple'
        };
        
        const groupCard = document.createElement('div');
        groupCard.className = `group-card${group.isArchived ? ' archived' : ''}`;
        groupCard.dataset.groupId = group.id;
        groupCard.innerHTML = `
            <div class="group-header">
                <div class="group-icon ${groupIconColors[group.type]}">
                    <i class="fas fa-${groupIcons[group.type]}"></i>
                </div>
                <div class="group-info">
                    <h3>${group.name}</h3>
                    <p>${group.members.length} members</p>
                </div>
                <button class="btn-icon group-menu" title="More options">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div class="group-stats">
                <div class="stat">
                    <span class="label">You're Owed</span>
                    <span class="value positive">₹${activityData.youreOwed.toFixed(2)}</span>
                </div>
                <div class="stat">
                    <span class="label">You Owe</span>
                    <span class="value negative">₹${activityData.youOwe.toFixed(2)}</span>
                </div>
            </div>
            <div class="group-members">
                ${group.members.slice(0, 4).map((member, index) => `
                    <div class="member-avatar" title="${member}" style="background-color: ${getAvatarColor(index)}">
                        ${member.charAt(0).toUpperCase()}
                    </div>
                `).join('')}
                ${group.members.length > 4 ? `
                    <div class="more-members" title="${group.members.slice(4).join(', ')}">+${group.members.length - 4}</div>
                ` : ''}
            </div>
            <div class="group-actions">
                <button class="btn btn-outline btn-sm view-details">View Details</button>
                ${!group.isArchived ? `
                    <button class="btn btn-primary btn-sm add-expense">Add Expense</button>
                ` : `
                    <button class="btn btn-outline btn-sm unarchive-group">Unarchive</button>
                `}
            </div>
        `;
    
        // Add event handlers
        groupCard.querySelector('.view-details').addEventListener('click', () => viewGroupDetails(group));
        if (!group.isArchived) {
            groupCard.querySelector('.add-expense').addEventListener('click', () => addExpense(group));
        } else {
            groupCard.querySelector('.unarchive-group').addEventListener('click', () => unarchiveGroup(group));
        }
        
        groupCard.querySelector('.group-menu').addEventListener('click', (e) => {
            e.stopPropagation();
            showGroupMenu(group, e.currentTarget);
        });
        
        groupsList.insertBefore(groupCard, groupsList.firstChild);
    }
    
    // Add group card to UI
    function updateActivityPage() {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        
        // Calculate totals
        let totalOwed = 0;
        let totalOwing = 0;
    
        expenses.forEach(expense => {
            const amount = parseFloat(expense.amount);
            if (expense.payer === 'you') {
                const othersShare = amount * ((expense.participants.length - 1) / expense.participants.length);
                totalOwing += othersShare;
            } else if (expense.participants.includes('You')) {
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
    
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('activityDataUpdated', { 
            detail: activityData 
        }));
    }

    // Helper function to generate consistent avatar colors
    function getAvatarColor(index) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
        ];
        return colors[index % colors.length];
    }

    // View group details
    function viewGroupDetails(group) {
        window.location.href = `group-details.html?id=${group.id}`;
    }

    // Add expense to group
    function addExpense(group) {
        const expenseModal = document.getElementById('expenseModal');
        if (expenseModal) {
            expenseModal.dataset.groupId = group.id;
            expenseModal.classList.add('active');
            expenseModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Unarchive group
    function unarchiveGroup(group) {
        const groupIndex = groups.findIndex(g => g.id === group.id);
        if (groupIndex !== -1) {
            groups[groupIndex].isArchived = false;
            localStorage.setItem('groups', JSON.stringify(groups));
            loadGroups();
        }
    }

    // Show group menu
    function showGroupMenu(group, buttonElement) {
        const menu = document.createElement('div');
        menu.className = 'group-menu-dropdown';
        menu.innerHTML = `
            <ul>
                <li><button class="menu-item" data-action="edit"><i class="fas fa-edit"></i> Edit Group</button></li>
                <li><button class="menu-item" data-action="archive"><i class="fas fa-archive"></i> Archive Group</button></li>
                <li><button class="menu-item delete" data-action="delete"><i class="fas fa-trash"></i> Delete Group</button></li>
            </ul>
        `;

        // Position menu
        const rect = buttonElement.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;

        // Add click handlers
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.menu-item')?.dataset.action;
            if (action) {
                handleGroupAction(action, group);
                menu.remove();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== buttonElement) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });

        document.body.appendChild(menu);
    }

    // Handle group menu actions
    function handleGroupAction(action, group) {
        switch (action) {
            case 'edit':
                // TODO: Implement edit functionality
                break;
            case 'archive':
                if (confirm('Are you sure you want to archive this group?')) {
                    archiveGroup(group);
                }
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                    deleteGroup(group);
                }
                break;
        }
    }

    // Helper functions for notifications
    function showError(message) {
        // You can replace this with a better notification system
        alert(message);
    }

    function showSuccess(message) {
        // You can replace this with a better notification system
        alert(message);
    }

    // Update group counts
    function updateGroupCounts() {
        const activeGroups = groups.filter(group => !group.isArchived);
        const archivedGroups = groups.filter(group => group.isArchived);
        
        document.querySelector('.card:first-child .amount').textContent = groups.length;
        document.querySelector('.groups-section:not(.archived) .group-count')
            .textContent = `${activeGroups.length} active groups`;
        document.querySelector('.archived .group-count')
            .textContent = `${archivedGroups.length} archived groups`;
    }
    
    // Load existing groups
    function loadGroups() {
        const activeGroups = groups.filter(group => !group.isArchived);
        const archivedGroups = groups.filter(group => group.isArchived);
        
        // Clear existing groups
        document.querySelectorAll('.groups-list').forEach(list => list.innerHTML = '');
        
        // Add groups to UI
        activeGroups.forEach(group => addGroupCard(group));
        archivedGroups.forEach(group => addGroupCard(group));
        
        // Update counts
        updateGroupCounts();
    }
    
    // Event Listeners
    if (createGroupBtn) createGroupBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalHandler);
    if (createGroupForm) createGroupForm.addEventListener('submit', createGroup);
    if (addMemberBtn) addMemberBtn.addEventListener('click', addMember);
    if (membersInput) {
        membersInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addMember(e);
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === createGroupModal) {
            closeModalHandler();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && createGroupModal.classList.contains('active')) {
            closeModalHandler();
        }
    });

    // Load existing groups
    loadGroups();
    updateGroupCounts();
});
