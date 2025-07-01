from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from openai import OpenAI
import os
from dotenv import load_dotenv
import tempfile
import traceback
import base64
import redis


load_dotenv()
socketio = SocketIO(cors_allowed_origins="*")
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
redis = redis.Redis(host="localhost", port=6379, db=0)

def create_app():
    app = Flask(__name__)
    CORS(app)
    socketio.init_app(app)

    @socketio.on("audio_chunk")
    def process_audio_chunk(data):
        audio_b64 = data.get("audio")
        chunk_index = data.get("chunkIndex")
        session_id = request.sid

        if audio_b64 is None or chunk_index is None:
            emit("error", {"message": "Missing audio or chunkIndex"})
            return False

        try:
            audio_bytes = base64.b64decode(audio_b64)
            with tempfile.NamedTemporaryFile(suffix=".mp3") as tmp:
                tmp.write(audio_bytes)
                tmp.flush()

                transcript = openai.audio.transcriptions.create(
                    file=open(tmp.name, "rb"),
                    model="whisper-1"
                )

            key = "TRANSCRIPT"
            prev_text = redis.get(key)
            new_text = transcript.text
            if prev_text:
                combined_text = prev_text.decode() + "\n" + new_text
            else:
                combined_text = new_text
            redis.set(key, combined_text, ex=3600)

            emit("transcript", {"text": new_text, "chunkIndex": chunk_index})
            emit("chunk_received", {"chunkIndex": chunk_index})

            return True
        except Exception:
            traceback.print_exc()
            emit("error", {"message": "Failed to transcribe audio chunk"})
            return False

    from .apis.transcript import transcript
    app.register_blueprint(transcript)

    return app
