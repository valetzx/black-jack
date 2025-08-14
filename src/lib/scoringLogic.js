import { calculateHandValue } from '@/lib/blackjackUtils';

export const calculateScores = (playerHand, aiHand, ai2Hand, dealerHand) => {
  return {
    playerScore: calculateHandValue(playerHand),
    aiScore: calculateHandValue(aiHand),
    ai2Score: calculateHandValue(ai2Hand),
    dealerScore: calculateHandValue(dealerHand)
  };
};

export const determineWinner = (playerScore, aiScore, ai2Score, dealerScore, playerStood, aiStood, ai2Stood, dealerStood) => {
  // 简化的获胜逻辑
  const scores = [
    { name: 'player', score: playerScore, stood: playerStood },
    { name: 'ai', score: aiScore, stood: aiStood },
    { name: 'ai2', score: ai2Score, stood: ai2Stood },
    { name: 'dealer', score: dealerScore, stood: dealerStood }
  ];
  
  // 过滤出没有爆牌且停牌的玩家
  const validPlayers = scores.filter(p => p.score <= 21 && p.stood);
  
  if (validPlayers.length === 0) {
    return null; // 没有获胜者
  }
  
  // 找到分数最高的玩家
  const winner = validPlayers.reduce((prev, current) => 
    (prev.score > current.score) ? prev : current
  );
  
  return winner.name;
};
