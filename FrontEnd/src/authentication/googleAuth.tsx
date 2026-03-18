import useAuthStore from '../store/useAuthStore';

export const GoogleSignIn = async (accessToken: string) => {
    const { setUser } = useAuthStore.getState(); 

    try{
        const response = await fetch(`${import.meta.env.BackEnd_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ token: accessToken})
        })
        const data = await response.json();
        if (response.ok) {
        setUser(data.user);
        }
        return data;
    } catch (error) {
        console.error('Google Sign-In error:', error);
    }
}