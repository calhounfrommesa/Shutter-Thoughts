(function () {
  var lb = document.getElementById('lb');
  if (!lb) return;

  var img = document.getElementById('lbImg'),
      file = document.getElementById('lbFile'),
      dims = document.getElementById('lbDims'),
      cap = document.getElementById('lbCap'),
      count = document.getElementById('lbCount'),
      prev = document.getElementById('lbPrev'),
      next = document.getElementById('lbNext'),
      closeBtn = document.getElementById('lbClose'),
      stage = document.getElementById('lbStage');

  var set = [], idx = 0, opener = null;

  // Warm the browser cache for the neighbouring full-size files so
  // arrowing through a set doesn't stall.
  function preload(i) {
    [i - 1, i + 1].forEach(function (j) {
      if (set[j]) { var p = new Image(); p.src = set[j].dataset.full; }
    });
  }

  function show(i) {
    idx = i;
    var b = set[i];
    img.classList.add('loading');
    img.src = b.dataset.full;
    img.alt = b.dataset.cap || '';
    img.onload = function () { img.classList.remove('loading'); };
    file.textContent = b.dataset.file;
    dims.textContent = b.dataset.dims;
    cap.textContent = set.length > 1 ? '\u2514 ' + (b.dataset.cap || '') : (b.dataset.cap || '');
    count.textContent = set.length > 1 ? (i + 1) + ' / ' + set.length : '';
    prev.disabled = i === 0;
    next.disabled = i === set.length - 1;
    prev.style.visibility = next.style.visibility = set.length > 1 ? 'visible' : 'hidden';
    preload(i);
  }

  function open(b) {
    opener = b;
    set = Array.prototype.slice.call(b.closest('.shots').querySelectorAll('.ph'));
    show(set.indexOf(b));
    lb.classList.add('open');
    document.body.classList.add('locked');
    closeBtn.focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.classList.remove('locked');
    img.removeAttribute('src');
    if (opener) opener.focus();
  }

  function step(d) {
    var n = idx + d;
    if (n >= 0 && n < set.length) show(n);
  }

  document.querySelectorAll('.ph').forEach(function (b) {
    b.addEventListener('click', function () { open(b); });
  });

  closeBtn.addEventListener('click', close);
  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  img.addEventListener('click', close);
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === stage) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  // Swipe on touch devices.
  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
