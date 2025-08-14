// AI玩家决策逻辑 - 实现三种不同策略
export const getAIDecision = (hand, playerName) => {
  // 计算手牌点数的辅助函数
  const calculateHandValue = (hand) => {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card && card.rank) {
        if (card.rank === 'A') {
          aces += 1;
          value += 11;
        } else if (['J', 'Q', 'K'].includes(card.rank)) {
          value += 10;
        } else {
          value += parseInt(card.rank);
        }
      }
    }

    // 处理A的值（1或11）
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }

    return value;
  };

  const handValue = calculateHandValue(hand);
  
  // 根据玩家名称应用不同策略
  switch (playerName) {
    case 'dealer':
      // 庄家保守策略：点数小于17要牌，大于等于17停牌
      return handValue < 17 ? 'hit' : 'stand';
      
    case 'ai':
      // AI1笨蛋策略：点数小于15要牌，大于等于15停牌
      return handValue < 15 ? 'hit' : 'stand';
      
    case 'ai2':
      // AI2激进策略：点数小于19要牌，大于等于19停牌
      return handValue < 19 ? 'hit' : 'stand';
      
    default:
      // 默认策略：点数小于17要牌，大于等于17停牌
      return handValue < 17 ? 'hit' : 'stand';
  }
};
