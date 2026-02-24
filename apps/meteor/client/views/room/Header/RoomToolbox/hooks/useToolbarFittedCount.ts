import { useResizeObserver } from '@rocket.chat/fuselage-hooks';
import { useMemo } from 'react';

/** Approximate width per toolbar button (icon button + gap) for responsive overflow */
const TOOLBAR_BUTTON_WIDTH = 40;

/**
 * Returns a ref and the number of toolbar buttons that fit in the observed container width.
 * Use to dynamically move primary buttons into the overflow menu on small viewports.
 */
export const useToolbarFittedCount = (debounceDelay = 50) => {
	const { ref, borderBoxSize } = useResizeObserver<HTMLElement>({ debounceDelay });
	const inlineSize = borderBoxSize?.inlineSize ?? 0;
	const fittedCount = useMemo(
		() => (inlineSize > 0 ? Math.max(0, Math.floor(inlineSize / TOOLBAR_BUTTON_WIDTH)) : Number.MAX_SAFE_INTEGER),
		[inlineSize],
	);
	return { ref, fittedCount };
};
