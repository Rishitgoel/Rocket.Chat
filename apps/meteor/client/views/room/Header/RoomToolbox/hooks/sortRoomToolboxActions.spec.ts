import type { RoomToolboxActionConfig } from '@rocket.chat/ui-contexts';

import { sortActionsByConfig } from './sortRoomToolboxActions';

describe('sortActionsByConfig', () => {
	it('should return a copy of actions when orderedIds is empty', () => {
		const actions: RoomToolboxActionConfig[] = [
			{ id: 'a', title: 'A', groups: ['channel'], icon: 'info' },
			{ id: 'b', title: 'B', groups: ['channel'], icon: 'thread' },
		];
		const result = sortActionsByConfig(actions, []);
		expect(result).toEqual(actions);
		expect(result).not.toBe(actions);
	});

	it('should order actions by orderedIds', () => {
		const actions: RoomToolboxActionConfig[] = [
			{ id: 'b', title: 'B', groups: ['channel'], icon: 'thread' },
			{ id: 'a', title: 'A', groups: ['channel'], icon: 'info' },
			{ id: 'c', title: 'C', groups: ['channel'], icon: 'magnifier' },
		];
		const result = sortActionsByConfig(actions, ['c', 'a', 'b']);
		expect(result.map((a) => a.id)).toEqual(['c', 'a', 'b']);
	});

	it('should place unrecognized IDs at the end in stable order', () => {
		const actions: RoomToolboxActionConfig[] = [
			{ id: 'known', title: 'Known', groups: ['channel'], icon: 'info' },
			{ id: 'third-party-app', title: 'App', groups: ['channel'], type: 'apps', icon: 'app' },
		];
		const result = sortActionsByConfig(actions, ['known']);
		expect(result.map((a) => a.id)).toEqual(['known', 'third-party-app']);
	});
});
