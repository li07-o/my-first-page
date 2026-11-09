/* =====================================================
   岩彩艺术 - JavaScript交互脚本
   功能：导航栏、轮播图、返回顶部、表单验证等
   ===================================================== */


/* ========== DOM 加载完成后执行 ========== */
document.addEventListener('DOMContentLoaded', function () {
    
    // 1. 初始化导航栏效果
    initHeader();

    // 2. 初始化移动端菜单
    initMobileMenu();

    // 3. 初始化轮播图
    initCarousel();

    // 4. 初始化导航栏滚动高亮
    initScrollHighlight();

    // 5. 初始化返回顶部按钮
    initBackToTop();

    // 6. 初始化表单提交
    initContactForm();

});


/* ========== 1. 导航栏滚动效果 ========== */
function initHeader() {
    const header = document.querySelector('.header');

    // 监听滚动事件
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(107, 68, 35, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(107, 68, 35, 0.1)';
        }
    });
}


/* ========== 2. 移动端菜单切换 ========== */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    // 点击汉堡按钮切换菜单
    menuToggle.addEventListener('click', function () {
        nav.classList.toggle('open');
        const icon = menuToggle.querySelector('i');
        if (nav.classList.contains('open')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // 点击导航链接后关闭菜单
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            nav.classList.remove('open');
            menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });
}


/* ========== 3. 轮播图功能（堆叠卡片效果） ==========
 * 5张图片围绕当前图片水平排列：
 *   - 中心图片：最大、最清晰、最前
 *   - 左右两侧图片：依次缩小、变暗、靠后
 * JS 通过 inline style 直接控制每张卡片的位置和状态
 * ============================================== */
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carousel = document.getElementById('carousel');
    let currentIndex = 2;        // 默认选中中间那张（索引从0开始）
    let autoPlayTimer = null;
    const total = slides.length; // 总数量（本例5张）

    /**
     * 根据每张卡片相对于currentIndex的"距离"，
     * 计算它应当呈现的 offsetX / scale / opacity / zIndex
     */
    function updateCarousel() {
        // 根据窗口宽度动态调整偏移步长，防止小屏溢出
        const viewportW = window.innerWidth;
        // 基准步长：大屏幕240px → 小屏幕按比例缩小
        const baseStep = viewportW <= 480 ? 140 : viewportW <= 768 ? 180 : 240;

        slides.forEach((slide, index) => {
            /*
             * diff = 每张卡片到"当前卡片"的顺时针距离（0 ~ total-1）
             *   diff=0        → 当前卡片
             *   diff=1        → 右侧第一张
             *   diff=2        → 右侧第二张
             *   diff=total-1  → 左侧第一张（等价于 -1）
             *   diff=total-2  → 左侧第二张（等价于 -2）
             */
            const diff = ((index - currentIndex) + total) % total;

            // 把 diff 转成 "带方向的相对位置"（正数=右，负数=左）
            let side;
            if (diff === 0) {
                side = 0;
            } else if (diff <= Math.floor(total / 2)) {
                side = diff;                 // 右侧：+1, +2 ...
            } else {
                side = diff - total;          // 左侧：-1, -2 ...
            }
            const distance = Math.abs(side);  // 0, 1, 2 ...

            /* ----- 根据 distance 计算视觉属性 ----- */

            // 1. 水平偏移量（px）：距离越远，越靠边
            let offsetX = 0;
            if (distance === 1) offsetX = baseStep * 1.0 * Math.sign(side);
            if (distance === 2) offsetX = baseStep * 1.8 * Math.sign(side);
            if (distance >= 3) offsetX = baseStep * 2.8 * Math.sign(side);

            // 2. 缩放：中心=1.0，左右第1张=0.85，第2张=0.65，更远=0.5
            let scale = 1;
            if (distance === 1) scale = 0.85;
            if (distance === 2) scale = 0.65;
            if (distance >= 3) scale = 0.5;

            // 3. 透明度：中心=1，依次递减
            let opacity = 1;
            if (distance === 1) opacity = 0.7;
            if (distance === 2) opacity = 0.35;
            if (distance >= 3) opacity = 0;   // 完全隐藏

            // 4. 层级：中心最前，两侧依次靠后
            let zIndex = 10 - distance;        // 10, 9, 8 ...

            /* ----- 设置 inline style ----- */
            // 基础 transform 是 translate(-50%, -50%)（来自CSS），
            // 这里用 calc 在水平方向叠加额外偏移，再缩放
            slide.style.transform =
                `translate(calc(-50% + ${offsetX}px), -50%) scale(${scale})`;
            slide.style.opacity = opacity;
            slide.style.zIndex = zIndex;
            slide.style.pointerEvents = distance > 2 ? 'none' : 'auto';
        });
    }

    // 切换到上一张（← 左按钮）：中心往左移 → currentIndex - 1
    function prevSlide() {
        currentIndex = (currentIndex - 1 + total) % total;
        updateCarousel();
    }

    // 切换到下一张（→ 右按钮）：中心往右移 → currentIndex + 1
    function nextSlide() {
        currentIndex = (currentIndex + 1) % total;
        updateCarousel();
    }

    // 点击某张卡片 → 把它设为中心
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            stopAutoPlay();
            startAutoPlay();
        });
    });

    // 自动播放（每4秒切换一次）
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(nextSlide, 4000);
    }
    function stopAutoPlay() {
        if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
    }

    // 绑定按钮事件
    prevBtn.addEventListener('click', () => { prevSlide(); stopAutoPlay(); startAutoPlay(); });
    nextBtn.addEventListener('click', () => { nextSlide(); stopAutoPlay(); startAutoPlay(); });

    // 鼠标悬停时暂停自动播放
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // 键盘 ← → 切换
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { prevSlide(); }
        if (e.key === 'ArrowRight') { nextSlide(); }
    });

    // 窗口 resize 时重新计算
    window.addEventListener('resize', updateCarousel);

    // 首次渲染
    updateCarousel();
    startAutoPlay();
}


/* ========== 4. 导航栏滚动高亮 ========== */
function initScrollHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = 70;

    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY + headerHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                // 移除所有活跃状态
                navLinks.forEach(link => link.classList.remove('active'));
                
                // 添加当前区域的活跃状态
                const activeLink = document.querySelector('.nav-link[href="#' + sectionId + '"]');
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
}


/* ========== 5. 返回顶部按钮 ========== */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    const scrollThreshold = 400;

    // 监听滚动显示/隐藏
    window.addEventListener('scroll', function () {
        if (window.scrollY > scrollThreshold) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    // 点击返回顶部
    backToTop.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


/* ========== 6. 联系表单提交 ========== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // 获取表单数据
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const message = formData.get('message').trim();

        // 简单验证
        if (!name || !email || !message) {
            showToast('请填写所有必填项', 'error');
            return;
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('请输入有效的邮箱地址', 'error');
            return;
        }

        // 模拟提交成功
        showToast('消息发送成功！我们会尽快回复您。', 'success');
        form.reset();
    });
}


/* ========== 7. 轻量级Toast提示 ========== */
function showToast(message, type) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;

    // 添加样式
    toast.style.cssText = `
        position: fixed;
        top: 90px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        padding: 14px 28px;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#e74c3c' : '#8B6F47'};
        color: #fff;
        border-radius: 6px;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
    `;

    document.body.appendChild(toast);

    // 动画显示
    requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // 自动消失
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
}


/* ========== 8. 图片懒加载（简单实现） ========== */
(function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => observer.observe(img));
    }
})();