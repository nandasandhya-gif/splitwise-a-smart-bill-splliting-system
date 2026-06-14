// Create a test user
const testUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Test+User',
    phone: '+1234567890',
    currency: 'USD'
};

// Save to localStorage
localStorage.setItem('currentUser', JSON.stringify(testUser));
