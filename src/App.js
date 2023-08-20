import { useEffect, useState, useRef } from 'react';
import StarRating from './StarRating';
import './index.css';
import { useMovies } from './useMovies';
import { useLocalStorageState } from './useLocalStorageState';
import { useKey } from './useKey';

const KEY = '1ca9f2f6';
const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// Root
export default function App() {
	const [isOpen1, setIsOpen1] = useState(true);
	const [isOpen2, setIsOpen2] = useState(true);
	const [query, setQuery] = useState('');
	const [selectedId, setSelectedId] = useState(null);

	const { movies, isLoading, error } = useMovies(query, handleCloseMovie);

	// Get watched movies stored in the localestorage before watchedMovieList render (CUSTOM HOOK)
	const [watched, setWatched] = useLocalStorageState([], 'watched');

	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (selectedId === id ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((selected) => [...selected, movie]);
		// Storing watched movies in the local storage(Way 01 )

		// localStorage.setItem(
		// 	'watchedMovies',
		// 	JSON.stringify([...watched, movie])
		// );
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	return (
		<>
			<NavBar>
				<Search query={query} setQuery={setQuery} />
				<NumResult movies={movies} />
			</NavBar>
			<Main>
				{/* Implicitly passing props as children  */}
				<Box isOpen={isOpen1} setIsOpen={setIsOpen1}>
					{/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}

					{isLoading && <Loader />}

					{!isLoading && !error && (
						<MovieList
							movies={movies}
							onSelectMovie={handleSelectMovie}
						/>
					)}

					{error && <ErrorMessage message={error} />}
				</Box>

				<Box isOpen={isOpen2} setIsOpen={setIsOpen2}>
					<>
						{selectedId ? (
							<MovieDetails
								selectedId={selectedId}
								onCloseMovie={handleCloseMovie}
								onAddWatched={handleAddWatched}
								watched={watched}
							/>
						) : (
							<>
								<WatchedSummary watched={watched} />

								<WatchedMovieList
									watched={watched}
									onDeleteMovie={handleDeleteWatched}
								/>
							</>
						)}
					</>
				</Box>
			</Main>
		</>
	);
}

// Create Loading
function Loader() {
	return <p className='loader'>Loading....</p>;
}

// Error Message
function ErrorMessage({ message }) {
	return (
		<p className='error'>
			<span>🚨 </span>
			{message}
		</p>
	);
}

// Navigation Bar
function NavBar({ children }) {
	return (
		<nav className='nav-bar'>
			<Logo />
			{children}
		</nav>
	);
}

// Application Logo
function Logo() {
	return (
		<div className='logo'>
			<span role='img'>🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

// Search Bar
function Search({ query, setQuery }) {
	// Declarative Way
	const inputElm = useRef(null);

	// Imperative Way

	// useEffect(function () {
	// 	const s = document.querySelector('.search');
	// 	s.focus();
	// }, []);

	// Using custom hook for Enter event
	useKey('Enter', function () {
		// Return if element is already focussed
		if (document.activeElement === inputElm.current) return;
		// Execute if enter key is pressed
		setQuery('');
		inputElm.current.focus();
	});

	return (
		<input
			className='search'
			type='text'
			placeholder='Search movies...'
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputElm}
		/>
	);
}

// Number of search results
function NumResult({ movies }) {
	return (
		<p className='num-results'>
			Found <strong>{movies.length || 0}</strong> results
		</p>
	);
}

// Main Menu
function Main({ children }) {
	return <main className='main'>{children}</main>;
}

// Searched Movies Box
function Box({ isOpen, setIsOpen, children }) {
	return (
		<div className='box'>
			<ToggleButton setFunction={setIsOpen} state={isOpen} />
			{isOpen && children}
		</div>
	);
}

// Toggle Button
function ToggleButton({ setFunction, state }) {
	return (
		<button
			className='btn-toggle'
			onClick={() => setFunction((open) => !open)}
		>
			{state ? '–' : '+'}
		</button>
	);
}

// Movies List
function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className='list list-movies'>
			{movies?.map((movie) => (
				<Movie
					movie={movie}
					key={movie.imdbID}
					onSelectMovie={onSelectMovie}
				/>
			))}
		</ul>
	);
}

// Each movie
function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

// Details of selected movie
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState(0);
	// Array of imdbID of movies present in watched list
	const inWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	// Rating given by user to selected movie (if already present in watched list )
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	const clickCount = useRef(0);

	useEffect(
		function () {
			if (userRating) clickCount.current++;
		},
		[userRating]
	);
	// Destructuring movie object
	const {
		Title: title,
		Poster: poster,
		Runtime: runtime,
		Year: year,
		Plot: plot,
		Released: release,
		Director: director,
		Actors: actor,
		Genre: genre,
		imdbRating,
	} = movie;

	// Get details of selected movie (imdbID)
	useEffect(
		function () {
			async function getDetails() {
				setIsLoading(true);
				const res = await fetch(
					`//www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
				);
				const data = await res.json();
				setIsLoading(false);
				setMovie(data);
			}
			getDetails();
		},
		[selectedId]
	);

	// Set the title of page to selected movie title
	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			return function () {
				document.title = 'usePopcorns';
				console.log(`Clean up effect for movie ${title}`);
			};
		},
		[title]
	);

	// Using custom hook for keydown event
	useKey('Escape', onCloseMovie);

	// Adding new movie to watched list
	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(' ').at(0)),
			userRating,
			userRatingDecisions: clickCount.current,
		};

		!inWatched && onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	return (
		<div className='details'>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className='btn-back' onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${title} movie`} />
						<div className='details-overview'>
							<h2>{title}</h2>
							<p>
								{release} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span>
								{imdbRating} IMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className='rating'>
							{!inWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button
											className='btn-add'
											onClick={handleAdd}
										>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<p>
									You rated with movie {watchedUserRating}
									<span> ⭐</span>
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actor}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}

/* 
// Watched Movie
function WatchedBox() {
	const [watched, setWatched] = useState(tempWatchedData);

  const [isOpen2, setIsOpen2] = useState(true);
  
	return (
		<div className='box'>
			<button
				className='btn-toggle'
				onClick={() => setIsOpen2((open) => !open)}
			>
				{isOpen2 ? '–' : '+'}
			</button>
			
			{isOpen2 && (
				<>
					<WatchedSummary watched={watched} />

					<WatchedMovieList watched={watched} />
				</>
			)}
		</div>
	);
}
*/

// Watched Summary
function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));

	return (
		<div className='summary'>
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

// Watched Movies List
function WatchedMovieList({ watched, onDeleteMovie }) {
	return (
		<ul className='list'>
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteMovie={onDeleteMovie}
				/>
			))}
		</ul>
	);
}

// Watched Movie
function WatchedMovie({ movie, onDeleteMovie }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
				<button
					className='btn-delete'
					onClick={() => onDeleteMovie(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	);
}
