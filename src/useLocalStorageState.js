import { useState, useEffect } from 'react';

export function useLocalStorageState(initialState, key) {
	const [value, setValue] = useState(() => {
		const watchedList = localStorage.getItem(key);
		return watchedList ? JSON.parse(watchedList) : initialState;
	});

	// Storing watched movies in the local storage (USING EFFECT'S )(Way 02)

	useEffect(
		function () {
			localStorage.setItem(key, JSON.stringify(value));
		},
		[value, key]
	);

	return [value, setValue];
}
