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
  const [feedbacks, setFeedbacks] = useState<{ id: string; text: string; x: number; y: number; side: string }[]>([]);

  const currentLevel = LEVELS[currentLevelIdx];

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx]);

  const initLevel = (idx: number) => {
    const level = LEVELS[idx];
    let newCoins: Coin[] = [];

    // 1. Force coins to reach the exact targetAmount
    let remaining = level.targetAmount;
    const sortedAllowed = [...level.allowedCoins].sort((a, b) => b - a);

    // Greedy-like approach to fulfill the target with standard coins
    while (remaining > 0.005) { // Small epsilon for float precision
      const coinVal = sortedAllowed.find(v => v <= Number((remaining + 0.005).toFixed(2))) || sortedAllowed[sortedAllowed.length - 1];
      newCoins.push({
        id: `coin-target-${Math.random()}`,
        value: coinVal,
        x: 0, y: 0, // Will randomize later
        side: 'debe'
      });
      remaining = Number((remaining - coinVal).toFixed(2));
    }

    // 2. Add "Noise" or "Neutral pairs" for mixed levels or to increase coin count
    const minCoins = level.id === 4 ? 8 : 6;
    while (newCoins.length < minCoins) {
      const randomVal = level.allowedCoins[Math.floor(Math.random() * level.allowedCoins.length)];
      if (level.isMixed) {
        // Add a pair that cancels out (one income, one expense)
        const pairId = Math.random();
        newCoins.push({
          id: `coin-plus-${pairId}`,
          value: randomVal,
          x: 0, y: 0,
          side: 'debe'
        });
        newCoins.push({
          id: `coin-minus-${pairId}`,
          value: randomVal,
          x: 0, y: 0,
          side: 'haber'
        });
      } else {
        // Just add more income coins if not mixed (shouldn't really happen with target fulfilled but anyway)
        newCoins.push({
          id: `coin-extra-${Math.random()}`,
          value: randomVal,
          x: 0, y: 0,
          side: 'debe'
        });
      }
    }

    // 3. Final Pass: Randomize positions and shuffle
    newCoins = newCoins.map(c => ({
      ...c,
      x: 15 + Math.random() * 70,
      y: 35 + Math.random() * 45
    })).sort(() => Math.random() - 0.5);

    setTableCoins(newCoins);
    setCurrentBalance(0);
    setMessage(level.pacoMessage);
    setPacoState('thinking');
  };

  const handleCoinClick = (coin: Coin) => {
    setTableCoins(prev => prev.filter(c => c.id !== coin.id));

    // Accounting logic: Debe increases balance, Haber decreases it
    const valueChange = coin.side === 'debe' ? coin.value : -coin.value;
    const nextBalance = Number((currentBalance + valueChange).toFixed(2));
    setCurrentBalance(nextBalance);

    // Add feedback animation
    const feedbackId = Math.random().toString();
    const feedbackText = `${coin.side === 'debe' ? '+' : '-'}${coin.value.toFixed(2)}€ (${coin.side.toUpperCase()})`;
    setFeedbacks(prev => [...prev, { id: feedbackId, text: feedbackText, x: coin.x, y: coin.y, side: coin.side }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    }, 2000);

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
      }, 5000);
    } else if (!currentLevel.isMixed) {
      // For simple levels, if you overshoot or go under, it's an error
      if (nextBalance > currentLevel.targetAmount) {
        setPacoState('error');
        setMessage('¡Cuac! Te has pasado del total. Prueba otra vez.');
        setTimeout(() => initLevel(currentLevelIdx), 4000);
      }
    } else {
      // In mixed levels, we don't error out immediately unless there are no coins left and balance isn't target
      if (tableCoins.length === 1 && nextBalance !== currentLevel.targetAmount) {
        setPacoState('error');
        setMessage('¡Cuac! El balance final no es correcto. Repasemos las cuentas.');
        setTimeout(() => initLevel(currentLevelIdx), 4000);
      }
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

      {/* Floating Feedbacks */}
      {feedbacks.map(f => (
        <div
          key={f.id}
          className={`float-feedback ${f.side}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            animation: 'floatUp 2s ease-out forwards'
          }}
        >
          {f.text}
        </div>
      ))}

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
          key={currentBalance}
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
              className={`coin-element ${coin.side}`}
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
        src="/assets/img-pato.webp"
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
