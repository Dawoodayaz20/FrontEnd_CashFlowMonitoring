
// export const generateTitle = async (userMessage: string, userID: string, userName: string, email: string): Promise<string> => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_FLOWAGENT_API}`, {
//         method: "POST",
//         headers: { "Content-type": "application/json" },
//         body: JSON.stringify({
//           question: `Generate a short 4-6 word title for a chat that starts with: "${userMessage}". Reply with only the title, no punctuation.`,
//           userID,
//           user_name: userName,
//           email,
//         }),
//       });
//       const data = await response.json();
//       return typeof data === "string" ? data.trim() : "New chat";
//     } catch {
//       return userMessage.slice(0, 30);
//     }
//   };

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

export const generateTitle = async function generateChatTitle(userFirstMessage: string) {
  try{
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, // Get this from openrouter.ai
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-nano-9b-v2:free", // Use a :free model
        "messages": [
          {
            "role": "system",
            "content": "Summarize the user's message into a 3-word title. Return ONLY the title text, no quotes or periods."
          },
          {
            "role": "user",
            "content": userFirstMessage
          }
        ]
      })
    });
// meta-llama/llama-3.2-3b-instruct:free
    const data = await response.json();
    // const title = data.choices[0].message.content
    console.log(data)
    // 
    return data.choices[0].message.content;
  } catch(err){
    console.log("There was an error:", err);
  }
}

// Example usage:
// const title = await generateChatTitle("How do I cook a perfect steak?");
// console.log(title); // "Perfect Steak Cooking"