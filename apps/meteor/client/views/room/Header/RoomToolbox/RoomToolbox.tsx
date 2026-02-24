import { Box } from '@rocket.chat/fuselage';
import { useEffectEvent } from '@rocket.chat/fuselage-hooks';
import { GenericMenu, HeaderToolbarAction, HeaderToolbarDivider } from '@rocket.chat/ui-client';
import { useRoomToolbox, type RenderToolboxItemParams, type RoomToolboxActionConfig } from '@rocket.chat/ui-contexts';
import type { ComponentProps } from 'react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { buildMenuSectionsFromActions, useRoomToolboxActions } from './hooks/useRoomToolboxActions';
import { useToolbarFittedCount } from './hooks/useToolbarFittedCount';

type RoomToolboxProps = {
	className?: ComponentProps<typeof Box>['className'];
};

const RoomToolbox = ({ className }: RoomToolboxProps) => {
	const { t } = useTranslation();
	const toolbox = useRoomToolbox();
	const { featuredActions, primaryActions, overflowActions } = useRoomToolboxActions(toolbox);
	const { ref: toolbarRef, fittedCount } = useToolbarFittedCount(50);

	const effectivePrimaryCount =
		fittedCount < Number.MAX_SAFE_INTEGER ? Math.min(primaryActions.length, fittedCount) : primaryActions.length;
	const visiblePrimaryActions = useMemo(
		() => primaryActions.slice(0, effectivePrimaryCount),
		[primaryActions, effectivePrimaryCount],
	);
	const overflowFromPrimary = useMemo(
		() => primaryActions.slice(effectivePrimaryCount),
		[primaryActions, effectivePrimaryCount],
	);
	const responsiveHiddenActions = useMemo(
		() => buildMenuSectionsFromActions([...overflowFromPrimary, ...overflowActions], toolbox.openTab, t),
		[overflowFromPrimary, overflowActions, toolbox.openTab, t],
	);
	const showKebabMenu = responsiveHiddenActions.length > 0;

	const renderDefaultToolboxItem = useEffectEvent(
		({ id, className, icon, title, toolbox: { tab }, action, disabled, tooltip }: RenderToolboxItemParams) => {
			return (
				<HeaderToolbarAction
					key={id}
					className={className}
					icon={icon}
					title={t(title)}
					pressed={id === tab?.id}
					onClick={action}
					disabled={disabled}
					tooltip={tooltip}
				/>
			);
		},
	);

	const mapToToolboxItem = (action: RoomToolboxActionConfig) => {
		return (action.renderToolboxItem ?? renderDefaultToolboxItem)?.({
			...action,
			action: action.action ?? (() => toolbox.openTab(action.id)),
			className,
			toolbox,
		});
	};

	return (
		<Box ref={toolbarRef} display='flex' alignItems='center' flexShrink={0} overflow='hidden'>
			{featuredActions.map(mapToToolboxItem)}
			{featuredActions.length > 0 && <HeaderToolbarDivider />}
			{visiblePrimaryActions.map(mapToToolboxItem)}
			{showKebabMenu && (
				<GenericMenu className={className} title={t('Options')} sections={responsiveHiddenActions} placement='bottom-end' />
			)}
		</Box>
	);
};

export default memo(RoomToolbox);
