// This is our secure intermediary function.
// It receives data from the form, and then securely forwards it to the Google Apps Script.

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the secret Google Script URL from an environment variable
    // We will set this up in the Netlify dashboard in the next step.
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL) {
      throw new Error("Google Script URL is not configured.");
    }
    
    // The form data sent from the browser
    const formData = event.body;

    // Forward the data to the actual Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: formData
    });
    
    // Check if the forwarding was successful
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from Google Script:", errorText);
        throw new Error(`Google Script returned an error: ${response.statusText}`);
    }

    const result = await response.json();

    // Send the success response back to the browser
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    // Send an error response back to the browser
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: `Server error: ${error.message}` })
    };
  }
};
