import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { dealCard } from '@/lib/blackjackUtils';
import DeckSettings from '@/components/DeckSettings';
import PowerCardManager from '@/components/power-cards/PowerCardManager';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeDeck } from '@/lib/initializeDeck';
import { moveToNextPlayer, handleDealerTurn, handleAI2Turn, handleAITurn, 
         handlePlayerHit, handleAIHit, handleAI2Hit, handleDealerHit } from '@/lib/turnLogic';
import { finishGame } from '@/lib/settlementLogic';
import { displayAllScores } from '@/lib/scoreCalculator';

const BlackjackGame = () => {
  const [deck, setDeck] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playing, finished
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [ai2Hand, setAi2Hand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerScore, setPlayerScore] = useState(10); // 初始分数改为10分
  const [aiScore, setAiScore] = useState(10);
  const [ai2Score, setAi2Score] = useState(10);
  const [dealerScore, setDealerScore] = useState(10);
  const [message, setMessage] = useState('欢迎来到21点游戏！请下注开始游戏。');
  const [playerStood, setPlayerStood] = useState(false);
  const [aiStood, setAiStood] = useState(false);
  const [ai2Stood, setAi2Stood] = useState(false);
  const [dealerStood, setDealerStood] = useState(false);
  const [deckType, setDeckType] = useState('standard');
  const [deckCount, setDeckCount] = useState(1);
  const [gameLog, setGameLog] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null); // 'dealer', 'ai2', 'player', 'ai'
  const [isProcessingTurn, setIsProcessingTurn] = useState(false); // 防止重复处理
  const [showGameLog, setShowGameLog] = useState(true); // 控制游戏日志显示
  const [gameOver, setGameOver] = useState(false); // 新增游戏结束状态
  const logEndRef = useRef(null);

  // 初始化牌组
  useEffect(() => {
    const newDeck = initializeDeck(deckType, deckCount);
    setDeck(newDeck);
  }, [deckType, deckCount]);

  // 滚动到最新的日志
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLog]);

  // 检查游戏是否结束（有人分数低于0）
  useEffect(() => {
    if (gameState === 'playing' && 
        (playerScore < 0 || aiScore < 0 || ai2Score < 0 || dealerScore < 0)) {
      setGameOver(true);
      setGameState('finished');
      const endMessage = '游戏结束！有玩家分数低于0分。';
      setMessage(endMessage);
      setGameLog(prev => [...prev, endMessage]);
    }
  }, [playerScore, aiScore, ai2Score, dealerScore, gameState]);

  // 游戏开始时设置第一个玩家
  useEffect(() => {
    if (gameState === 'playing' && currentPlayer === null) {
      setCurrentPlayer('dealer');
    }
  }, [gameState, currentPlayer]);

  // 检查是否所有玩家都停牌，如果是则结束游戏
  useEffect(() => {
    if (gameState === 'playing' && 
        playerStood && 
        aiStood && 
        ai2Stood && 
        dealerStood) {
      finishGame(setGameState, setDealerStood, playerHand, aiHand, ai2Hand, dealerHand,
                 playerScore, aiScore, ai2Score, dealerScore,
                 setPlayerScore, setAiScore, setAi2Score, setDealerScore,
                 setMessage, setGameLog);
    }
  }, [playerStood, aiStood, ai2Stood, dealerStood, gameState]);

  // 轮流要牌逻辑
  useEffect(() => {
    if (gameState !== 'playing' || currentPlayer === null || isProcessingTurn || gameOver) return;

    // 检查当前玩家是否已经停牌
    const isCurrentPlayerStood = 
      (currentPlayer === 'dealer' && dealerStood) ||
      (currentPlayer === 'ai2' && ai2Stood) ||
      (currentPlayer === 'player' && playerStood) ||
      (currentPlayer === 'ai' && aiStood);

    if (isCurrentPlayerStood) {
      // 移动到下一个玩家
      const nextPlayer = moveToNextPlayer(currentPlayer);
      setCurrentPlayer(nextPlayer);
      return;
    }

    // 设置正在处理标志
    setIsProcessingTurn(true);

    // 根据玩家类型执行要牌或停牌逻辑
    const processTurn = async () => {
      try {
        let result;
        switch (currentPlayer) {
          case 'dealer':
            result = await handleDealerTurn(dealerHand, setDealerHand, setDealerStood, setMessage, setGameLog);
            if (result.action === 'hit') {
              handleDealerHit(deck, setDeck, dealerHand, setDealerHand, setMessage, setGameLog);
            }
            break;
          case 'ai2':
            result = await handleAI2Turn(ai2Hand, setAi2Hand, setAi2Stood, setMessage, setGameLog);
            if (result.action === 'hit') {
              handleAI2Hit(deck, setDeck, ai2Hand, setAi2Hand, setMessage, setGameLog);
            }
            break;
          case 'player':
            // 玩家手动操作，不需要自动处理
            setIsProcessingTurn(false);
            return;
          case 'ai':
            result = await handleAITurn(aiHand, setAiHand, setAiStood, setMessage, setGameLog);
            if (result.action === 'hit') {
              handleAIHit(deck, setDeck, aiHand, setAiHand, setMessage, setGameLog);
            }
            break;
        }

        // 延迟后移动到下一个玩家
        setTimeout(() => {
          const nextPlayer = moveToNextPlayer(currentPlayer);
          setCurrentPlayer(nextPlayer);
          setIsProcessingTurn(false);
        }, 1000);
      } catch (error) {
        console.error('处理回合时出错:', error);
        setIsProcessingTurn(false);
      }
    };

    processTurn();
  }, [currentPlayer, gameState, dealerStood, ai2Stood, playerStood, aiStood, isProcessingTurn, gameOver]);

  const startGame = () => {
    if (deck.length < 20) { // 增加牌数检查，确保有足够的牌发初始手牌
      // 重新洗牌
      const newDeck = initializeDeck(deckType, deckCount);
      setDeck(newDeck);
    }

    // 发初始牌 - 每个玩家1张数字牌和2张功能牌
    const newPlayerHand = [dealCard(deck)];
    const newAiHand = [dealCard(deck)];
    const newAi2Hand = [dealCard(deck)];
    const newDealerHand = [dealCard(deck)];
    
    setPlayerHand(newPlayerHand);
    setAiHand(newAiHand);
    setAi2Hand(newAi2Hand);
    setDealerHand(newDealerHand);
    setPlayerStood(false);
    setAiStood(false);
    setAi2Stood(false);
    setDealerStood(false);
    setGameState('playing');
    setCurrentPlayer('dealer');
    setIsProcessingTurn(false); // 重置处理标志
    setGameOver(false); // 重置游戏结束状态
    const newMessage = '游戏开始！按顺序轮流选择要牌或停牌。';
    setMessage(newMessage);
    setGameLog([newMessage]);
  };

  const handleHit = (playerType) => {
    if (gameState !== 'playing' || gameOver) return;

    switch (playerType) {
      case 'player':
        handlePlayerHit(deck, setDeck, playerHand, setPlayerHand, setMessage, setGameLog);
        // 玩家要牌后额外获得一张功能牌，确保使用最新的牌堆
        setDeck(prevDeck => {
          if (prevDeck.length > 0) {
            const newDeck = [...prevDeck];
            const powerCard = dealCard(newDeck);
            setPlayerHand(prev => [...prev, powerCard]);
            setGameLog(prev => [...prev, '你获得了一张功能牌']);
            return newDeck;
          }
          return prevDeck;
        });
        // 玩家要牌后移动到下一个玩家
        setTimeout(() => {
          const nextPlayer = moveToNextPlayer(currentPlayer);
          setCurrentPlayer(nextPlayer);
        }, 1000);
        break;
      case 'ai':
        handleAIHit(deck, setDeck, aiHand, setAiHand, setMessage, setGameLog);
        // AI要牌后额外获得一张功能牌，确保使用最新的牌堆
        setDeck(prevDeck => {
          if (prevDeck.length > 0) {
            const newDeck = [...prevDeck];
            const powerCard = dealCard(newDeck);
            setAiHand(prev => [...prev, powerCard]);
            setGameLog(prev => [...prev, 'AI玩家获得了一张功能牌']);
            return newDeck;
          }
          return prevDeck;
        });
        // AI要牌后立即移动到下一个玩家
        setTimeout(() => {
          const nextPlayer = moveToNextPlayer(currentPlayer);
          setCurrentPlayer(nextPlayer);
        }, 1000);
        break;
      case 'ai2':
        handleAI2Hit(deck, setDeck, ai2Hand, setAi2Hand, setMessage, setGameLog);
        // AI2要牌后额外获得一张功能牌，确保使用最新的牌堆
        setDeck(prevDeck => {
          if (prevDeck.length > 0) {
            const newDeck = [...prevDeck];
            const powerCard = dealCard(newDeck);
            setAi2Hand(prev => [...prev, powerCard]);
            setGameLog(prev => [...prev, 'AI玩家2获得了一张功能牌']);
            return newDeck;
          }
          return prevDeck;
        });
        // AI2要牌后立即移动到下一个玩家
        setTimeout(() => {
          const nextPlayer = moveToNextPlayer(currentPlayer);
          setCurrentPlayer(nextPlayer);
        }, 1000);
        break;
      case 'dealer':
        handleDealerHit(deck, setDeck, dealerHand, setDealerHand, setMessage, setGameLog);
        // 庄家要牌后额外获得一张功能牌，确保使用最新的牌堆
        setDeck(prevDeck => {
          if (prevDeck.length > 0) {
            const newDeck = [...prevDeck];
            const powerCard = dealCard(newDeck);
            setDealerHand(prev => [...prev, powerCard]);
            setGameLog(prev => [...prev, '庄家获得了一张功能牌']);
            return newDeck;
          }
          return prevDeck;
        });
        // 庄家要牌后立即移动到下一个玩家
        setTimeout(() => {
          const nextPlayer = moveToNextPlayer(currentPlayer);
          setCurrentPlayer(nextPlayer);
        }, 1000);
        break;
    }
  };

  const handleStand = () => {
    if (currentPlayer !== 'player' || gameOver) return;
    
    setPlayerStood(true);
    const newMessage = '你选择停牌';
    setMessage(newMessage);
    setGameLog(prev => [...prev, newMessage]);
    
    // 停牌后移动到下一个玩家
    setTimeout(() => {
      const nextPlayer = moveToNextPlayer(currentPlayer);
      setCurrentPlayer(nextPlayer);
    }, 500);
  };

  const resetGame = () => {
    // 重置游戏但保持玩家分数
    setGameState('betting');
    setPlayerHand([]);
    setAiHand([]);
    setAi2Hand([]);
    setDealerHand([]);
    setPlayerStood(false);
    setAiStood(false);
    setAi2Stood(false);
    setDealerStood(false);
    setCurrentPlayer(null);
    setIsProcessingTurn(false);
    setGameOver(false);
    const newMessage = '请开始新游戏。';
    setMessage(newMessage);
    setGameLog([newMessage]);
  };

  // 渲染手牌的函数 - 横向叠放显示
  const renderHand = (hand = [], playerType, showAllCards = false) => {
    // 确保 hand 是数组类型
    if (!Array.isArray(hand)) {
      console.warn('renderHand: hand is not an array', hand);
      return <div className="relative h-24 w-full"></div>;
    }
    
    // 过滤掉无效的卡牌，确保每张卡都有必要的属性
    const validHand = hand.filter(card => card && card.rank && card.suit);
    
    return (
      <div className="relative h-24 w-full">
        {validHand.map((card, index) => {
          // 计算叠放位置
          const offset = index * 16;
          
          // 对于AI和庄家，除了第一张牌外，其他牌都显示为牌背
          if ((playerType === 'ai' || playerType === 'ai2' || playerType === 'dealer') && !showAllCards) {
            return (
              <motion.div 
                key={index} 
                className="absolute w-16 h-24 bg-blue-600 rounded-md flex items-center justify-center border-2 border-gray-300 shadow-lg"
                style={{ 
                  left: `${offset}px`, 
                  zIndex: index
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-white text-3xl">🂠</div>
                {/* 显示牌面数字在左上角 */}
                <div className="absolute top-1 left-1 text-white font-bold text-xs">
                  {card.rank}
                </div>
              </motion.div>
            );
          }
          
          // 对于玩家或需要显示所有牌的情况，隐藏牌面内容
          if (!showAllCards) {
            return (
              <motion.div 
                key={index} 
                className="absolute w-16 h-24 bg-blue-600 rounded-md flex items-center justify-center border-2 border-gray-300 shadow-lg"
                style={{ 
                  left: `${offset}px`, 
                  zIndex: index
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-white text-3xl">🂠</div>
                {/* 显示牌面数字在左上角 */}
                <div className="absolute top-1 left-1 text-white font-bold text-xs">
                  {card.rank}
                </div>
              </motion.div>
            );
          }
          
          // 显示实际的牌面
          return (
            <motion.div 
              key={index} 
              className="absolute w-16 h-24 bg-white rounded-md flex flex-col items-center justify-center border-2 border-gray-300 shadow-lg"
              style={{ 
                left: `${offset}px`, 
                zIndex: index
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-1 left-1 text-black font-bold text-xs">
                {card.rank}
              </div>
              <div className="text-xl">{card.suit}</div>
              <div className="absolute bottom-1 right-1 text-black font-bold text-xs rotate-180">
                {card.rank}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-800 py-4 px-2 flex">
      {/* 左侧信息栏 - 可开关的游戏日志 */}
      {showGameLog && (
        <div className="w-1/4 pr-2">
          <Card className="bg-green-700 border-green-900 shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-center text-yellow-300">
                游戏日志
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowGameLog(false)}
                className="text-white hover:bg-green-600"
              >
                关闭
              </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <div className="bg-green-900 rounded-lg p-2 h-full overflow-y-auto">
                <ul className="space-y-1">
                  <AnimatePresence>
                    {gameLog.map((log, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-white text-xs"
                      >
                        {log}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  <div ref={logEndRef} />
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主游戏区域 */}
      <div className={showGameLog ? "w-3/4" : "w-full"}>
        <Card className="bg-green-700 border-green-900 shadow-2xl h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-center text-yellow-300">
                21点游戏
              </CardTitle>
              {!showGameLog && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowGameLog(true)}
                  className="text-white hover:bg-green-600"
                >
                  显示日志
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {/* 游戏信息 */}
            <div className="mb-4 text-center">
              <p className="text-lg text-white mb-1">{message}</p>
              {gameState === 'playing' && !gameOver && (
                <p className="text-base text-yellow-200">
                  当前回合: {
                    currentPlayer === 'dealer' ? '庄家 (北)' :
                    currentPlayer === 'ai2' ? 'AI玩家2 (东)' :
                    currentPlayer === 'player' ? '你 (南)' :
                    currentPlayer === 'ai' ? 'AI玩家 (西)' : ''
                  }
                </p>
              )}
              {/* 显示玩家分数 */}
              <div className="flex justify-center space-x-4 mt-2">
                <div className="text-white">你的分数: <span className={playerScore < 0 ? "text-red-500" : ""}>{playerScore}</span></div>
                <div className="text-white">AI1分数: <span className={aiScore < 0 ? "text-red-500" : ""}>{aiScore}</span></div>
                <div className="text-white">AI2分数: <span className={ai2Score < 0 ? "text-red-500" : ""}>{ai2Score}</span></div>
                <div className="text-white">庄家分数: <span className={dealerScore < 0 ? "text-red-500" : ""}>{dealerScore}</span></div>
              </div>
            </div>

            {/* 游戏桌布局 - 撑满剩余空间 */}
            <div className="flex-grow relative bg-green-600 rounded-xl border-4 border-yellow-700 mb-4 overflow-hidden">
              {/* 背面牌堆 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-24 bg-blue-600 rounded-md flex items-center justify-center border-2 border-gray-300 shadow-lg">
                  <div className="text-white text-3xl">🂠</div>
                </div>
              </div>

              {/* 北 - 庄家区域 */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-48">
                <h2 className={`text-base font-bold mb-1 text-center ${
                  currentPlayer === 'dealer' && gameState === 'playing' 
                    ? 'text-yellow-300' 
                    : 'text-white'
                }`}>
                  庄家 (北)
                </h2>
                <div className="flex justify-center">
                  {renderHand(dealerHand, 'dealer', gameState === 'finished')}
                </div>
                <div className="text-white text-base mt-1 text-center">
                  分数: {dealerScore}
                </div>
              </div>

              {/* 东 - AI玩家2区域 */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-36">
                <h2 className={`text-base font-bold mb-1 ${
                  currentPlayer === 'ai2' && gameState === 'playing' 
                    ? 'text-yellow-300' 
                    : 'text-white'
                }`}>
                  AI玩家2 (东)
                </h2>
                <div className="flex justify-center">
                  {renderHand(ai2Hand, 'ai2', gameState === 'finished')}
                </div>
                <div className="text-white text-base mt-1">
                  分数: {ai2Score}
                </div>
              </div>

              {/* 南 - 玩家区域 */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-48">
                {/* 玩家控制按钮放在玩家区域手牌上方 */}
                {gameState === 'playing' && currentPlayer === 'player' && !playerStood && !gameOver && (
                  <div className="flex justify-center space-x-2 mb-2">
                    <Button
                      onClick={() => handleHit('player')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 text-sm"
                      disabled={playerStood}
                    >
                      要牌
                    </Button>
                    <Button
                      onClick={handleStand}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm"
                      disabled={playerStood}
                    >
                      停牌
                    </Button>
                    <PowerCardManager
                      playerHand={playerHand}
                      setPlayerHand={setPlayerHand}
                      aiHand={aiHand}
                      setAiHand={setAiHand}
                      ai2Hand={ai2Hand}
                      setAi2Hand={setAi2Hand}
                      dealerHand={dealerHand}
                      setDealerHand={setDealerHand}
                      playerScore={playerScore}
                      setPlayerScore={setPlayerScore}
                      setMessage={setMessage}
                      setGameLog={setGameLog}
                    />
                  </div>
                )}

                <h2 className={`text-base font-bold mb-1 text-center ${
                  currentPlayer === 'player' && gameState === 'playing'
                    ? 'text-yellow-300'
                    : 'text-white'
                }`}>
                  你的手牌 (南)
                </h2>
                
                <div className="flex justify-center">
                  {renderHand(playerHand, 'player', true)}
                </div>
                <div className="text-white text-base mt-1 text-center">
                  分数: {playerScore}
                </div>
              </div>

              {/* 西 - AI玩家区域 */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-36">
                <h2 className={`text-base font-bold mb-1 ${
                  currentPlayer === 'ai' && gameState === 'playing' 
                    ? 'text-yellow-300' 
                    : 'text-white'
                }`}>
                  AI玩家 (西)
                </h2>
                <div className="flex justify-center">
                  {renderHand(aiHand, 'ai', gameState === 'finished')}
                </div>
                <div className="text-white text-base mt-1">
                  分数: {aiScore}
                </div>
              </div>
            </div>

            {/* 控制按钮 - 仅保留开始游戏和设置按钮 */}
            <div className="flex justify-center space-x-3">
              {gameState === 'betting' && (
                <>
                  <Button 
                    onClick={startGame} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 text-base"
                  >
                    开始游戏
                  </Button>
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 text-base"
                      >
                        设置
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-green-700 border-green-900">
                      <DialogHeader>
                        <DialogTitle className="text-yellow-300">游戏设置</DialogTitle>
                      </DialogHeader>
                      <DeckSettings 
                        deckType={deckType} 
                        onDeckTypeChange={setDeckType}
                        deckCount={deckCount}
                        onDeckCountChange={setDeckCount}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              {gameState === 'finished' && (
                <Button 
                  onClick={resetGame} 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 text-base"
                >
                  {gameOver ? '重新开始' : '再来一局'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlackjackGame;
