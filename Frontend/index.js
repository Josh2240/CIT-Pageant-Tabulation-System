async function api(path, options = {}) {
	const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, options));
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

async function loadContestants() {
	const list = await api('/api/contestants');
	const select = document.getElementById('contestant-select');
	select.innerHTML = '';
	list.forEach(c => {
		const opt = document.createElement('option');
		opt.value = c.id;
		opt.textContent = c.name;
		select.appendChild(opt);
	});
}

async function loadScoreboard() {
	const board = await api('/api/scoreboard');
	const container = document.getElementById('scoreboard-list');
	container.innerHTML = '';
	if (!board.length) container.textContent = 'No contestants yet.';
	board.forEach(row => {
		const el = document.createElement('div');
		el.className = 'row';
		el.innerHTML = `<strong>${row.name}</strong> — Total: ${row.total.toFixed(2)} (avg: ${row.avg.toFixed(2)} from ${row.count})`;
		container.appendChild(el);
	});
}

document.getElementById('add-contestant-form').addEventListener('submit', async (e) => {
	e.preventDefault();
	const name = document.getElementById('contestant-name').value.trim();
	if (!name) return;
	await api('/api/contestants', { method: 'POST', body: JSON.stringify({ name }) });
	document.getElementById('contestant-name').value = '';
	await loadContestants();
	await loadScoreboard();
});

document.getElementById('submit-score-form').addEventListener('submit', async (e) => {
	e.preventDefault();
	const contestantId = document.getElementById('contestant-select').value;
	const judge = document.getElementById('judge-name').value.trim();
	const score = document.getElementById('score-value').value;
	if (!contestantId || score === '') return;
	await api('/api/scores', { method: 'POST', body: JSON.stringify({ contestantId, judge, score }) });
	document.getElementById('judge-name').value = '';
	document.getElementById('score-value').value = '';
	await loadScoreboard();
});

// Initial load
(async () => {
	try {
		await loadContestants();
		await loadScoreboard();
	} catch (err) {
		console.error('Initialization error', err);
	}
})();
