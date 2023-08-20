import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';

import App from './App';
// import StarRating from './StarRating';

const rootElm = document.getElementById('root');
const Root = ReactDOM.createRoot(rootElm);

// Demonstration of how to consume api state
function Test() {
	const [mvRating, setMvRating] = useState(0);
	return (
		<div>
			{/* <StarRating maxRating={7} color='blue' onSetRating={setMvRating} /> */}
			<p>This movie has got {mvRating} rating .</p>
		</div>
	);
}

Root.render(
	<StrictMode>
		{/* <StarRating
			maxRating={5}
			messages={['Terrible', 'Bad', 'Okay', 'Good', 'Excellent']}
		/>
		<StarRating
			maxRating={5}
			color='red'
			size={23}
			className='text'
			defaultRating={3}
		/>
		<Test /> */}
		<App />
	</StrictMode>
);
