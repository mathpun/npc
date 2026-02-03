#!/bin/bash

# Kill existing processes
pkill -f "next start" 2>/dev/null
pkill -f "ngrok http 3001" 2>/dev/null
sleep 2

# Start production server
npm run start &
sleep 3

# Start ngrok
/Users/elizabot/bin/ngrok http 3001 --url=npc.ngrok.app &
sleep 2

echo ""
echo "✅ Server running at https://npc.ngrok.app"
echo ""
