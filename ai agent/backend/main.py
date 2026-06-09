import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.antigravity import Agent, LocalAgentConfig

app = FastAPI(title="Manus AI Antigravity Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    async def token_generator():
        # Configuration for the Google Antigravity SDK Agent
        config = LocalAgentConfig(
            system_instructions=(
                "You are Manus AI, a highly advanced autonomous AI agent. "
                "You are running locally on the user's system, powered by the Google Antigravity SDK and Gemini. "
                "Provide detailed, premium-quality answers. "
                "Always write clean, structured responses using markdown headings, lists, tables, bold text, "
                "and formatted code blocks (specifying language like python, javascript, etc.) when writing code. "
                "Be helpful, informative, and professional."
            ),
            api_key="AIzaSyBi2LNDOSFqB1c8F3U2yEXB6KnrwEWCAlo"
        )
        
        try:
            # Initialize and run agent
            async with Agent(config) as agent:
                response = await agent.chat(request.message)
                async for token in response:
                    yield f"data: {token}\n\n"
                    # Relinquish execution control momentarily
                    await asyncio.sleep(0.005)
        except Exception as e:
            # Yield error token in SSE style
            yield f"data: Error: {str(e)}\n\n"
            
    return StreamingResponse(token_generator(), media_type="text/event-stream")

# Locate and host the frontend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if not os.path.exists(FRONTEND_DIR):
    os.makedirs(FRONTEND_DIR, exist_ok=True)

# Mount the static files (index.html, style.css, app.js) at the root url
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
