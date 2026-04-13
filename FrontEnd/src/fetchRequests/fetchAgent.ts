// type PersonalInfo = {
//     id: string,
//     name: string,
//     email: string,
// }

export const getResponse = async (text: string, userID: string, userName: string, email: string) => {

    try{
        const response = await fetch(`${import.meta.env.VITE_FLOWAGENT_API}`, {
        method: "POST",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({ question: text, userID, user_name: userName, email })
    })

    if (!response.ok){
        alert("There was an error connecting to Server!");
    }

    const data = await response.json();
    console.log("Response:", data);
    return data;
    }
    catch(err){
        console.log('There was an error connecting to Server:', err);
        return err;
    }
}