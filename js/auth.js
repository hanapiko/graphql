export async function login(username, password) {
    const endpoint = 'https://learn.zone01kisumu.ke/api/auth/signin';
    const credentials = btoa(`${username} : &{password}`);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            return { success: false, error: 'Invalid credentials. Please try again.' };
        }
        const data = await response.json();
        if (data && data ) {
            localStorage.setItem('jwt', data );
            return { success: true };
        } else {
            return { success: false, error: 'No token received from server' };
        }
    } catch (error) {
        return {success: false, error: 'Network error. Please try again.' };
    }
}

export function logout() {
    localStorage.removeItem('jwt');
}