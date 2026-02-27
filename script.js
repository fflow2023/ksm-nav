document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects-container");

  // 检查配置是否存在
  if (typeof ksmConfig !== "undefined" && ksmConfig.projects) {
    // 动态渲染项目的按钮
    ksmConfig.projects.forEach((project, index) => {
      const card = document.createElement("a");
      card.href = project.url;
      card.className = "project-card";

      // 动态设置背景渐变阴影（根据配置文件）
      card.style.background = project.color;
      if (project.shadow) {
        card.style.boxShadow = `0 12px 25px ${project.shadow}`;
      }

      // 列表依次浮现的动画延迟
      card.style.animation = `fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${index * 0.15}s`;
      card.style.opacity = "0";

      const title = document.createElement("h2");
      title.className = "project-title";
      title.textContent = project.title;

      const desc = document.createElement("p");
      desc.className = "project-desc";
      desc.textContent = project.description;

      card.appendChild(title);
      card.appendChild(desc);
      container.appendChild(card);
    });
  } else {
    console.error(
      "Configuration not found. Make sure config.js is loaded correctly.",
    );
    container.innerHTML =
      '<p style="text-align: center; color: var(--primary-color);">Failed to load configuration!</p>';
  }

  // 增加鼠标移过星星时的互动效果
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("mouseover", () => {
      star.style.transform = "scale(1.5) rotate(180deg)";
      star.style.transition = "transform 0.3s ease";
      setTimeout(() => {
        star.style.transform = "";
      }, 300);
    });
  });

  // 拖动和点击切换 Pico 小人的逻辑
  const picoImg = document.getElementById("pico-img");
  if (picoImg) {
    let isDragging = false;
    let isClick = true;
    let startX, startY, initialRight, initialBottom;

    // Pico 小人图片数组
    const picoImages = [
      "assets/ksm_pico1.png",
      "assets/ksm_pico2.png",
      "assets/ksm_pico3.png",
    ];
    let currentPicoIndex = 0;

    picoImg.addEventListener("mousedown", (e) => {
      isDragging = true;
      isClick = true; // 每次按下时默认认为是点击

      // 记录鼠标初始位置
      startX = e.clientX;
      startY = e.clientY;

      // 获取当前元素的计算样式
      const style = window.getComputedStyle(picoImg);
      initialRight = parseInt(style.right, 10);
      initialBottom = parseInt(style.bottom, 10);

      e.preventDefault(); // 防止默认的拖放行为（特别是在图片上）
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      // 计算鼠标移动的距离
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // 如果移动距离超过一小段阈值，则认为是拖动，不再是点击
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isClick = false;
      }

      // 因为使用的是 right 和 bottom 定位，坐标系是反的
      // 鼠标向右(dx>0)，right 值应该减小；鼠标向下(dy>0)，bottom 值应该减小
      picoImg.style.right = `${initialRight - dx}px`;
      picoImg.style.bottom = `${initialBottom - dy}px`;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;

        // 如果没有发生明显拖动，则执行点击逻辑切换图片
        if (isClick && picoImg) {
          currentPicoIndex = (currentPicoIndex + 1) % picoImages.length;
          picoImg.src = picoImages[currentPicoIndex];
        }
      }
    });

    // 当鼠标移出窗口时也停止拖动
    document.addEventListener("mouseleave", () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  }
});
