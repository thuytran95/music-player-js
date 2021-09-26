const wrapper = document.querySelector('.wrapper');
const musicImg = wrapper.querySelector('.img-area img');
const musicName = wrapper.querySelector('.song-details .name');
const musicArtist = wrapper.querySelector('.song-details .artist');
const mainAudio = wrapper.querySelector('#main-audio');
const playPauseBtn = wrapper.querySelector('.play-pause');
const prevBtn = wrapper.querySelector('#prev');
const nextBtn = wrapper.querySelector('#next');
const progressBar = wrapper.querySelector('.progress-bar');
const progressArea = wrapper.querySelector('.progress-area');
const musicList = wrapper.querySelector('.music-list');
const showMoreBtn = wrapper.querySelector('#more-music');
const hideMusicBtn = musicList.querySelector('#close');

let musicIndex = Math.floor(Math.random() * allMusic.length + 1);

window.addEventListener('load', () => {
	loadMusic(musicIndex); //calling load music funciton once window loaded
	playingNow();
});

function loadMusic(indexNumber) {
	musicName.innerText = allMusic[indexNumber - 1].name;
	musicArtist.innerText = allMusic[indexNumber - 1].artist;
	musicImg.src = `/images/${allMusic[indexNumber - 1].img}.jpg`;
	mainAudio.src = `songs/${allMusic[indexNumber - 1].src}.mp3`;
}

// play function
function playMusic() {
	wrapper.classList.add('paused');
	playPauseBtn.querySelector('i').innerHTML = 'pause';
	mainAudio.play();
}

// pause function
function pauseMusic() {
	wrapper.classList.remove('paused');
	playPauseBtn.querySelector('i').innerHTML = 'play_arrow';
	mainAudio.pause();
}

function nextMusic() {
	musicIndex++;
	musicIndex > allMusic.length ? (musicIndex = 1) : (musicIndex = musicIndex);
	loadMusic(musicIndex);
	playMusic();
	playingNow();
}

function prevMusic() {
	musicIndex--;
	musicIndex < 1 ? (musicIndex = allMusic.length) : (musicIndex = musicIndex);
	loadMusic(musicIndex);
	playMusic();
	playingNow();
}

// Play- pause event
playPauseBtn.addEventListener('click', () => {
	const isMusicPaused = wrapper.classList.contains('paused');
	isMusicPaused ? pauseMusic() : playMusic();
});

prevBtn.addEventListener('click', () => {
	prevMusic();
});

nextBtn.addEventListener('click', () => {
	nextMusic();
});

// update progrees bar width according to music current time
mainAudio.addEventListener('timeupdate', e => {
	const currentTime = e.target.currentTime; //getting current time of song
	const duration = e.target.duration;
	let musicCurrentTime = wrapper.querySelector('.current');
	let musicDuration = wrapper.querySelector('.duration');

	let progressWidth = (currentTime / duration) * 100;
	progressBar.style.width = `${progressWidth}%`;

	mainAudio.addEventListener('loadeddata', () => {
		// update song total time
		let audioDuration = mainAudio.duration;
		let totalMin = Math.floor(audioDuration / 60);
		let totalSec = Math.floor(audioDuration % 60);
		totalSec = totalSec <= 9 ? `0${totalSec}` : totalSec;
		musicDuration.innerHTML = `${totalMin}: ${totalSec}`;
	});

	// update song curent time
	let currentMin = Math.floor(currentTime / 60);
	let currentSec = Math.floor(currentTime % 60);
	currentSec = currentSec <= 9 ? `0${currentSec}` : currentSec;
	musicCurrentTime.innerHTML = `${currentMin}: ${currentSec}`;
});

// update playing song current time according to the progress bar width
progressArea.addEventListener('click', e => {
	let progressWidthVal = progressArea.clientWidth; //getting width of progress bar
	let clickedOffSetX = e.offsetX; // getting offset x value
	let songDuration = mainAudio.duration; //getting total song duration

	mainAudio.currentTime = (clickedOffSetX / progressWidthVal) * songDuration;
	playMusic();
});

// repeat
const repeatBtn = wrapper.querySelector('#repeat-plist');
repeatBtn.addEventListener('click', () => {
	let getText = repeatBtn.innerHTML;
	switch (getText) {
		case 'repeat':
			repeatBtn.innerHTML = 'repeat_one';
			repeatBtn.setAttribute('title', 'Song looped');
			break;
		case 'repeat_one':
			repeatBtn.innerHTML = 'shuffle';
			repeatBtn.setAttribute('title', 'Playback shuffle');
			break;
		case 'shuffle':
			repeatBtn.innerHTML = 'repeat';
			repeatBtn.setAttribute('title', 'Playlist looped');
			playingNow();
			break;
	}
});

// After song ended -> current song will do with some aciton depending on switch before
mainAudio.addEventListener('ended', () => {
	let getText = repeatBtn.innerHTML;

	switch (getText) {
		case 'repeat':
			nextMusic();
			break;
		case 'repeat_one': //play current song
			mainAudio.currentTime = 0;
			loadMusic(musicIndex);
			playMusic();
			break;
		case 'shuffle':
			let randIndex = Math.floor(Math.random() * allMusic.length + 1);
			do {
				randIndex = Math.floor(Math.random() * allMusic.length + 1);
			} while (musicIndex === randIndex); //loop run util next random won't be the same of current index
			musicIndex = randIndex;
			loadMusic(musicIndex);
			playMusic();
			break;
	}
});

// show music list
showMoreBtn.addEventListener('click', () => {
	musicList.classList.toggle('show');
});

hideMusicBtn.addEventListener('click', () => {
	showMoreBtn.click();
});

const ulTag = wrapper.querySelector('ul');
for (let i = 0; i < allMusic.length; i++) {
	let liTag = `<li li-index='${i + 1}'>
	<div class="row">
		<span>${allMusic[i].name}</span>
		<p>${allMusic[i].artist}</p>
	</div>
	<audio class="${allMusic[i].src}" src="songs/${allMusic[i].src}.mp3"></audio>

	<span  id="${allMusic[i].src}" class="audio-duration">3:40</span>
	</li>`;

	ulTag.insertAdjacentHTML('beforeend', liTag);
	let liAudioTag = ulTag.querySelector(`.${allMusic[i].src}`);
	let liAudioDuration = ulTag.querySelector(`#${allMusic[i].src}`);

	// loadeddata event used to get audio total duration without playing it
	liAudioTag.addEventListener('loadeddata', () => {
		// update song total time
		let audioDuration = liAudioTag.duration;
		let totalMin = Math.floor(audioDuration / 60);
		let totalSec = Math.floor(audioDuration % 60);
		totalSec = totalSec <= 9 ? `0${totalSec}` : totalSec;
		liAudioDuration.innerHTML = `${totalMin}: ${totalSec}`;

		// set attribute to change status playing and total duration
		liAudioDuration.setAttribute('t-duration', `${totalMin}: ${totalSec}`);
	});
}

// select particular  song when click playlist
const allLiTags = ulTag.querySelectorAll('li');
function playingNow() {
	allLiTags.forEach((item, index) => {
		let audioTag = item.querySelector('.audio-duration');
		if (item.classList.contains('playing')) {
			item.classList.remove('playing');
			audioTag.innerHTML = audioTag.getAttribute('t-duration');
		}

		if (item.getAttribute('li-index') == musicIndex) {
			item.classList.add('playing');
			audioTag.innerHTML = 'Playing';
		}
		item.setAttribute('onclick', 'clicked(this)');
	});
}

function clicked(element) {
	let getLiIndex = element.getAttribute('li-index');
	musicIndex = parseInt(getLiIndex);
	loadMusic(musicIndex);
	playMusic();
	playingNow();
}
