from flask import Blueprint, request, jsonify
from pydantic import BaseModel

from .. import redis


transcript = Blueprint("transcript", __name__)

class TranscriptSchema(BaseModel):
    transcript: str

@transcript.route('/update-transcript', methods=['PUT'])
def update_transcript():
    json_data = request.get_json()
    data = TranscriptSchema(**json_data)
    print("TRANSCRIPT", data.transcript)
    redis.set("TRANSCRIPT", data.transcript)
    return jsonify({"message": "Transcript saved"})


@transcript.route('/delete-transcript', methods=['DELETE'])
def delete_transcript():
    redis.delete("TRANSCRIPT")
    return jsonify({"message": "Transcript deleted"})


@transcript.route('/transcript', methods=['GET'])
def get_transcript():
    tr = redis.get("TRANSCRIPT")
    print(tr)
    if tr:
        return jsonify({"transcript": tr.decode('utf-8')})
    return jsonify({"msg": "Not found"}), 404