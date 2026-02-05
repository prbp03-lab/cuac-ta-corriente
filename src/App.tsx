import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Level, Coin } from './logic/gameLogic';
import { LEVELS } from './logic/gameLogic';
import './index.css';

const App: React.FC = () => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [tableCoins, setTableCoins] = useState<Coin[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [pacoState, setPacoState] = useState<'idle' | 'happy' | 'thinking' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentLevel = LEVELS[currentLevelIdx];

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx]);

  const initLevel = (idx: number) => {
    const level = LEVELS[idx];
    const newCoins: Coin[] = [];
    // Generate some random coins based on allowed coins for the level
    for (let i = 0; i < 8; i++) {
      const randomVal = level.allowedCoins[Math.floor(Math.random() * level.allowedCoins.length)];
      newCoins.push({
        id: `coin-${i}-${Math.random()}`,
        value: randomVal,
        x: 40 + Math.random() * 40, // 40-80% width
        y: 40 + Math.random() * 30  // 40-70% height
      });
    }
    setTableCoins(newCoins);
    setCurrentBalance(0);
    setMessage(level.pacoMessage);
    setPacoState('thinking');
  };

  const handleCoinClick = (coin: Coin) => {
    setTableCoins(prev => prev.filter(c => c.id !== coin.id));
    const nextBalance = Number((currentBalance + coin.value).toFixed(2));
    setCurrentBalance(nextBalance);

    if (nextBalance === currentLevel.targetAmount) {
      setPacoState('happy');
      setMessage('¡Exacto! ¡Excelente trabajo contable!');
      confetti();
      setTimeout(() => {
        if (currentLevelIdx < LEVELS.length - 1) {
          setCurrentLevelIdx(prev => prev + 1);
        } else {
          setMessage('¡Has completado todos los niveles! ¡Eres un experto en Cuac-ta Corriente!');
        }
      }, 3000);
    } else if (nextBalance > currentLevel.targetAmount) {
      setPacoState('error');
      setMessage('¡Cuac! Eso es demasiado. Prueba otra vez.');
      setTimeout(() => initLevel(currentLevelIdx), 2000);
    }
  };

  return (
    <div className="game-container">
      {/* Background with overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8
        }}
      />

      {/* UI Header */}
      <div style={{
        position: 'relative',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        zIndex: 5
      }}>
        <div>
          <h1>{currentLevel.title}</h1>
          <p>{currentLevel.concept}</p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '30px',
          fontSize: '24px',
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          Saldo: {currentBalance.toFixed(2)}€ / {currentLevel.targetAmount.toFixed(2)}€
        </div>
      </div>

      {/* Main Table Area */}
      <div className="table-area" style={{ flex: 1, position: 'relative' }}>
        <AnimatePresence>
          {tableCoins.map(coin => (
            <motion.div
              key={coin.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, left: `${coin.x}%`, top: `${coin.y}%` }}
              exit={{ scale: 0, y: 100, opacity: 0 }}
              onClick={() => handleCoinClick(coin)}
              style={{
                position: 'absolute',
                cursor: 'pointer',
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, #FFD700 0%, #B8860B 100%)',
                borderRadius: '50%',
                border: '2px solid #DAA520',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#4B3621',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              {coin.value}€
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Paco and Speech Bubble */}
      <motion.img
        src="/assets/paco.png"
        className="paco-duck"
        animate={{
          y: pacoState === 'happy' ? [0, -20, 0] : 0,
          rotate: pacoState === 'error' ? [0, -5, 5, -5, 5, 0] : 0
        }}
        transition={{ repeat: pacoState === 'happy' ? Infinity : 0, duration: 0.5 }}
      />

      <AnimatePresence>
        {message && (
          <motion.div
            className="speech-bubble"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
