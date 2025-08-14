import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const DeckSettings = ({ deckType, onDeckTypeChange, deckCount, onDeckCountChange }) => {
  const [showDeckCount, setShowDeckCount] = useState(false);

  useEffect(() => {
    if (deckType === 'diamonds') {
      setShowDeckCount(true);
    } else {
      setShowDeckCount(false);
      onDeckCountChange(1);
    }
  }, [deckType, onDeckCountChange]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>游戏设置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Label htmlFor="deck-type">牌组类型:</Label>
          <Select value={deckType} onValueChange={onDeckTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择牌组类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">标准牌组 (♣♦♥♠)</SelectItem>
              <SelectItem value="clubs">仅梅花 (♣)</SelectItem>
              <SelectItem value="diamonds">仅方块 (♦)</SelectItem>
              <SelectItem value="hearts">仅红桃 (♥)</SelectItem>
              <SelectItem value="spades">仅黑桃 (♠)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showDeckCount && (
          <div className="flex items-center space-x-4">
            <Label htmlFor="deck-count">牌组数量:</Label>
            <Input
              id="deck-count"
              type="number"
              min="1"
              max="10"
              value={deckCount}
              onChange={(e) => onDeckCountChange(parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span className="text-sm text-gray-400">设置方块牌组的数量</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeckSettings;
