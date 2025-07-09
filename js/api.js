export async function fetchUserInfo(jwt) {
    const endpoint = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql'
    const query = `
    query {
        user {
            id
            login
            firstName
            lastName
            email
        }
    }
    `;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Unauthorized or network error');
        }

        const result = await response.json();
        if (result.data && result.data.user && result.data.user.length > 0) {
            const user = result.data.user[0];
            return { success: true, user };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function fetchXPTransactions(jwt, userId) {
    const endpoint = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
    const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    userId: {_eq: $userId}
                    type: {_eq: "xp"}
                    eventId: {_eq: 75}
                }
            ) {
                amount
                createdAt
            }
        }
    `;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ query, variables: { userId } })
        });
        if (!response.ok) {
            throw new Error('Unauthorized or network error');
        }
        const result = await response.json();
        if (result.data && result.data.transaction) {
            return { success: true, transactions: result.data.transaction };
        } else {
            return { success: false, error: 'No XP transactions found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function fetchAuditTransactions(jwt, userId) {
    const endpoint = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
    const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    userId: {_eq: $userId}
                    type: {_in: ["up", "down"]}
                }
            ) {
                type
                amount
            }
        }
    `;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ query, variables: { userId } })
        });
        if (!response.ok) {
            throw new Error('Unauthorized or network error');
        }
        const result = await response.json();
        if (result.data && result.data.transaction) {
            return { success: true, transactions: result.data.transaction };
        } else {
            return { success: false, error: 'No audit transactions found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
