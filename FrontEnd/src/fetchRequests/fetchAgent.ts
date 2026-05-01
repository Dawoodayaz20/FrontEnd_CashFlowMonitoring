export const getResponse = async (text: string, userID: string, userName: string, email: string, activeSessionId: string) => {

    try{
        const response = await fetch(`${import.meta.env.VITE_FLOWAGENT_API}`, {
        method: "POST",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({ question: text, userID, user_name: userName, email, session_id: activeSessionId })
    })

    const data = await response.json();

    if (!response.ok){
        return { success: false, error: data.error, message: data.message };
    }

    console.log("Response:", data);
    return { success: true, data: data };
    }
    catch(err){
        return { success: false, error: "network_error", message: "Unable to reach the server." };;
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

// There was an error connecting the Server:Error code: 429 - [{'error': {'code': 429, 'message': 'You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-2.5-flash\nPlease retry in 51.946480516s.', 'status': 'RESOURCE_EXHAUSTED', 'details': [{'@type': 'type.googleapis.com/google.rpc.Help', 'links': [{'description': 'Learn more about Gemini API quotas', 'url': 'https://ai.google.dev/gemini-api/docs/rate-limits'}]}, {'@type': 'type.googleapis.com/google.rpc.QuotaFailure', 'violations': [{'quotaMetric': 'generativelanguage.googleapis.com/generate_content_free_tier_requests', 'quotaId': 'GenerateRequestsPerDayPerProjectPerModel-FreeTier', 'quotaDimensions': {'model': 'gemini-2.5-flash', 'location': 'global'}, 'quotaValue': '20'}]}, {'@type': 'type.googleapis.com/google.rpc.RetryInfo', 'retryDelay': '51s'}]}}]