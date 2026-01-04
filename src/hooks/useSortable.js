import {useEffect, useRef} from 'react';
import Sortable from 'sortablejs';

export const useSortable = ({
	                            containerRef,
	                            enabled,
	                            onSort,
	                            idAttribute = 'data-id',
	                            options = {}
                            }) => {
	const sortableRef = useRef(null);
	const optionsRef = useRef(options);

	// 更新 optionsRef 当 options 变化时
	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	useEffect(() => {
		if (enabled && containerRef.current && !sortableRef.current) {
			sortableRef.current = new Sortable(containerRef.current, {
				animation: 200,
				ghostClass: 'dragging',
				chosenClass: 'drag-over',
				dragClass: 'dragging',
				forceFallback: true,
				fallbackTolerance: 3,
				...optionsRef.current,
				onEnd: (evt) => {
					if (evt.oldIndex !== evt.newIndex) {
						const sortedIds = Array.from(containerRef.current.children)
							.map(el => el.getAttribute(idAttribute))
							.filter(id => id !== null);
						onSort(sortedIds);
					}
					if (optionsRef.current.onEnd) {
						optionsRef.current.onEnd(evt);
					}
				}
			});
		}

		return () => {
			if (sortableRef.current && !enabled) {
				sortableRef.current.destroy();
				sortableRef.current = null;
			}
		};
	}, [enabled, containerRef, onSort, idAttribute]);

	return sortableRef;
};

