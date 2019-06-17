import React from 'react';

const formatSeconds = function(count = 0) {
	let seconds = count % 60;
	let minutes = Math.floor(count / 60);

	if (seconds < 10) {
		seconds = `<span class="mins">0</span><span class="mins">${seconds}</span>`;
	} else {
		seconds = seconds + '';
		seconds = `<span class="mins">${seconds.split('')[0]}</span><span class="mins">${seconds.split('')[1]}</span>`;
	}
	if (minutes < 10) {
		minutes = `<span class="mins">0</span><span class="mins">${minutes}</span>`;
	} else {
		minutes = minutes + '';
		minutes = `<span class="mins">${minutes.split('')[0]}</span><span class="mins">${minutes.split('')[1]}</span>`;
	}

	return `${minutes}<span class="jg">:</span>${seconds}`;
};

const Clock = ({ count }) => {
	let clockText = null;
	return (
		<span className="clock">
			<span className="clock-text" ref={(span) => (clockText = span)}>
				<span dangerouslySetInnerHTML={{ __html: formatSeconds(count) }} />
			</span>
		</span>
	);
};

export default Clock;
