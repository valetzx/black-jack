import { calculateHandValue } from '@/lib/blackjackUtils';

/**
 * 计算所有玩家手牌的总点数
 * @param {Array} playerHand - 玩家手牌
 * @param {Array} aiHand - AI玩家手牌
 * @param {Array} ai2Hand - AI玩家2手牌
 * @param {Array} dealerHand - 庄家手牌
 * @returns {Object} 包含所有玩家点数的对象
 */
export const calculateAllScores = (playerHand, aiHand, ai2Hand, dealerHand) => {
  return {
    playerScore: calculateHandValue(playerHand),
    aiScore: calculateHandValue(aiHand),
    ai2Score: calculateHandValue(ai2Hand),
    dealerScore: calculateHandValue(dealerHand)
  };
};

/**
 * 在游戏结束时显示所有玩家的点数（包括AI玩家）
 * @param {Array} playerHand - 玩家手牌
 * @param {Array} aiHand - AI玩家手牌
 * @param {Array} ai2Hand - AI玩家2手牌
 * @param {Array} dealerHand - 庄家手牌
 * @param {Function} setPlayerScore - 设置玩家分数的函数
 * @param {Function} setAiScore - 设置AI玩家分数的函数
 * @param {Function} setAi2Score - 设置AI玩家2分数的函数
 * @param {Function} setDealerScore - 设置庄家分数的函数
 */
export const displayAllScores = (
  playerHand,
  aiHand,
  ai2Hand,
  dealerHand,
  setPlayerScore,
  setAiScore,
  setAi2Score,
  setDealerScore
) => {
  const scores = calculateAllScores(playerHand, aiHand, ai2Hand, dealerHand);
  
  setPlayerScore(scores.playerScore);
  setAiScore(scores.aiScore);
  setAi2Score(scores.ai2Score);
  setDealerScore(scores.dealerScore);
  
  return scores;
};
