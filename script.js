// 1. Efectos de Sonido con Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(freq = 600, duration = 0.05) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// 2. Fondo de Olas en Azul Marino con Degradados Fluidos (Canvas)
const waveCanvas = document.getElementById('waveCanvas');
if (waveCanvas) {
  const ctx = waveCanvas.getContext('2d');
  let width, height;
  let step = 0;
  const mouse = { x: 0.5, y: 0.5 };

  function resizeWaveCanvas() {
    width = waveCanvas.width = window.innerWidth;
    height = waveCanvas.height = window.innerHeight;
  }

  // Definición de 4 capas de olas con degradados en azul marino profundo
  const waveLayers = [
    {
      baseYPercent: 0.38,
      amplitude: 36,
      frequency: 0.0028,
      speed: 0.007,
      phaseOffset: 0,
      gradient: [
        { stop: 0, color: 'rgba(10, 32, 70, 0.45)' },
        { stop: 0.5, color: 'rgba(6, 20, 46, 0.75)' },
        { stop: 1, color: 'rgba(3, 8, 20, 0.95)' }
      ],
      crestColor: 'rgba(0, 160, 255, 0.18)'
    },
    {
      baseYPercent: 0.54,
      amplitude: 44,
      frequency: 0.0035,
      speed: 0.011,
      phaseOffset: Math.PI * 0.4,
      gradient: [
        { stop: 0, color: 'rgba(14, 45, 96, 0.5)' },
        { stop: 0.6, color: 'rgba(8, 25, 58, 0.8)' },
        { stop: 1, color: 'rgba(3, 9, 22, 0.98)' }
      ],
      crestColor: 'rgba(0, 190, 255, 0.26)'
    },
    {
      baseYPercent: 0.69,
      amplitude: 52,
      frequency: 0.0032,
      speed: 0.014,
      phaseOffset: Math.PI * 0.85,
      gradient: [
        { stop: 0, color: 'rgba(18, 60, 125, 0.55)' },
        { stop: 0.65, color: 'rgba(9, 30, 68, 0.85)' },
        { stop: 1, color: 'rgba(4, 12, 28, 1)' }
      ],
      crestColor: 'rgba(0, 215, 255, 0.38)'
    },
    {
      baseYPercent: 0.83,
      amplitude: 48,
      frequency: 0.0045,
      speed: 0.018,
      phaseOffset: Math.PI * 1.35,
      gradient: [
        { stop: 0, color: 'rgba(0, 125, 195, 0.4)' },
        { stop: 0.45, color: 'rgba(10, 38, 85, 0.8)' },
        { stop: 1, color: 'rgba(2, 7, 20, 1)' }
      ],
      crestColor: 'rgba(56, 189, 248, 0.55)'
    }
  ];

  function drawWaves() {
    ctx.clearRect(0, 0, width, height);
    step++;

    waveLayers.forEach(layer => {
      const baseY = height * layer.baseYPercent;
      const currentPhase = step * layer.speed + layer.phaseOffset;
      const mouseInfluence = (mouse.y - 0.5) * 18;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      const sampleStep = 8;
      for (let x = 0; x <= width + sampleStep; x += sampleStep) {
        const wave1 = Math.sin(x * layer.frequency + currentPhase) * (layer.amplitude + mouseInfluence);
        const wave2 = Math.cos(x * (layer.frequency * 0.55) + currentPhase * 0.65) * (layer.amplitude * 0.32);
        const y = baseY + wave1 + wave2;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY - layer.amplitude, 0, height);
      layer.gradient.forEach(g => grad.addColorStop(g.stop, g.color));
      ctx.fillStyle = grad;
      ctx.fill();

      if (layer.crestColor) {
        ctx.save();
        ctx.beginPath();
        for (let x = 0; x <= width + sampleStep; x += sampleStep) {
          const wave1 = Math.sin(x * layer.frequency + currentPhase) * (layer.amplitude + mouseInfluence);
          const wave2 = Math.cos(x * (layer.frequency * 0.55) + currentPhase * 0.65) * (layer.amplitude * 0.32);
          const y = baseY + wave1 + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = layer.crestColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }
    });

    requestAnimationFrame(drawWaves);
  }

  window.addEventListener('resize', resizeWaveCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  });

  resizeWaveCanvas();
  drawWaves();
}



// 2. Control de Botones de Navegación Burbuja
const bubbleNavBtns = document.querySelectorAll('.bubble-btn');

bubbleNavBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    playBeep(880, 0.05); // Sonido suave al interactuar
  });
});

// 3. Reproductor Lo-Fi Minimalista
const lofiWidget = document.getElementById('lofiWidget');
const lofiPlayBtn = document.getElementById('lofiPlayBtn');
const lofiAudio = document.getElementById('lofiAudio');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const trackTitle = document.getElementById('trackTitle');

let isPlaying = false;
let synthLoFiTimer = null;
let synthLoFiNotes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 293.66, 392.00]; // Acordes Lo-Fi (Cmaj7 / Fmaj7)

// Sintetizador Lo-Fi procedimental por si la red/stream no carga
function playLoFiAmbientNote() {
  if (!isPlaying) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  const note = synthLoFiNotes[Math.floor(Math.random() * synthLoFiNotes.length)];
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(note, audioCtx.currentTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, audioCtx.currentTime); // Sonido cálido y amortiguado (Lo-Fi filter)

  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.0);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 3.0);

  synthLoFiTimer = setTimeout(playLoFiAmbientNote, 1400 + Math.random() * 800);
}

function toggleLoFiPlay() {
  if (!isPlaying) {
    isPlaying = true;
    lofiWidget.classList.add('playing');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    trackTitle.textContent = 'Midnight Chill • Playing';

    // Intentar reproducir stream de audio real
    if (lofiAudio) {
      lofiAudio.volume = 0.4;
      const playPromise = lofiAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback a ambient sintetizado nativo
          playLoFiAmbientNote();
        });
      }
    } else {
      playLoFiAmbientNote();
    }
  } else {
    isPlaying = false;
    lofiWidget.classList.remove('playing');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    trackTitle.textContent = 'Midnight Coffee • Chill Tape';

    if (lofiAudio) {
      lofiAudio.pause();
    }
    if (synthLoFiTimer) {
      clearTimeout(synthLoFiTimer);
    }
  }
}

if (lofiPlayBtn) {
  lofiPlayBtn.addEventListener('click', toggleLoFiPlay);
}

// 4. Funko Avatar con Cambio Automático de Pose
const funkoWrapper = document.getElementById('funkoWrapper');
const funkoImg = document.getElementById('funkoImg');

if (funkoImg) {
  function switchFunkoPose() {
    const currentPose = funkoImg.getAttribute('data-pose');
    
    // Animación pop al cambiar
    funkoImg.classList.remove('funko-pop');
    void funkoImg.offsetWidth; // Reiniciar animación
    funkoImg.classList.add('funko-pop');

    if (currentPose === '2') {
      funkoImg.src = 'image/funko1.png';
      funkoImg.setAttribute('data-pose', '1');
    } else {
      funkoImg.src = 'image/funko2.png';
      funkoImg.setAttribute('data-pose', '2');
    }
  }

  // Cambio automático cada 3.5 segundos
  setInterval(switchFunkoPose, 3500);

  // También permite hacer clic para cambiarlo inmediatamente si se desea
  if (funkoWrapper) {
    funkoWrapper.addEventListener('click', switchFunkoPose);
  }
}

// 5. Máquina de Escribir Dinámica (Typewriter Effect)
const typewriterElement = document.getElementById('typewriterText');
const phrases = [
  'HELLO WORLD!',
  'WILL SALINAS',
  'CREATIVE DEVELOPER',
  'UI/UX ENTHUSIAST',
  'BUILDING THE WEB ⚡'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
  if (!typewriterElement) return;

  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typeSpeed = 45;
  } else {
    typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typeSpeed = 90;
  }

  if (!isDeleting && charIndex === currentPhrase.length) {
    isDeleting = true;
    typeSpeed = 1800; // Pausa al completar la frase
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 400; // Pausa antes de la siguiente frase
  }

  setTimeout(typeWriter, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
  typeWriter();
  initDemoModal();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  typeWriter();
  initDemoModal();
}

// 6. Controlador del Modal de Video Demostración (Proyectos)
function initDemoModal() {
  const demoModal = document.getElementById('demoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const openDemoBtns = document.querySelectorAll('.open-demo-btn');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const modalVideoSource = document.getElementById('modalVideoSource');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectTags = document.getElementById('modalProjectTags');
  const modalProjectDesc = document.getElementById('modalProjectDesc');
  const modalProjectFeatures = document.getElementById('modalProjectFeatures');
  const modalGithubBtn = document.getElementById('modalGithubBtn');

  if (!demoModal) return;

  // Abrir Modal con datos del proyecto
  openDemoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playBeep(980, 0.05);

      const title = btn.getAttribute('data-title') || 'Demostración de Proyecto';
      const tags = (btn.getAttribute('data-tags') || '').split(',');
      const desc = btn.getAttribute('data-desc') || '';
      const features = (btn.getAttribute('data-features') || '').split('|');
      const videoSrc = btn.getAttribute('data-video') || '';
      const githubUrl = btn.getAttribute('data-github') || 'https://github.com/willwolfs';

      // Llenar campos
      if (modalProjectTitle) modalProjectTitle.textContent = title;
      if (modalProjectDesc) modalProjectDesc.textContent = desc;
      if (modalGithubBtn) modalGithubBtn.href = githubUrl;

      // Inyectar Tags
      if (modalProjectTags) {
        modalProjectTags.innerHTML = '';
        tags.forEach(tag => {
          if (tag.trim()) {
            const span = document.createElement('span');
            span.className = 'tech-tag';
            span.textContent = tag.trim();
            modalProjectTags.appendChild(span);
          }
        });
      }

      // Inyectar Aspectos Destacados
      if (modalProjectFeatures) {
        modalProjectFeatures.innerHTML = '';
        features.forEach(feat => {
          if (feat.trim()) {
            const li = document.createElement('li');
            li.textContent = feat.trim();
            modalProjectFeatures.appendChild(li);
          }
        });
      }

      // Cargar Video y Reproducir
      if (modalVideoPlayer && modalVideoSource && videoSrc) {
        modalVideoSource.src = videoSrc;
        modalVideoPlayer.load();
        modalVideoPlayer.play().catch(() => {
          // Si el navegador bloquea autoplay, se mantiene pausado con controles
        });
      }

      // Mostrar modal
      demoModal.classList.add('active');
      demoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    });
  });

  // Función para cerrar modal
  function closeModal() {
    demoModal.classList.remove('active');
    demoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restaurar scroll
    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      modalVideoPlayer.currentTime = 0;
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  // Cerrar al hacer clic fuera de la ventana modal
  demoModal.addEventListener('click', (e) => {
    if (e.target === demoModal) {
      closeModal();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && demoModal.classList.contains('active')) {
      closeModal();
    }
  });

  // 7. Filtros de Categorías de Proyectos
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playBeep(1200, 0.04);
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter') || 'all';

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}