import { useState, useEffect } from 'react';

// Fetching data from external API
const KEY = '1ca9f2f6';
export function useMovies(query, callback) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	useEffect(
		function () {
			callback?.();
			// Creating AbortController class instance to remove asynchronous operations running in background
			const controller = new AbortController();

			async function fetchData() {
				try {
					// Resetting Error
					setError('');
					// If you provide an empty dependency array, the effect will only run once a component is mounted (i.e., inserted into the DOM)
					setIsLoading(true);

					const res = await fetch(
						`//www.omdbapi.com/?apikey=${KEY}&s=${query}`,
						{ signal: controller.signal }
					);

					// Handling Network error
					if (!res.ok)
						throw new Error(
							"Something went's wrong , while fetching data !"
						);

					// Handling Incorrect ID
					const data = await res.json();

					// Handling Movie not found
					if (data.Response === 'False') throw new Error(data.Error);
					setMovies(data.Search);
					setError('');
				} catch (err) {
					console.log('🚨', err.message);
					if (err.name !== 'AbortError') {
						setError(err.message);
					}
				} finally {
					setIsLoading(false);
				}
			}
			// If we search for a movie name whose name is less then two characters then return
			if (query.length < 3) {
				setMovies([]);
				setError('');
				return;
			}
			fetchData();
			// Returning cleanup function
			return function () {
				controller.abort();
			};
		},
		[query]
	);
	return { movies, isLoading, error };
}
