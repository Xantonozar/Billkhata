import axios from 'axios';

const testSignup = async () => {
    const email = `test${Date.now()}@example.com`;
    console.log(`Attempting signup with new email: ${email}`);

    try {
        const response = await axios.post('http://localhost:5000/api/auth/signup', {
            name: 'Test User',
            email: email,
            password: 'password123',
            role: 'Member'
        });
        console.log('Signup successful:', response.data);
    } catch (error) {
        console.error('Signup failed:', error.response?.data || error.message);
    }
};

testSignup();
