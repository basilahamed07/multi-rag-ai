import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Modal, Collapse } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone'; // Importing useDropzone
import './Chat.css';  

// Importing Google Font (Roboto)
import '@fontsource/roboto';

const Chat = () => {

  let apiEndpoint;

  // Determine the API endpoint based on the selected optio

 // Define the function for handling Wikipedia selection
 const handleWikipediaClick = () => {
  setSelectedOption('wikipedia');
};

// Define the function to handle the bot creation from Wikipedia
const handleWikipediaCreateBot = () => {
  if (!newBotName || !botFile) {
    alert("Please provide a bot name and a Wikipedia article.");
    return;
  }

  // Prepare data for the request
  const formData = new FormData();
  formData.append('bot_name', newBotName);
  formData.append('text', botFile);  // `botFile` will contain the Wikipedia URL or text

  // Send the data via axios POST request to create the Wikipedia-based bot
  axios.post('http://localhost:5000/text_bot_create', formData, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  .then((response) => {
    setBots([...bots, response.data]);
    setNewBotName(''); // Reset bot name
    setBotFile(null); // Reset bot file (Wikipedia text)
    setCreateBotModalOpen(false); // Close modal
  })
  .catch((error) => {
    console.error('Error creating bot:', error);
    alert('There was an error creating the bot.');
  });
};
const handleWebsiteCreateBot = () => {
  if (!newBotName || !botFile) {
    alert("Please provide a bot name and a Wikipedia article.");
    return;
  }

  // Prepare data for the request
  const formData = new FormData();
  formData.append('bot_name', newBotName);
  formData.append('text', botFile);  // `botFile` will contain the Wikipedia URL or text

  // Send the data via axios POST request to create the Wikipedia-based bot
  axios.post('http://localhost:5000/website_bot', formData, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
      'Content-Type': 'multipart/form-data',
    },  
  })
  .then((response) => {
    setBots([...bots, response.data]);
    setNewBotName(''); // Reset bot name
    setBotFile(null); // Reset bot file (Wikipedia text)
    setCreateBotModalOpen(false); // Close modal
  })
  .catch((error) => {
    console.error('Error creating bot:', error);
    alert('There was an error creating the bot.');
  });
};

  // const [input, setInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('files');
  const [selectedBot, setSelectedBot] = useState(null);
  // const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState(''); 
  const [bots, setBots] = useState([]);
  const [createBotModalOpen, setCreateBotModalOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [botFile, setBotFile] = useState(null);
  const [isBotListOpen, setIsBotListOpen] = useState(true);
  // const [botSelectionError, setBotSelectionError] = useState(false); // New state for error message

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [botSelectionError, setBotSelectionError] = useState(false);

  const handleFileChange = (event) => {
    setBotFile(event.target.files[0]);
  };


  // Function to fetch chat history from the API
  const fetchChatHistory = (botName) => {
    axios
      .get(`http://localhost:5000/chat-history/${botName}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` },
      })
      .then((response) => {
        const chatHistory = response.data.history || [];
        const formattedMessages = chatHistory.flatMap((entry) => [
          { text: entry.question, type: 'user' },  // Display user's question
          { text: entry.answer, type: 'bot' },     // Display bot's response
        ]);
        setMessages(formattedMessages);
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });
  };
  

  // // Fetch the chat history when the botName changes or on component mount
  // useEffect(() => {
  //   if (botName) {
  //     fetchChatHistory(botName);
  //   }
  // }, [botName]);

  // Function to handle sending a message
  // const handleSendMessage = () => {
  //   if (!input) return;

  //   const userMessage = { text: input, type: 'user' };
  //   setMessages([...messages, userMessage]);
  //   setInput('');

  //   // Example of sending the message to an API (this part depends on your backend logic)
  //   // sendMessageToBot(input);
  // };


  useEffect(() => {
    
    const storedUserName = sessionStorage.getItem('username');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setUserName('User');
    }

    axios.get('http://localhost:5000/bots', {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` }
    })
    .then((response) => {
      setBots(response.data.history);
      const storedBot = sessionStorage.getItem('bot_name');
      if (storedBot) {
        setSelectedBot(storedBot);
        fetchChatHistory(storedBot);
        setBotSelectionError(false); // Reset error if bot exists
      } else if (response.data.history.length > 0) {
        setSelectedBot(response.data.history[0].bot_name);
        fetchChatHistory(response.data.history[0].bot_name);
        setBotSelectionError(false); // Reset error if a bot exists
      } else {
        setBotSelectionError(true); // Set error if no bot is selected or available
      }
    })
    .catch((error) => {
      console.error('Error fetching bots:', error);
    });
    
  }, []);

  // const fetchChatHistory = (botName) => {
  //   axios.get(`http://localhost:5000/chat-history/${botName}`, {
  //     headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` }
  //   })
  //   .then((response) => {
  //     setMessages(response.data.messages || []);
  //   })
  //   .catch((error) => {
  //     console.error('Error fetching chat history:', error);
  //   });
  // };

  const getBotResponse = async (userQuestion) => {
    try {
      const response = await axios.post('http://localhost:5000/chat', 
        new URLSearchParams({
          question: userQuestion,
          bot_name: selectedBot
        }), {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` }
      });
      return response.data.response || 'No response from bot';
    } catch (error) {
      console.error('Error fetching response from bot:', error);
      return 'Error occurred while fetching response from bot';
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage = { text: input, type: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const botResponse = await getBotResponse(input);
    const newBotMessage = { text: botResponse, type: 'bot' };

    setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    setInput('');
  };

  const handleDelete = () => {
    setMessages([]);
    setInput('');
  };

  const handleBotSelection = (botName) => {
    setSelectedBot(botName);
    sessionStorage.setItem('bot_name', botName);
    fetchChatHistory(botName);
    setBotSelectionError(false); // Reset error when a bot is selected
  };

  const handleCreateBot = () => {
    if (!newBotName.trim() || !botFile) {
      alert('Please provide both bot name and file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('bot_name', newBotName);
    formData.append('file', botFile);
  
    axios.post('http://localhost:5000/bot-create', formData, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        'Content-Type': 'multipart/form-data',
      }
    })
    .then((response) => {
      setBots([...bots, response.data]);
      setNewBotName(''); // Reset bot name
      setBotFile(null); // Reset file
      setCreateBotModalOpen(false); // Close modal
    })
    .catch((error) => {
      console.error('Error creating bot:', error);
      alert('There was an error creating the bot.');
    });
  };

  const handleAccountClick = () => {
    navigate('/account');
  };

  const handleLogoutClick = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // Handling file drop
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setBotFile(acceptedFiles[0]);
    },
    multiple: false, // Allow only one file at a time
  });

  return (
    <div className="chat-container" style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'white' }}>
      {/* Header */}
      <Box sx={{
        position: 'absolute', top: 15, width: '95%', height: '5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, gap: 2, paddingLeft: 2, paddingRight: 2
      }}>
        <Typography variant="h6" sx={{ color: 'black', fontFamily: 'Roboto' }}>
          Selected Bot: {selectedBot || 'None'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: 'black', fontFamily: 'Roboto' }}>
            Welcome, {userName}!
          </Typography>
          <Button onClick={handleAccountClick} sx={{ borderRadius: '20px', padding: '10px', backgroundColor: '#3a80ff', boxShadow: 2, fontFamily: 'Roboto' }} variant="contained">
            Account
          </Button>
          <Button onClick={handleLogoutClick} sx={{ borderRadius: '20px', padding: '10px', backgroundColor: '#ff3a3a', boxShadow: 2, fontFamily: 'Roboto' }} variant="contained">
            Logout
          </Button>
        </Box>
      </Box>

      {/* Bot List */}
      <Box sx={{
        width: isBotListOpen ? '20%' : '0', transition: 'width 0.3s ease-in-out', overflow: 'hidden', backgroundColor: '#f5f5f5', padding: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', borderRadius: 2, border: '1px solid #ddd', marginTop: '5%',
      }}>
        {/* <Button
          onClick={() => setIsBotListOpen(!isBotListOpen)}
          sx={{
            marginBottom: 2, backgroundColor: '#3a80ff', color: '#fff', borderRadius: '20px', boxShadow: 2,
            '&:hover': { backgroundColor: '#2a5ecf' }, fontFamily: 'Roboto'
          }}
        >
          {/* {isBotListOpen ? 'Hide Bots' : 'Show Bots'} */}
        {/* </Button> */}
        <Collapse in={isBotListOpen}>
          {bots.map((bot) => (
            <Button
              key={bot.file_id}
              onClick={() => handleBotSelection(bot.bot_name)}
              variant="outlined"
              sx={{
                marginBottom: 2, backgroundColor: selectedBot === bot.bot_name ? '#3a80ff' : 'transparent',
                color: selectedBot === bot.bot_name ? '#fff' : 'black', borderRadius: '20px', boxShadow: 2, fontFamily: 'Roboto'
              }}
            >
              {bot.bot_name}
            </Button>
          ))}
          <Button
            onClick={() => setCreateBotModalOpen(true)}
            variant="outlined"
            sx={{
              marginTop: 2, backgroundColor: '#28a745', color: '#fff', borderRadius: '20px', boxShadow: 2, fontFamily: 'Roboto'
            }}
          >
            Create Bot
          </Button>
        </Collapse>
      </Box>

      {/* Modal for Create Bot */}
      <Modal
  open={createBotModalOpen}
  onClose={() => setCreateBotModalOpen(false)}
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }}
>
  <Box
    sx={{
      backgroundColor: 'white',
      padding: 4,
      borderRadius: 2,
      boxShadow: 3,
      width: 400,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Typography variant="h6" sx={{ textAlign: 'center', color: 'black' }}>
      Create a New Bot
    </Typography>

    <TextField
      label="Bot Name"
      variant="outlined"
      value={newBotName}
      onChange={(e) => setNewBotName(e.target.value)}
    />

    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant={selectedOption === 'files' ? 'contained' : 'outlined'}
        onClick={() => setSelectedOption('files')}
        sx={{ flex: 1 }}
      >
        Files
      </Button>
      <Button
        variant={selectedOption === 'wikipedia' ? 'contained' : 'outlined'}
        onClick={handleWikipediaClick} // Trigger the Wikipedia handler
        sx={{ flex: 1 }}
      >
        Wikipedia
      </Button>
      <Button
        variant={selectedOption === 'websites' ? 'contained' : 'outlined'}
        onClick={() => setSelectedOption('websites')}
        sx={{ flex: 1 }}
      >
        Websites
      </Button>
    </Box>

    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {selectedOption === 'files' ? (
        <>
          <div
            {...getRootProps()}
            style={{
              border: '1px dashed #ccc',
              padding: '10px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <input {...getInputProps()} />
            <Typography variant="body2">Drag & drop a file, or click to select</Typography>
          </div>
          {botFile && (
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              File Selected: {botFile.name}
            </Typography>
          )}
        </>
      ) : selectedOption === 'wikipedia' ? (
        <TextField
          label="Wikipedia Article"
          variant="outlined"
          fullWidth
          onChange={(e) => setBotFile(e.target.value)} // Handle text input
        />
      ) : selectedOption === 'websites' ? (
        <TextField
          label="Website URL"
          variant="outlined"
          fullWidth
          onChange={(e) => setBotFile(e.target.value)} // Handle text input for website URL
        />
      ) : null}
    </Box>

    <Button
      onClick={selectedOption === 'wikipedia' ? handleWikipediaCreateBot : selectedOption === 'websites' ? handleWebsiteCreateBot : handleCreateBot}
      sx={{
        marginTop: 2,
        backgroundColor: '#28a745',
        color: '#fff',
        borderRadius: '20px',
        boxShadow: 2,
        fontFamily: 'Roboto',
      }}
    >
      Create Bot
    </Button>
  </Box>
</Modal>



      {/* Chat Area */}
       <Box sx={{ width: '100%', marginLeft: '0%', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, marginTop: '5%', borderRadius: 2, border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>
      {botSelectionError && (
        <Box sx={{ padding: 2, backgroundColor: '#ffcccb', color: '#d8000c', borderRadius: 1, textAlign: 'center', fontFamily: 'Roboto' }}>
          <Typography variant="body2">Please select or create a bot before sending messages.</Typography>
        </Box>
      )}

      <Box sx={{ height: '90%', overflowY: 'scroll', padding: 2, backgroundColor: 'white', borderRadius: 1 }}>
        {messages.map((message, index) => (
          <Box key={index} sx={{
            display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: 2
          }}>
            <Typography variant="body1" sx={{
              backgroundColor: message.type === 'user' ? '#3a80ff' : '#e0e0e0',
              color: message.type === 'user' ? 'white' : 'black',
              padding: '10px', borderRadius: 1, maxWidth: '60%', wordWrap: 'break-word'
            }}>
              {message.text}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          sx={{ borderRadius: '20px' }}
        />
        <Button
          onClick={handleSendMessage}
          variant="contained"
          sx={{
            marginLeft: 2, backgroundColor: '#28a745', color: 'white', borderRadius: '20px',
            boxShadow: 2, '&:hover': { backgroundColor: '#218c3c' }
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
    </div>
  );
};

export default Chat;
