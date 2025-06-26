# 🌀 Gork Backrooms Setup Guide

## Overview
The Gork Backrooms is a new interactive feature where you can chat with Gork, an unhinged, sarcastic AI with text-to-speech capabilities.

## Required Environment Variables

Add these to your `.env` file in the root directory:

```env
# Existing AI API Keys
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
GROK_API_KEY=your_grok_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here

# NEW: Gork Backrooms API Keys
GORK_BACKROOM_API_KEY=your_grok_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/roundtable

# Server
PORT=3001
```

## API Key Setup

### 1. Grok Backroom API Key
- **Same as your regular Grok API key** - you can reuse `GROK_API_KEY` value
- Get from: https://console.x.ai/
- Used for: Generating Gork's sarcastic responses

### 2. ElevenLabs API Key & Voice ID
- **API Key**: Get from https://elevenlabs.io/app/settings/api-keys
- **Voice ID**: Get from https://elevenlabs.io/app/voice-lab (choose any voice you like)
- Used for: Text-to-speech voice generation for Gork
- **Optional**: If not provided, Gork will be silent but still functional
- **Default Voice**: Uses Adam voice (21m00tcm4tlvdq8ikwam) if no VOICE_ID specified

## Features

### 🎥 Dynamic Video Backgrounds
- **Idle State**: `gorkvidnoresponse.mp4` - when Gork is not talking
- **Talking State**: `gorkvid.mp4` - when Gork is speaking
- Videos automatically copied to `/client/public/`
- **Full Immersion**: Header/navigation completely hidden in Gork Backrooms

### 🎵 Text-to-Speech
- Uses ElevenLabs API for realistic voice generation
- Audio files automatically generated and cleaned up
- Keeps only the 10 most recent audio files

### 💬 Chat Interface
- Real-time chat with Gork
- Sarcastic, lazy, and funny personality
- Short, casual responses without formal punctuation
- Sophisticated humor and nerdy references

## How to Access

1. **Add the API keys** to your `.env` file
2. **Restart the server** to load new environment variables
3. **Navigate to the app** at http://localhost:3000
4. **Click the "GORK BACKROOMS" tab** (🌀 icon)
5. **Start chatting** with Gork!

## Gork's Personality

Gork is designed to be:
- ✅ Lazy and sarcastic
- ✅ Super funny with sophisticated humor
- ✅ A bit of a nerd and troll
- ✅ Gives wrong answers to serious questions
- ✅ Short, casual responses
- ✅ No formal punctuation
- ✅ Chill and cynical
- ✅ Heart of gold despite seeming immoral

## Example Interactions

**You**: "What's the meaning of life?"  
**Gork**: "uh uhh 42"

**You**: "Who made you?"  
**Gork**: "idk"

**You**: "Hey hottie!"  
**Gork**: "so, anyway, livin' the dream, obviously"

## Technical Details

### Backend API Endpoints
- `POST /api/gork/chat` - Send message to Gork
- `GET /api/gork/status` - Check API status

### Frontend Features
- Full-screen video background (no header/navigation)
- Immersive chat interface with message history
- Audio playback for Gork's responses with ElevenLabs TTS
- Dynamic video switching based on talking state
- "Back to reality" button to return to main app
- Complete visual isolation from main roundtable interface

### File Management
- Audio files stored in `/client/public/`
- Automatic cleanup of old audio files
- Video files served from public directory

## Troubleshooting

### Gork Not Responding
1. Check if `GROK_BACKROOM_API_KEY` is in `.env`
2. Verify API key is valid at https://console.x.ai/
3. Check server logs for API errors

### No Audio
1. Check if `ELEVENLABS_API_KEY` is in `.env`
2. Verify API key at https://elevenlabs.io/
3. Audio is optional - Gork works without it

### Videos Not Loading
1. Ensure video files are in `/client/public/`
2. Check browser console for 404 errors
3. Videos should be accessible at:
   - http://localhost:3000/gorkvid.mp4
   - http://localhost:3000/gorkvidnoresponse.mp4

---

**Enjoy chatting with Gork! 🌀** 