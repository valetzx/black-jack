import { Deck } from '@/lib/blackjackUtils';

export const initializeDeck = (deckType, deckCount = 1) => {
  let cards = [];
  
  // 创建指定数量的牌组
  for (let i = 0; i < deckCount; i++) {
    const newDeck = new Deck(deckType);
    cards = [...cards, ...newDeck.cards];
  }
  
  // 洗牌
  const deck = { cards };
  deck.shuffle = () => {
    for (let i = deck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }
  };
  
  deck.shuffle();
  return deck.cards;
};
