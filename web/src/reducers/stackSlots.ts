import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { getTargetInventory } from '../helpers';
import { Inventory, InventoryType, SlotWithItem, State } from '../typings';

const calculateStackAmount = (requested: number, current: number, stack?: number | boolean | null): number | false => {
  if (stack === false) return false;
  if (stack === true || stack == null) return requested;
  return Math.max(0, Math.min(requested, stack - current));
};

export const stackSlotsReducer: CaseReducer<
  State,
  PayloadAction<{
    fromSlot: SlotWithItem;
    fromType: Inventory['type'];
    toSlot: SlotWithItem;
    toType: Inventory['type'];
    count: number;
  }>
> = (state, action) => {
  const { fromSlot, fromType, toSlot, toType, count } = action.payload;

  const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType);

  const pieceWeight = fromSlot.weight / fromSlot.count;

  const stackAmount = calculateStackAmount(count, toSlot.count, toSlot.stack);
  if (!stackAmount) return;

  targetInventory.items[toSlot.slot - 1] = {
    ...targetInventory.items[toSlot.slot - 1],
    count: toSlot.count + stackAmount,
    weight: pieceWeight * (toSlot.count + stackAmount),
  };

  if (fromType === InventoryType.SHOP || fromType === InventoryType.CRAFTING) return;

  const remaining = fromSlot.count - stackAmount;
  sourceInventory.items[fromSlot.slot - 1] =
    remaining > 0
      ? { ...fromSlot, count: remaining, weight: pieceWeight * remaining }
      : { slot: fromSlot.slot };
};
