import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';


export default function AudioToText() {
  const [transcript, setTranscript] = useState('');
  const [savedStatus, setSavedStatus] = useState('');
  const socketRef = useRef(null);

  const fileBufferRef = useRef(null);
  const totalChunksRef = useRef(0);
  const currentChunkRef = useRef(0);
  const fileRef = useRef(null);
  const chunkSize = 64 * 1024;

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('chunk_received', ({ chunkIndex }) => {
      sendNextChunk(chunkIndex + 1);
    });

    socketRef.current.on('transcript', (data) => {
      setTranscript((prev) => prev + (prev ? '\n' : '') + data.text);
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const sendNextChunk = (index = 0) => {
    if (!fileBufferRef.current || index >= totalChunksRef.current) return;
    currentChunkRef.current = index;

    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, fileBufferRef.current.byteLength);
    const chunk = fileBufferRef.current.slice(start, end);

    const chunkBlob = new Blob([chunk], { type: 'audio/mpeg' });
    const chunkReader = new FileReader();

    chunkReader.onloadend = () => {
      const base64Audio = chunkReader.result.split(',')[1];
      socketRef.current.emit('audio_chunk', {
        audio: base64Audio,
        chunkIndex: index,
        filename: fileRef.current.name,
      });
    };

    chunkReader.readAsDataURL(chunkBlob);
  };

  const handleFileUpload = (event) => {
    fileRef.current = event.target.files[0];
    if (!fileRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      fileBufferRef.current = e.target.result;
      totalChunksRef.current = Math.ceil(fileBufferRef.current.byteLength / chunkSize);
      currentChunkRef.current = 0;
      sendNextChunk(0);
    };

    reader.readAsArrayBuffer(fileRef.current);
  };

  const saveTranscript = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-transcript', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) throw new Error('Failed to save transcript');
      setSavedStatus('Saved successfully!');
      setTimeout(() => setSavedStatus(''), 3000);
    } catch (error) {
      setSavedStatus('Error saving transcript');
      console.error(error);
    }
  };

  const deleteTranscript = async () => {
    try {
      const response = await fetch('http://localhost:5000/delete-transcript', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete transcript');
      setTranscript('');
      setSavedStatus('Deleted successfully!');
      setTimeout(() => setSavedStatus(''), 3000);
    } catch (error) {
      setSavedStatus('Error deleting transcript');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
      <label for="audioUpload">Audio file to text (only .mp3 allowed)</label>
      <br/>
      <input type="file" id="audioUpload" accept=".mp3,audio/mpeg" onChange={handleFileUpload} />
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={10}
        style={{
          marginTop: '1rem',
          width: '100%',
          fontFamily: 'monospace',
          fontSize: '1rem',
          padding: '1rem',
          boxSizing: 'border-box',
          whiteSpace: 'pre-wrap',
          resize: 'vertical',
        }}
      />
      <button
        onClick={saveTranscript}
        style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', marginRight: '1rem' }}
      >
        Save Transcript
      </button>
      <button
        onClick={deleteTranscript}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Delete Transcript
      </button>
      <div>{savedStatus}</div>
    </div>
  );
}