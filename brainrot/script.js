const screenshotConfig = {
    iphone: {
        en: { prefix: 'images/ScreenShot-iPhone/', count: 8, aspect: 'iphone' },
        zh: { prefix: 'images/ScreenShot-iPhone-Chinese/', count: 8, aspect: 'iphone' }
    },
    ipad: {
        en: { prefix: 'images/ScreenShot-iPad/', count: 8, aspect: 'ipad' },
        zh: { prefix: 'images/ScreenShot-iPad-Chinese/', count: 8, aspect: 'ipad' }
    }
};

let currentDevice = 'iphone';
let currentLang = 'en';
let currentScreenshotIndex = 0;
let currentScreenshots = [];

const galleryEl = document.getElementById('screenshotsGallery');
const lightboxEl = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxMeta = document.getElementById('lightboxMeta');

function renderGallery() {
    const config = screenshotConfig[currentDevice][currentLang];
    currentScreenshots = [];

    let html = '';
    for (let i = 1; i <= config.count; i++) {
        const src = config.prefix + i + '.webp';
        currentScreenshots.push(src);
        html += `<div class="screenshot-item ${config.aspect}" data-index="${i - 1}">
            <img src="${src}" alt="Screenshot ${i}" loading="lazy">
        </div>`;
    }

    galleryEl.innerHTML = html;

    galleryEl.querySelectorAll('.screenshot-item').forEach(item => {
        item.addEventListener('click', () => {
            openLightbox(parseInt(item.dataset.index, 10));
        });
    });
}

function openLightbox(index) {
    currentScreenshotIndex = index;
    updateLightbox();
    lightboxEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightboxEl.classList.remove('active', 'promo-mode');
    document.body.style.overflow = '';
}

function updateLightbox() {
    const src = currentScreenshots[currentScreenshotIndex];
    lightboxImg.src = src;
    lightboxCounter.textContent = `${currentScreenshotIndex + 1} / ${currentScreenshots.length}`;

    const deviceLabel = currentDevice === 'iphone' ? 'iPhone' : 'iPad';
    const langLabel = currentLang === 'en' ? 'English' : '中文';
    lightboxMeta.textContent = `${deviceLabel} · ${langLabel}`;
}

function nextScreenshot() {
    currentScreenshotIndex = (currentScreenshotIndex + 1) % currentScreenshots.length;
    updateLightbox();
}

function prevScreenshot() {
    currentScreenshotIndex = (currentScreenshotIndex - 1 + currentScreenshots.length) % currentScreenshots.length;
    updateLightbox();
}

/* Filter buttons */
document.querySelectorAll('[data-filter-device]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-device]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDevice = btn.dataset.filterDevice;
        renderGallery();
    });
});



/* Promo images lightbox */
document.querySelectorAll('.promo-image').forEach(el => {
    el.addEventListener('click', () => {
        const img = el.querySelector('img');
        if (!img) return;
        openLightboxSimple(img.src);
    });
});

function openLightboxSimple(src) {
    lightboxImg.src = src;
    lightboxCounter.textContent = '';
    lightboxMeta.textContent = '';
    lightboxEl.classList.add('active', 'promo-mode');
    document.body.style.overflow = 'hidden';
}

/* Lightbox controls */
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    prevScreenshot();
});
document.querySelector('.lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation();
    nextScreenshot();
});

lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) {
        closeLightbox();
    }
});

/* Keyboard support */
document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight' && !lightboxEl.classList.contains('promo-mode')) {
        nextScreenshot();
    } else if (e.key === 'ArrowLeft' && !lightboxEl.classList.contains('promo-mode')) {
        prevScreenshot();
    }
});

/* Init */
renderGallery();

// 文件清单展开/折叠
document.getElementById('manifestToggle1').addEventListener('click', function() {
    document.getElementById('manifestList1').classList.toggle('expanded');
    this.classList.toggle('expanded');
});

document.getElementById('manifestToggle2').addEventListener('click', function() {
    document.getElementById('manifestList2').classList.toggle('expanded');
    this.classList.toggle('expanded');
});

// 下载按钮：触发 ZIP 下载
document.getElementById('downloadBtn1').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = 'PressKit1.zip';
    link.download = 'PressKit1.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById('downloadBtn2').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = 'PressKit2.zip';
    link.download = 'PressKit2.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

/* ===== Global Language Switcher ===== */
let currentLangGlobal = 'en';

document.querySelectorAll('[data-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
        const newLang = btn.dataset.switch;
        if (newLang === currentLangGlobal) return;

        currentLangGlobal = newLang;

        // 更新切换按钮 active 状态
        document.querySelectorAll('[data-switch]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 切换所有 [data-lang] 元素的可见性
        document.querySelectorAll('[data-lang]').forEach(el => {
            if (el.dataset.lang === newLang) {
                el.classList.remove('lang-hidden');
            } else {
                el.classList.add('lang-hidden');
            }
        });

        // 同步截图画廊
        currentLang = newLang;
        renderGallery();
    });
});

// 移动端菜单切换
document.querySelector('.navbar-toggle').addEventListener('click', () => {
    document.querySelector('.navbar-links').classList.toggle('active');
});

// 点击导航链接后关闭菜单
document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.navbar-links').classList.remove('active');
    });
});

// 滚动入场动画
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

/* ===== Video Error Handling & Click-to-Play ===== */
document.querySelectorAll('.video-card video').forEach(video => {
    const card = video.closest('.video-card');
    const wrapper = video.closest('.video-wrapper');

    // 视频加载错误检测
    video.addEventListener('error', () => {
        if (!video.error) return;
        // 忽略临时中止错误（如浏览器优化导致的延迟加载）
        if (video.error.code === 1) return;

        let msg = 'Video failed to load';
        switch (video.error.code) {
            case 2: msg = 'Network error — video could not be downloaded'; break;
            case 3: msg = 'Video decoding error — file may be corrupted or use an unsupported codec'; break;
            case 4: msg = 'Video format not supported by this browser'; break;
        }
        showVideoError(wrapper, msg);
    });

    // 检测编码问题：有声音但无画面（播放但视频尺寸为0）
    video.addEventListener('play', () => {
        // 延迟检查，给视频一点加载时间
        setTimeout(() => {
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                showVideoError(wrapper, 'Video codec not supported — please re-encode to H.264');
            }
        }, 500);
    });

    // 点击视频区域播放/暂停（作为 controls 备选）
    wrapper.addEventListener('click', (e) => {
        // 避免与 controls 本身的点击冲突
        if (e.target === video || e.target === wrapper) {
            if (video.paused) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        }
    });
});

function showVideoError(wrapper, message) {
    if (wrapper.querySelector('.video-error')) return;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'video-error';
    errorDiv.innerHTML = `<span>⚠ ${message}</span>
        <span class="video-error-sub">If this file was exported from iPhone, re-encode with H.264 codec</span>`;
    wrapper.appendChild(errorDiv);
}

/* ===== Theme Toggle ===== */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}
