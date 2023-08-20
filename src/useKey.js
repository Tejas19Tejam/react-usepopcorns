import { useEffect } from 'react';

export function useKey(key, action) {
	// Listening for keydown event
	useEffect(
		function () {
			function callBack(e) {
				if (e.code.toLowerCase() === key.toLowerCase()) {
					// Calling callback
					action?.();
				}
			}

			document.addEventListener('keydown', callBack);

			return function () {
				document.removeEventListener('keydown', callBack);
			};
		},
		[key, action]
	);
}
