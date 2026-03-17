import useAuthStore from "../store/useAuthStore"
// import { useNavigate } from 'react-router-dom';

export const SignIn = async (email:string, password: string, navigate: any) => {
  const { setUser } = useAuthStore.getState();

  try{
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method:'POST',
      headers:{ 'Content-Type': 'application/json' },
      credentials:'include',
      body: JSON.stringify({email, password})
    })

    const data = await response.json();
    if(response.ok){
      setUser(data.user);
      navigate('/dashboard')
    }
    console.log('Login response:', data);
    return data;
  }
  catch(error){
    console.error("There was an error processing Login Request:", error);
  }
}

export const SignUp = async (name : string, email : string, pass : string, navigate: any) => {
  const { setUser } = useAuthStore.getState();
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials:'include',
      body: JSON.stringify({ 
        name: name,
        email: email,
        password: pass
      })
    });
    
    // console.log('Response status:', response.status)
    const data = await response.json();
    if(response.ok){
      setUser(data.user);
      navigate('/dashboard')
    }
    console.log('Login response:', data);
    return data;  // ADD THIS

  } catch (error) {
    console.error('Error:', error);
  }
};

export const SignOut = async(navigate:any) => {
  const { clearUser } = useAuthStore.getState();

  try{
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

  clearUser();
  navigate('/');
  }
  catch(error){
    console.log("Logout error:", error);
  }
}

export const updateProfile = async(
  name?: string,
  email?:string,
  currentPassword?: string,
  newPassword?: string
) => {
  const { setUser } = useAuthStore.getState();

  try{
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json' },
      credentials: 'include', // Send JWT cookie
      body: JSON.stringify({ name, email, currentPassword, newPassword })
    });

    const data = await response.json();

    console.log("User updated profile data :",data)

    if(response.ok){
      setUser(data.user);
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  }
  catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'Network error' };
  }
};

export const deleteAccount = async (password: string, navigate: any) => {
  const { clearUser } = useAuthStore.getState();

  try {
    const response = await fetch('http://localhost:5000/api/auth/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (response.ok) {
      clearUser(); // Clear Zustand store
      navigate('/'); // Redirect to login/home
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }

  } catch (error) {
    console.error('Delete account error:', error);
    return { success: false, message: 'Network error' };
  }
};