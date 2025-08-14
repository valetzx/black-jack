import { calculateHandValue } from '@/lib/blackjackUtils';
import { displayAllScores } from '@/lib/scoreCalculator';

export const finishGame = (setGameState, setDealerStood, playerHand, aiHand, ai2Hand, dealerHand, 
                          playerScore, aiScore, ai2Score, dealerScore,
                          setPlayerScore, setAiScore, setAi2Score, setDealerScore,
                          setMessage, setGameLog) => {
  setGameState('finished');
  setDealerStood(true);
  
  // 使用新的评分模块计算并显示所有玩家的点数
  const scores = displayAllScores(
    playerHand, aiHand, ai2Hand, dealerHand,
    setPlayerScore, setAiScore, setAi2Score, setDealerScore
  );
  
  const { playerScore: playerHandValue, aiScore: aiHandValue, ai2Score: ai2HandValue, dealerScore: dealerHandValue } = scores;
  
  // 创建玩家信息数组
  const players = [
    { name: 'player', handValue: playerHandValue, score: playerScore, newScore: playerScore },
    { name: 'ai', handValue: aiHandValue, score: aiScore, newScore: aiScore },
    { name: 'ai2', handValue: ai2HandValue, score: ai2Score, newScore: ai2Score },
    { name: 'dealer', handValue: dealerHandValue, score: dealerScore, newScore: dealerScore }
  ];
  
  // 先处理爆牌玩家（扣1分）
  players.forEach(player => {
    if (player.handValue > 21) {
      player.newScore -= 1;
    }
  });
  
  // 过滤出未爆牌的玩家用于排名
  const nonBustPlayers = players.filter(p => p.handValue <= 21);
  
  // 按手牌点数降序排列（点数相同则按名称排序保证一致性）
  nonBustPlayers.sort((a, b) => {
    if (b.handValue !== a.handValue) {
      return b.handValue - a.handValue;
    }
    return a.name.localeCompare(b.name);
  });
  
  // 根据排名分配分数
  nonBustPlayers.forEach((player, index) => {
    switch (index) {
      case 0: // 第一名
        player.newScore += 1;
        // 如果正好21点再加1分
        if (player.handValue === 21) {
          player.newScore += 1;
        }
        break;
      case 1: // 第二名
        // 不加分也不减分
        break;
      case 2: // 第三名
        player.newScore -= 1;
        break;
      case 3: // 第四名
        player.newScore -= 2;
        break;
      default:
        break;
    }
  });
  
  // 更新各玩家分数
  setPlayerScore(players.find(p => p.name === 'player').newScore);
  setAiScore(players.find(p => p.name === 'ai').newScore);
  setAi2Score(players.find(p => p.name === 'ai2').newScore);
  setDealerScore(players.find(p => p.name === 'dealer').newScore);
  
  const newMessage = '游戏结束！分数已根据排名更新。';
  setMessage(newMessage);
  setGameLog(prev => [...prev, newMessage]);
  
  // 添加排名信息到日志
  if (nonBustPlayers.length > 0) {
    const rankingMessage = `排名: ${nonBustPlayers.map((p, i) => `${i+1}.${p.name}`).join(', ')}`;
    setGameLog(prev => [...prev, rankingMessage]);
  }
};
