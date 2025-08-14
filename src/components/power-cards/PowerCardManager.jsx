import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Shuffle, RotateCcw, Minus } from 'lucide-react';

const PowerCardManager = ({ 
  playerHand, 
  setPlayerHand,
  aiHand,
  setAiHand,
  ai2Hand,
  setAi2Hand,
  dealerHand,
  setDealerHand,
  playerScore,
  setPlayerScore,
  setMessage,
  setGameLog
}) => {
  // 功能牌类型定义
  const powerCards = [
    {
      id: 'shield',
      name: '盾牌',
      description: '免除一次扣分',
      type: 'self',
      icon: Shield,
      effect: (target, setTargetScore) => {
        // 盾牌效果：免除一次扣分，这里简化处理为增加1分
        setTargetScore(prev => prev + 1);
      }
    },
    {
      id: 'swap',
      name: '交换',
      description: '与指定玩家交换最新一张牌',
      type: 'target',
      icon: Shuffle,
      effect: (target, setTargetHand, source, setSourceHand) => {
        // 交换最新一张牌
        if (target.length > 0 && source.length > 0) {
          const newTargetHand = [...target];
          const newSourceHand = [...source];
          
          // 交换最后一张牌
          const temp = newTargetHand[newTargetHand.length - 1];
          newTargetHand[newTargetHand.length - 1] = newSourceHand[newSourceHand.length - 1];
          newSourceHand[newSourceHand.length - 1] = temp;
          
          setTargetHand(newTargetHand);
          setSourceHand(newSourceHand);
        }
      }
    },
    {
      id: 'withdraw',
      name: '撤回',
      description: '撤回最新一张手牌',
      type: 'self-target',
      icon: RotateCcw,
      effect: (target, setTargetHand) => {
        // 撤回最新一张牌
        if (target.length > 0) {
          const newHand = [...target];
          newHand.pop();
          setTargetHand(newHand);
        }
      }
    },
    {
      id: 'extra-penalty',
      name: '额外扣分',
      description: '全场爆牌额外扣1分',
      type: 'global',
      icon: Minus,
      effect: (players, setPlayerScores) => {
        // 全场有效：给所有玩家增加额外扣分标记
        // 这里简化处理为给所有玩家减1分
        Object.keys(setPlayerScores).forEach(playerKey => {
          setPlayerScores[playerKey](prev => prev - 1);
        });
      }
    }
  ];

  const [selectedCard, setSelectedCard] = useState(null);
  const [targetPlayer, setTargetPlayer] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUsePowerCard = () => {
    if (!selectedCard) return;

    const card = powerCards.find(c => c.id === selectedCard);
    if (!card) return;

    switch (card.type) {
      case 'self':
        // 给自己使用
        card.effect(playerHand, setPlayerHand, playerScore, setPlayerScore);
        break;
      case 'target':
        // 指定玩家使用
        if (!targetPlayer) return;
        switch (targetPlayer) {
          case 'ai':
            card.effect(aiHand, setAiHand, playerHand, setPlayerHand);
            break;
          case 'ai2':
            card.effect(ai2Hand, setAi2Hand, playerHand, setPlayerHand);
            break;
          case 'dealer':
            card.effect(dealerHand, setDealerHand, playerHand, setPlayerHand);
            break;
        }
        break;
      case 'self-target':
        // 可以给自己或指定玩家使用
        if (!targetPlayer) return;
        switch (targetPlayer) {
          case 'player':
            card.effect(playerHand, setPlayerHand);
            break;
          case 'ai':
            card.effect(aiHand, setAiHand);
            break;
          case 'ai2':
            card.effect(ai2Hand, setAi2Hand);
            break;
          case 'dealer':
            card.effect(dealerHand, setDealerHand);
            break;
        }
        break;
      case 'global':
        // 全场有效
        card.effect(
          { player: playerHand, ai: aiHand, ai2: ai2Hand, dealer: dealerHand },
          { 
            setPlayerScore, 
            setAiScore: () => {}, 
            setAi2Score: () => {}, 
            setDealerScore: () => {} 
          }
        );
        break;
    }

    const message = `你使用了功能牌: ${card.name}`;
    setMessage(message);
    setGameLog(prev => [...prev, message]);
    setIsDialogOpen(false);
    setSelectedCard(null);
    setTargetPlayer('');
  };

  return (
    <div className="mb-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white">
            使用功能牌
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-green-700 border-green-900">
          <DialogHeader>
            <DialogTitle className="text-yellow-300">选择功能牌</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            {powerCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card 
                  key={card.id}
                  className={`cursor-pointer hover:bg-green-600 transition-colors ${
                    selectedCard === card.id ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  onClick={() => setSelectedCard(card.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <IconComponent className="mr-2 h-4 w-4" />
                      {card.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-300">{card.description}</p>
                    <p className="text-xs mt-1">
                      <span className="font-semibold">类型:</span> 
                      {card.type === 'self' && ' 给自己使用'}
                      {card.type === 'target' && ' 指定玩家使用'}
                      {card.type === 'self-target' && ' 给自己或指定玩家使用'}
                      {card.type === 'global' && ' 全场有效'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedCard && (
            <div className="mt-4">
              <Select value={targetPlayer} onValueChange={setTargetPlayer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择目标玩家" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">你自己</SelectItem>
                  <SelectItem value="ai">AI玩家 (西)</SelectItem>
                  <SelectItem value="ai2">AI玩家2 (东)</SelectItem>
                  <SelectItem value="dealer">庄家 (北)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="mt-4 w-full" 
                onClick={handleUsePowerCard}
                disabled={!targetPlayer && powerCards.find(c => c.id === selectedCard)?.type !== 'global'}
              >
                使用功能牌
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerCardManager;
