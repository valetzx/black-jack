// 创建一副牌
export class Deck {
  constructor(deckType = 'standard') {
    this.cards = [];
    this.createDeck(deckType);
  }

  createDeck(deckType) {
    let suits = [];
    
    switch(deckType) {
      case 'clubs':
        suits = ['♣'];
        break;
      case 'diamonds':
        suits = ['♦'];
        break;
      case 'hearts':
        suits = ['♥'];
        break;
      case 'spades':
        suits = ['♠'];
        break;
      default: // standard
        suits = ['♠', '♥', '♦', '♣'];
    }
    
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    for (let suit of suits) {
      for (let rank of ranks) {
        this.cards.push({ suit, rank });
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}

// 计算手牌点数
export const calculateHandValue = (hand) => {
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

// 发牌 - 添加安全检查
export const dealCard = (deck) => {
  if (!deck || deck.length === 0) {
    // 如果牌组为空，返回一个默认的牌
    return { suit: '♠', rank: 'A' };
  }
  
  const card = deck.pop();
  // 确保返回的牌有必要的属性
  if (!card || !card.rank || !card.suit) {
    return { suit: '♠', rank: 'A' };
  }
  
  return card;
};
