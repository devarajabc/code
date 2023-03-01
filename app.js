require('dotenv').config();
const express = require('express');
const  AssistantV2  = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const { v4: uuidv4 } = require('uuid');
const openai = require('openai');

const app = express();

// Set up the Watson Assistant service
const assistant = new AssistantV2({
  version: '2021-09-01',
  authenticator: new IamAuthenticator({
    apikey:"i404oORs1leeLnLXAr8elMJYtE7mDe0llv8dy_aS9P0K",
  }),
  url:"https://api.jp-tok.assistant.watson.cloud.ibm.com/instances/7349ef10-ff7d-433e-9993-c27d7d5479b5",
});

const sessionId = async () => {
    const session = await assistant.createSession({
      assistantId:"ecef0562-84e1-409e-ba03-2d8de872fffb",
    });
    return session.result.session_id;
  };
  


//////
// Send a message to Watson Assistant and get a response
/*const sendMessage = async (text) => {
    const message = {
      input: {
        text,
      },
      assistantId:"ecef0562-84e1-409e-ba03-2d8de872fffb",
    };
  
    try {
      const response = await assistant.message(message);
      return response.result.output.generic[0].text;
    } catch (error) {
      console.error(error);
      return error.message;
    }
  };*/
////////////
// Set up the OpenAI service
openai.apiKey ="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";
const engine ="text-davinci-edit-001";

// Handle the message endpoint
app.post('/message', async (req, res) => {
  const sessionId = uuidv4();
  const text = req.body.input.text;

  try {
    // Send the user's message to Watson Assistant
    const watsonResponse = await assistant.message({
      assistantId:"ecef0562-84e1-409e-ba03-2d8de872fffb",
      sessionId: sessionId,
      input: {
        message_type: 'text',
        text: text,
      },
    });

    // Generate a response using OpenAI
    const openaiResponse = await openai.complete({
      engine: engine,
      prompt: watsonResponse.result.output.generic[0].text,
      maxTokens: 50,
    });

    // Send the response back to the user
    res.json({
      output: {
        text: openaiResponse.data.choices[0].text,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
  });
  
