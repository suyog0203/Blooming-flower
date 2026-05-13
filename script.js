/**
 * Magical Interactive Flower Garden Animation
 * Designed with premium aesthetics, rich dynamic physics, and customizable sharing features.
 */

// --- STATE & CONFIG ---
const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Color palettes for beautiful premium flower petals
const petalPalettes = [
    ['#ff4099', '#ff7bc0', '#ffb0dc'], // Bright Magentas
    ['#9b5de5', '#bc85ff', '#dcb3ff'], // Electric Lavender
    ['#00f5d4', '#7bffd9', '#b3ffe8'], // Neon Teal
    ['#fee440', '#ffed7b', '#fff4b3'], // Radiant Gold
    ['#f15bb5', '#f78dda', '#fbe0f2'], // Rose Pink
    ['#ff70a6', '#ff9ebb', '#ffd1dc'], // Sunset Coral
];

// Arrays to track active animation objects
let stars = [];
let fireflies = [];
let stems = [];
let flowers = [];
let particles = [];

// --- INITIALIZE ENVIRONMENT ---
function initEnvironment() {
    stars = [];
    fireflies = [];
    
    // Generate static subtle background stars
    const numStars = Math.floor((width * height) / 4000);
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.7, // mostly in the upper sky
            radius: Math.random() * 1.2,
            alpha: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }

    // Generate floating ambient glowing fireflies
    const numFireflies = Math.floor(width / 35);
    for (let i = 0; i < numFireflies; i++) {
        fireflies.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1.5,
            color: Math.random() > 0.5 ? '#e2ff5c' : '#7dffb8',
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            angle: Math.random() * Math.PI * 2,
            angleSpeed: Math.random() * 0.02 - 0.01
        });
    }
}

// Handle window resizing gracefully
window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initEnvironment();
});

// --- ENTITY CLASSES ---

/**
 * Growing Flower Stem Class
 */
class Stem {
    constructor(startX, startY, targetX, targetY, palette) {
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.x = startX;
        this.y = startY;
        this.progress = 0;
        this.speed = 0.015 + Math.random() * 0.01;
        this.thickness = Math.random() * 3 + 4; // 4-7px thick
        this.color = '#2bb872'; // glowing emerald green
        this.points = [{ x: startX, y: startY }];
        this.controlPointX = (startX + targetX) / 2 + (Math.random() - 0.5) * 120;
        this.controlPointY = (startY + targetY) / 2;
        this.isFullyGrown = false;
        this.palette = palette;
    }

    update() {
        if (this.progress < 1) {
            this.progress += this.speed;
            if (this.progress > 1) this.progress = 1;

            // Quadratic bezier interpolation for natural organic curve
            const t = this.progress;
            const currentX = (1 - t) * (1 - t) * this.startX + 2 * (1 - t) * t * this.controlPointX + t * t * this.targetX;
            const currentY = (1 - t) * (1 - t) * this.startY + 2 * (1 - t) * t * this.controlPointY + t * t * this.targetY;

            this.points.push({ x: currentX, y: currentY });
            this.x = currentX;
            this.y = currentY;

            if (this.progress === 1 && !this.isFullyGrown) {
                this.isFullyGrown = true;
                // Trigger flower blossom at the tip
                flowers.push(new Flower(this.targetX, this.targetY, this.palette));
            }
        }
    }

    draw() {
        if (this.points.length < 2) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#48ff9e';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Draw elegant decorative leaves along the stem dynamically
        if (this.points.length > 10) {
            const midPoint = this.points[Math.floor(this.points.length * 0.5)];
            ctx.fillStyle = '#48ff9e';
            ctx.beginPath();
            ctx.ellipse(midPoint.x + 8, midPoint.y - 5, 12, 5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

/**
 * Blooming Flower Class
 */
class Flower {
    constructor(x, y, palette) {
        this.x = x;
        this.y = y;
        this.palette = palette || petalPalettes[Math.floor(Math.random() * petalPalettes.length)];
        this.petalCount = Math.floor(Math.random() * 6) + 7; // 7 to 12 petals
        this.maxSize = Math.random() * 25 + 30; // 30-55px max radius
        this.size = 0;
        this.bloomSpeed = 0.5 + Math.random() * 0.4;
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.hasSpawnedParticles = false;
        this.coreColor = Math.random() > 0.3 ? '#ffde21' : '#ff9e00';
    }

    update() {
        if (this.size < this.maxSize) {
            this.size += this.bloomSpeed;
            // Add subtle springy overshoot effect at bloom completion
            if (this.size >= this.maxSize && !this.hasSpawnedParticles) {
                this.size = this.maxSize;
                this.hasSpawnedParticles = true;
                this.burstPollen();
            }
        }
        this.rotation += this.rotationSpeed;
    }

    burstPollen() {
        const numPollen = Math.floor(Math.random() * 12) + 10;
        for (let i = 0; i < numPollen; i++) {
            const angle = (Math.PI * 2 / numPollen) * i + Math.random() * 0.5;
            const speed = Math.random() * 3 + 1;
            particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // upward bias
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? this.palette[0] : '#ffffff',
                alpha: 1,
                decay: Math.random() * 0.015 + 0.015
            });
        }
    }

    draw() {
        if (this.size <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw Outer Layer Petals
        ctx.shadowColor = this.palette[0];
        ctx.shadowBlur = 15;
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / this.petalCount) * i);
            ctx.beginPath();
            // Draw smooth stylized petal shape
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(this.size * 0.4, -this.size * 0.3, this.size, 0);
            ctx.quadraticCurveTo(this.size * 0.4, this.size * 0.3, 0, 0);
            
            // Rich gradient fill for petals
            const grad = ctx.createLinearGradient(0, 0, this.size, 0);
            grad.addColorStop(0, this.palette[1]);
            grad.addColorStop(1, this.palette[0]);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }

        // Draw Inner Overlay Petals (slightly smaller and rotated)
        const innerSize = this.size * 0.65;
        ctx.rotate(Math.PI / this.petalCount);
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / this.petalCount) * i);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(innerSize * 0.4, -innerSize * 0.3, innerSize, 0);
            ctx.quadraticCurveTo(innerSize * 0.4, innerSize * 0.3, 0, 0);
            ctx.fillStyle = this.palette[2];
            ctx.fill();
            ctx.restore();
        }

        // Draw Center Core (Glowing pistil/stigma)
        ctx.shadowColor = this.coreColor;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = this.coreColor;
        ctx.fill();

        // Core Texture Details
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// --- MAIN ANIMATION LOOP ---
function animate() {
    // Clear canvas with a beautiful gradient or rich transparent overlay for subtle motion trails
    ctx.fillStyle = '#05021a';
    ctx.fillRect(0, 0, width, height);

    // 1. Render Stars
    ctx.save();
    stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
            star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    });
    ctx.restore();

    // 2. Render Stems
    stems.forEach(stem => {
        stem.update();
        stem.draw();
    });

    // 3. Render Flowers
    flowers.forEach(flower => {
        flower.update();
        flower.draw();
    });

    // 4. Render Burst Particles
    ctx.save();
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gentle gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
    }
    ctx.restore();

    // 5. Render Ambient Fireflies
    ctx.save();
    fireflies.forEach(f => {
        f.angle += f.angleSpeed;
        f.x += f.vx + Math.cos(f.angle) * 0.3;
        f.y += f.vy + Math.sin(f.angle) * 0.3;

        // Wrap around boundaries
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        if (f.y > height + 10) f.y = -10;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.fill();
    });
    ctx.restore();

    requestAnimationFrame(animate);
}

// --- PLANTING HELPER ---
function plantFlowerAt(targetX, targetY) {
    // Choose a starting position at the bottom of the canvas, slightly offset from targetX
    const startX = targetX + (Math.random() - 0.5) * 80;
    const startY = height + 10;
    const palette = petalPalettes[Math.floor(Math.random() * petalPalettes.length)];
    stems.push(new Stem(startX, startY, targetX, targetY, palette));
}

// Automatically plant a beautiful starter garden layout
function triggerInitialGarden() {
    const count = Math.min(Math.floor(width / 150) + 2, 7);
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const targetX = (width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 40;
            const targetY = height * (0.45 + Math.random() * 0.25);
            plantFlowerAt(targetX, targetY);
        }, i * 300);
    }
}

// --- URL & SHARING CONTROLLER ---

// Extract URL search params to populate greeting dynamically
function loadGreetingFromURL() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const msg = params.get('msg');

    const titleEl = document.getElementById('greetingTitle');
    const msgEl = document.getElementById('greetingMessage');

    if (title) {
        titleEl.textContent = title;
        document.getElementById('customTitle').value = title;
    }
    if (msg) {
        msgEl.textContent = msg;
        document.getElementById('customMsg').value = msg;
    }
}

// Update URL parameters without reloading the page, enabling easy link sharing
function updateURLParams(title, msg) {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (msg) params.set('msg', msg);
    
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
}

// --- EVENT LISTENERS ---

// Plant a glowing flower wherever the user clicks on the canvas
canvas.addEventListener('click', (e) => {
    plantFlowerAt(e.clientX, e.clientY);
});

// "Bloom Garden" button triggers an exciting wave of blooming flowers
document.getElementById('bloomBtn').addEventListener('click', () => {
    const burstCount = 6;
    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
            const tx = Math.random() * (width - 100) + 50;
            const ty = height * (0.3 + Math.random() * 0.45);
            plantFlowerAt(tx, ty);
        }, i * 150);
    }
    
    // Slight button feedback animation
    const btn = document.getElementById('bloomBtn');
    btn.textContent = "🌸 Blooming! 🌸";
    setTimeout(() => {
        btn.textContent = "Bloom Garden";
    }, 1200);
});

// Modal Logic
const modal = document.getElementById('customModal');
const editBtn = document.getElementById('editBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveCustomBtn = document.getElementById('saveCustomBtn');

editBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

saveCustomBtn.addEventListener('click', () => {
    const newTitle = document.getElementById('customTitle').value.trim();
    const newMsg = document.getElementById('customMsg').value.trim();

    const titleEl = document.getElementById('greetingTitle');
    const msgEl = document.getElementById('greetingMessage');

    if (newTitle) titleEl.textContent = newTitle;
    if (newMsg) msgEl.textContent = newMsg;

    // Update URL query parameters so the user can easily copy and send the link to their friend
    updateURLParams(newTitle, newMsg);

    saveCustomBtn.textContent = "✨ Saved! ✨";
    setTimeout(() => {
        saveCustomBtn.textContent = "Save & View";
        modal.classList.remove('active');
    }, 600);
});

// Start Everything
initEnvironment();
loadGreetingFromURL();
animate();

// Give a brief delay before auto-spawning the starter garden for best presentation
setTimeout(triggerInitialGarden, 500);
