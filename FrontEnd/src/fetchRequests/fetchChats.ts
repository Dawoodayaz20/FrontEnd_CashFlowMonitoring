import type { Message } from "../pages/FlowManagerPage/ChatContext";

export const fetchSessions = async () => {
    try{
        const response = await fetch(`api/chat/history`, {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},       
        })

        if(!response.ok){
            alert("There was an error connecting to Server!");
        }

        const sessions = await response.json();

        return sessions
    }
    catch(err){
        alert(`The server responded with an error: ${err}`)
    }
};

export const createSession = async (session_id: string, title: string) => {
    try{
        const response = await fetch(`api/chat/session/new`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({ session_id, title})
        })

        if(!response.ok){
            console.log("There was an error connecting to server!")
        }
        const data = await response.json();
        return data;
    } catch(err){
        alert(`There was an error: while creating a new Chat Session${err}.`)
    }
};

export const fetchSessionMessages = async (session_id: string) => {
    try{
        const response = await fetch(`api/chat/history/${session_id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
        })

        if(!response.ok) console.log('There was an error connecting to the server');

        const chat = await response.json();
        return chat;
    } catch(err){
        console.log("The server responded with error:", err);
    }
};

export const saveMessage = async (session_id: string, msg: Message) => {
    try{
        const res = await fetch(`api/chat/message`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({session_id, id: msg.id, content: msg.content, role: msg.role, timestamp: msg.timestamp})
        })

        if(!res.ok) console.log('There was an error connecting with the server!');

        const response = await res.json();
        return response;
    } catch(err){
        console.log("Server responded with error:", err);
    }
}

export const updateTitle = async (session_id: string, title: string) => {
    try{
        const res = await fetch(`api/chat/session/${session_id}/title`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({session_id, title})
        })

        if(!res.ok) console.log('There was an error connecting with the server!');

        const response = await res.json();
        return response;
    } catch(err){
        console.log("Server responded with error:", err);
    }
}

export const deleteSession = async (session_id: string) => {
    try{
        const res = await fetch(`api/chat/session/${session_id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({session_id})
        })

        const response = await res.json();

        if(!res.ok) console.log('There was an error connecting with the server!');

        return response;
    } catch(err){
        console.log("Server responded with error:", err);
    }
}
