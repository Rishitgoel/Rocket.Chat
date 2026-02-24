import type { GenericMenuItemProps } from '@rocket.chat/ui-client';
import { useLayout, useSetting } from '@rocket.chat/ui-contexts';
import type { RoomToolboxContextValue } from '@rocket.chat/ui-contexts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { sortActionsByConfig } from './sortRoomToolboxActions';

type MenuActionsProps = {
	id: string;
	items: GenericMenuItemProps[];
}[];

const ROOM_HEADER_BUTTON_ORDER_SETTING_ID = 'Layout_Room_Header_Button_Order';
const ROOM_HEADER_FEATURED_ACTION_IDS_SETTING_ID = 'Layout_Room_Header_Featured_Action_Ids';

function parseOrderedIds(value: string | undefined): string[] {
	if (value == null || typeof value !== 'string' || value.trim() === '') {
		return [];
	}
	try {
		const parsed = JSON.parse(value) as unknown;
		return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

function parseOptionalStringArray(value: string | undefined): string[] | undefined {
	if (value == null || typeof value !== 'string' || value.trim() === '') {
		return undefined;
	}
	try {
		const parsed = JSON.parse(value) as unknown;
		if (!Array.isArray(parsed)) {
			return undefined;
		}
		return parsed.filter((id): id is string => typeof id === 'string');
	} catch {
		return undefined;
	}
}

export function buildMenuSectionsFromActions(
	actions: RoomToolboxContextValue['actions'],
	openTab: RoomToolboxContextValue['openTab'],
	t: (key: string) => string,
): MenuActionsProps {
	return actions
		.filter((item) => !item.disabled)
		.map((item) => ({
			content: t(item.title),
			onClick:
				item.action ??
				((): void => {
					openTab(item.id);
				}),
			...item,
		}))
		.reduce((acc, item) => {
			const group = item.type ? item.type : '';
			const section = acc.find((s: { id: string }) => s.id === group);
			if (section) {
				section.items.push(item);
				return acc;
			}
			acc.push({ id: group, title: group === 'apps' ? t('Apps') : '', items: [item] });
			return acc;
		}, [] as MenuActionsProps);
}

export const useRoomToolboxActions = ({ actions, openTab }: Pick<RoomToolboxContextValue, 'actions' | 'openTab'>) => {
	const { t } = useTranslation();
	const { roomToolboxExpanded } = useLayout();
	const orderSettingValue = useSetting(ROOM_HEADER_BUTTON_ORDER_SETTING_ID);
	const orderedIds = useMemo(() => parseOptionalStringArray(orderSettingValue as string), [orderSettingValue]);

	const featuredAllowlistSettingValue = useSetting(ROOM_HEADER_FEATURED_ACTION_IDS_SETTING_ID);
	const featuredAllowlist = useMemo(
		() => parseOptionalStringArray(featuredAllowlistSettingValue as string),
		[featuredAllowlistSettingValue],
	);

	const isFeaturedPinned = useMemo(
		() =>
			(action: RoomToolboxContextValue['actions'][number]) =>
				!!action.featured && (featuredAllowlist ? featuredAllowlist.includes(action.id) : true),
		[featuredAllowlist],
	);

	const featuredActions = useMemo(() => actions.filter(isFeaturedPinned), [actions, isFeaturedPinned]);
	const demotedFeaturedActions = useMemo(
		() => actions.filter((action) => !!action.featured && !isFeaturedPinned(action)),
		[actions, isFeaturedPinned],
	);
	const nonFeaturedActions = useMemo(() => actions.filter((action) => !action.featured), [actions]);

	const { primaryActions, overflowActions } = useMemo(() => {
		if (orderedIds === undefined) {
			// Current behavior: first 6 normal when expanded, rest in overflow
			const normalActions = nonFeaturedActions.filter((action) => action.type !== 'apps');
			const appsActions = nonFeaturedActions.filter((action) => action.type === 'apps');

			const visible = roomToolboxExpanded ? normalActions.slice(0, 6) : [];
			const overflow = roomToolboxExpanded
				? [...appsActions, ...normalActions.slice(6), ...demotedFeaturedActions]
				: [...nonFeaturedActions, ...demotedFeaturedActions];

			return { primaryActions: visible, overflowActions: overflow };
		}

		if (orderedIds.length === 0) {
			return { primaryActions: [], overflowActions: [...nonFeaturedActions, ...demotedFeaturedActions] };
		}

		const restActions = actions.filter((action) => !isFeaturedPinned(action));
		const sortedRest = sortActionsByConfig(restActions, orderedIds);
		const primary = sortedRest.filter((a) => orderedIds.includes(a.id));
		const overflow = sortedRest.filter((a) => !orderedIds.includes(a.id));
		return { primaryActions: primary, overflowActions: overflow };
	}, [orderedIds, roomToolboxExpanded, nonFeaturedActions, demotedFeaturedActions, actions, isFeaturedPinned]);

	const hiddenActions = useMemo(
		() => buildMenuSectionsFromActions(overflowActions, openTab, t),
		[overflowActions, openTab, t],
	);

	return { hiddenActions, featuredActions, primaryActions, overflowActions };
};
