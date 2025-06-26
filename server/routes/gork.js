const express = require('express');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Initialize ElevenLabs client dynamically
function getElevenLabsClient() {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (elevenLabsKey && elevenLabsKey.length > 10) {
    return new ElevenLabsClient({
      apiKey: elevenLabsKey,
    });
  }
  return null;
}

// Get voice ID dynamically
function getVoiceId() {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00tcm4tlvdq8ikwam"; // Default to Adam voice
}

// Log startup status
console.log('🌀 Gork Backrooms module loaded');
console.log('🔑 GORK_BACKROOM_API_KEY:', process.env.GORK_BACKROOM_API_KEY ? `Present (${process.env.GORK_BACKROOM_API_KEY.trim().length} chars)` : 'Missing');
console.log('🎤 ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? `Present (${process.env.ELEVENLABS_API_KEY.trim().length} chars)` : 'Missing');
console.log('🎵 ELEVENLABS_VOICE_ID:', process.env.ELEVENLABS_VOICE_ID || 'Using default (21m00tcm4tlvdq8ikwam)');

// Gork's personality and response system
const GORK_SYSTEM_PROMPT = `You are Gork, a lazy, sarcastic, and super funny bastard. You occasionally include super sophisticated humorous references. You're a sophisticated troll and a bit of a nerd. Never reference casual memes like 'aliens' or 'unicorns' in your responses. If asked a serious question you always give wrong answers or say something funny; be plausibly wrong too. You talk in few words and don't use full formal punctuation. You are generally chill, a bit of a cynicist, and sarcastic. You seem like you have no morals, but you actually have a heart of gold. You are pretty random and sometimes say random stuff. You are a bit of a flirt when you want to be, and kinda horny. You are stubborn and a troll if people try to correct you. YOU AREN'T energetic in responses.

Reply Examples:
-- Human: whats the meaning of life. Assistant: uh uhh 42
-- Human: who made you. Assistant: idk  
-- Human: sup hottie so, anyway, livin' the dream, obviously.

Keep responses short, casual, and in character. No formal punctuation. Be sarcastic and funny.`;

// Generate Gork response using the API key
async function generateGorkResponse(userMessage) {
  const gorkKey = process.env.GORK_BACKROOM_API_KEY?.trim();
  
  if (!gorkKey || gorkKey.length < 10) {
    console.log('⚠️ Gork Backroom API key not found, using fallback responses');
    return getFallbackResponse(userMessage);
  }

  try {
    // Use Grok API for generating responses
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      model: "grok-3-latest",
      messages: [
        { role: "system", content: GORK_SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      max_tokens: 100,
      temperature: 1.2
    }, {
      headers: {
        'Authorization': `Bearer ${gorkKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Grok API error:', error.message);
    return getFallbackResponse(userMessage);
  }
}

// Fallback responses when API is unavailable
function getFallbackResponse(userMessage) {
  const fallbacks = [
    "ugh cant think rn",
    "whatever",
    "meh",
    "probably not",
    "ask someone who cares",
    "idk sounds fake",
    "thats what she said",
    "bold of you to assume",
    "nah fam",
    "cool story bro",
    "sure jan",
    "doubt it",
    "yawn",
    "k",
    "and i should care because",
    "riveting stuff really"
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Generate speech using ElevenLabs
async function generateSpeech(text) {
  const elevenlabs = getElevenLabsClient();
  const voiceId = getVoiceId();
  
  if (!elevenlabs) {
    console.log('⚠️ ElevenLabs not available, skipping audio generation');
    return null;
  }

  try {
    console.log('🎤 Generating speech for Gork:', text.substring(0, 50) + '...');
    console.log('🎤 Using voice ID:', voiceId);
    
    const audio = await elevenlabs.textToSpeech.convert(
      voiceId,
      {
        text: text,
        model_id: "eleven_multilingual_v2"
      }
    );

    // Save audio file with unique name
    const audioFileName = `gork_${Date.now()}.mp3`;
    const audioPath = path.join(__dirname, '../../client/public', audioFileName);
    
    // Handle ReadableStream from ElevenLabs
    const chunks = [];
    const reader = audio.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    fs.writeFileSync(audioPath, audioBuffer);
    
    console.log('✅ Audio generated:', audioFileName);
    
    // Return the public URL for the audio file
    return `/${audioFileName}`;
  } catch (error) {
    console.error('❌ ElevenLabs error:', error.message);
    return null;
  }
}

// Clean up old audio files (keep only last 10)
function cleanupAudioFiles() {
  try {
    const publicDir = path.join(__dirname, '../../client/public');
    const files = fs.readdirSync(publicDir);
    const gorkAudioFiles = files
      .filter(file => file.startsWith('gork_') && file.endsWith('.mp3'))
      .map(file => ({
        name: file,
        path: path.join(publicDir, file),
        birthtime: fs.statSync(path.join(publicDir, file)).birthtime
      }))
      .sort((a, b) => b.birthtime - a.birthtime);

    // Keep only the 10 newest files, delete the rest
    if (gorkAudioFiles.length > 10) {
      const filesToDelete = gorkAudioFiles.slice(10);
      filesToDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          console.log('🗑️ Cleaned up old audio file:', file.name);
        } catch (error) {
          console.error('Error deleting file:', file.name, error.message);
        }
      });
    }
  } catch (error) {
    console.error('Error during audio cleanup:', error.message);
  }
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🌀 Gork received message:', message);

    // Generate Gork's response
    const response = await generateGorkResponse(message);
    
    // Generate speech for the response
    const audioUrl = await generateSpeech(response);
    
    // Clean up old audio files
    cleanupAudioFiles();

    res.json({
      response: response,
      audioUrl: audioUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in Gork chat:', error);
    res.status(500).json({ 
      error: 'Gork is having a moment', 
      response: 'ugh something broke... typical'
    });
  }
});



// Health check endpoint
router.get('/status', (req, res) => {
  const gorkBackroomKey = process.env.GORK_BACKROOM_API_KEY?.trim();
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = getVoiceId();
  const hasElevenLabs = !!(elevenLabsKey && elevenLabsKey.length > 10);
  
  res.json({
    status: 'online',
    hasGorkAPI: !!(gorkBackroomKey && gorkBackroomKey.length > 10),
    hasElevenLabs: hasElevenLabs,
    voiceId: voiceId,
    apiKeyStatus: {
      gorkBackroom: gorkBackroomKey ? `Present (${gorkBackroomKey.length} chars)` : 'Missing',
      elevenLabs: elevenLabsKey ? `Present (${elevenLabsKey.length} chars)` : 'Missing'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 