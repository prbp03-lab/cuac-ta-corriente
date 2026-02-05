import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Coin } from './logic/gameLogic';
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
        padding: '30px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        color: 'white',
        zIndex: 5
      }}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>{currentLevel.title}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{currentLevel.concept}</p>
        </motion.div>

        <motion.div
          className="balance-panel"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Actual</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{currentBalance.toFixed(2)}€</div>
          </div>
          <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Meta</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{currentLevel.targetAmount.toFixed(2)}€</div>
          </div>
        </motion.div>
      </div>

      {/* Main Table Area */}
      <div className="table-area">
        <AnimatePresence>
          {tableCoins.map(coin => (
            <motion.div
              key={coin.id}
              className="coin-element"
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, left: `${coin.x}%`, top: `${coin.y}%`, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
              onClick={() => handleCoinClick(coin)}
              style={{ position: 'absolute' }}
              whileHover={{ scale: 1.15, rotate: 15, boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}
              whileTap={{ scale: 0.9 }}
            >
              {coin.value < 1 ? `${(coin.value * 100).toFixed(0)}c` : `${coin.value}€`}
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
