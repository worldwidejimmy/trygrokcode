import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [selected, setSelected] = useState('fractal');
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;

    if (selected === 'fractal') {
      const drawFractal = (seedX, seedY) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.lineWidth = 2;

        const drawBranch = (x, y, length, angle, depth) => {
          if (depth === 0 || length < 1) return;
          const endX = x + length * Math.cos(angle);
          const endY = y + length * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
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
    } else if (selected === 'particles') {
      let particles = [];
      const createParticle = (x, y) => {
        for (let i = 0; i < 10; i++) {
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 100,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
          });
        }
      };

      const updateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1; // gravity
          p.life--;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(updateParticles);
      };

      updateParticles();
      const handleClick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createParticle(x, y);
      };
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    } else if (selected === 'visualizer') {
      const drawVisualizer = () => {
        if (!analyserRef.current) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = `hsl(${i * 360 / bufferLength}, 100%, 50%)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
        requestAnimationFrame(drawVisualizer);
      };
      drawVisualizer();
    }
  }, [selected]);

  useEffect(() => {
    if (selected === 'fractal' || selected === 'visualizer') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(analyser);
      oscillator2.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(330, audioContext.currentTime);
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
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }
    }
  }, [selected]);

  return (
    <div className="app">
      <header>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="fractal">Fractal Graphics</option>
          <option value="particles">Particle System</option>
          <option value="visualizer">Audio Visualizer</option>
        </select>
      </header>
      {selected && <canvas ref={canvasRef} className="canvas" />}
    </div>
  );
}

export default App;
