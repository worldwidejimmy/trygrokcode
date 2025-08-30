import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [selected, setSelected] = useState('fractal');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (selected === 'fractal') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100; // Leave space for dropdown

      const drawFractal = (seedX, seedY) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
        ctx.lineWidth = 2;

        const drawBranch = (x, y, length, angle, depth) => {
          if (depth === 0 || length < 1) return;
          const endX = x + length * Math.cos(angle);
          const endY = y + length * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          // Randomize branches
          const leftAngle = angle - (0.3 + Math.random() * 0.4);
          const rightAngle = angle + (0.3 + Math.random() * 0.4);
          drawBranch(endX, endY, length * (0.6 + Math.random() * 0.3), leftAngle, depth - 1);
          drawBranch(endX, endY, length * (0.6 + Math.random() * 0.3), rightAngle, depth - 1);
        };

        drawBranch(seedX, seedY, 100 + Math.random() * 50, -Math.PI / 2, 12);
      };

      drawFractal(canvas.width / 2, canvas.height);

      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        drawFractal(x, y);
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
  }, [selected]);

  useEffect(() => {
    if (selected === 'fractal') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.frequency.setValueAtTime(220, audioContext.currentTime); // A3
      oscillator2.frequency.setValueAtTime(330, audioContext.currentTime); // E4
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

      oscillator1.start();
      oscillator2.start();

      return () => {
        oscillator1.stop();
        oscillator2.stop();
        audioContext.close();
      };
    }
  }, [selected]);

  return (
    <div className="app">
      <header>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="fractal">Fractal Graphics</option>
        </select>
      </header>
      {selected === 'fractal' && <canvas ref={canvasRef} className="canvas" />}
    </div>
  );
}

export default App;
