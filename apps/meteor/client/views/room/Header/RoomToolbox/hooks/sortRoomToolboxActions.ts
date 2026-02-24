import type { RoomToolboxActionConfig } from '@rocket.chat/ui-contexts';

/**
 * Sorts toolbox actions by an ordered list of action IDs.
 * Actions whose id is in orderedIds appear first, in the order of orderedIds.
 * Unrecognized or third-party app IDs not in orderedIds are placed at the end (stable order).
 */
export const sortActionsByConfig = (
	actions: RoomToolboxActionConfig[],
	orderedIds: string[],
): RoomToolboxActionConfig[] => {
	if (orderedIds.length === 0) {
		return [...actions];
	}
	const orderMap = new Map<string, number>();
	orderedIds.forEach((id, index) => {
		orderMap.set(id, index);
	});
	return [...actions].sort((a, b) => {
		const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
		const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
		return indexA - indexB;
	});
};
