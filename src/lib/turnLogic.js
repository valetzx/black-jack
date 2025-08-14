import { dealCard } from '@/lib/blackjackUtils';
import { getAIDecision } from '@/lib/aiPlayerLogic';

export const moveToNextPlayer = (currentPlayer) => {
  const playerOrder = ['dealer', 'ai2', 'player', 'ai'];
  const currentIndex = playerOrder.indexOf(currentPlayer);
  const nextIndex = (currentIndex + 1) % playerOrder.length;
  return playerOrder[nextIndex];
};

export const handleDealerTurn = async (dealerHand, setDealerHand, setDealerStood, setMessage, setGameLog) => {
  const decision = getAIDecision(dealerHand, 'dealer');
  
  if (decision === 'hit') {
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { action: 'hit' };
  } else {
    setDealerStood(true);
    const newMessage = '庄家选择停牌';
    setMessage(newMessage);
    setGameLog(prev => [...prev, newMessage]);
    return { action: 'stand' };
  }
};

export const handleAI2Turn = async (ai2Hand, setAi2Hand, setAi2Stood, setMessage, setGameLog) => {
  const decision = getAIDecision(ai2Hand, 'ai2');
  
  if (decision === 'hit') {
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { action: 'hit' };
  } else {
    setAi2Stood(true);
    const newMessage = 'AI玩家2选择停牌';
    setMessage(newMessage);
    setGameLog(prev => [...prev, newMessage]);
    return { action: 'stand' };
  }
};

export const handleAITurn = async (aiHand, setAiHand, setAiStood, setMessage, setGameLog) => {
  const decision = getAIDecision(aiHand, 'ai');
  
  if (decision === 'hit') {
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { action: 'hit' };
  } else {
    setAiStood(true);
    const newMessage = 'AI玩家选择停牌';
    setMessage(newMessage);
    setGameLog(prev => [...prev, newMessage]);
    return { action: 'stand' };
  }
};

export const handlePlayerHit = (deck, setDeck, playerHand, setPlayerHand, setMessage, setGameLog) => {
  const newDeck = [...deck];
  const card = dealCard(newDeck);
  
  // 确保卡牌有效
  if (card && card.rank && card.suit) {
    setDeck(newDeck);
    setPlayerHand(prev => [...prev, card]);
    const playerMessage = '你选择要牌';
    setMessage(playerMessage);
    setGameLog(prev => [...prev, playerMessage]);
  }
};

export const handleAIHit = (deck, setDeck, aiHand, setAiHand, setMessage, setGameLog) => {
  const newDeck = [...deck];
  const card = dealCard(newDeck);
  
  // 确保卡牌有效
  if (card && card.rank && card.suit) {
    setDeck(newDeck);
    setAiHand(prev => [...prev, card]);
    const aiMessage = 'AI玩家要了一张牌';
    setMessage(aiMessage);
    setGameLog(prev => [...prev, aiMessage]);
  }
};

export const handleAI2Hit = (deck, setDeck, ai2Hand, setAi2Hand, setMessage, setGameLog) => {
  const newDeck = [...deck];
  const card = dealCard(newDeck);
  
  // 确保卡牌有效
  if (card && card.rank && card.suit) {
    setDeck(newDeck);
    setAi2Hand(prev => [...prev, card]);
    const ai2Message = 'AI玩家2要了一张牌';
    setMessage(ai2Message);
    setGameLog(prev => [...prev, ai2Message]);
  }
};

export const handleDealerHit = (deck, setDeck, dealerHand, setDealerHand, setMessage, setGameLog) => {
  const newDeck = [...deck];
  const card = dealCard(newDeck);
  
  // 确保卡牌有效
  if (card && card.rank && card.suit) {
    setDeck(newDeck);
    setDealerHand(prev => [...prev, card]);
    const dealerMessage = '庄家要了一张牌';
    setMessage(dealerMessage);
    setGameLog(prev => [...prev, dealerMessage]);
  }
};
