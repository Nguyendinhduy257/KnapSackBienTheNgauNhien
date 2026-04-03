document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.item-card');
    const backpackZone = document.getElementById('backpack-zone');
    const sourceZone = document.getElementById('source-zone');
    const maxCapacity = parseInt(document.getElementById('max-capacity').textContent);

    //
    // HỆ THỐNG ÂM THANH (Dùng Web Audio API, không cần file mp3)
    //
    function playDropSound(isError = false) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return; // Trình duyệt không hỗ trợ

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        if (isError) {
            // Âm thanh báo lỗi (quá tải)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
        } else {
            // Âm thanh thả thành công (tít nhẹ)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        }

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    // 
    // KÉO THẢ VÀ TỰ ĐỘNG CUỘN TRANG KHI DI ĐẾN RÌA CỦA TRANG
    // 
    document.addEventListener('dragover', (e) => {
        const scrollSpeed = 15;
        const edgeSize = 50;
        if (e.clientY < edgeSize) window.scrollBy(0, -scrollSpeed);
        else if (window.innerHeight - e.clientY < edgeSize) window.scrollBy(0, scrollSpeed);
    });

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
    });

    setupDropZone(backpackZone);
    setupDropZone(sourceZone);

    function setupDropZone(zone) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const itemId = e.dataTransfer.getData('text/plain');
            const draggableElement = document.getElementById(itemId);

            if (draggableElement) {
                zone.appendChild(draggableElement);
                updateStatus();
            }
        });
    }

    // 
    // CẬP NHẬT UI: PROGRESS BAR & DONUT CHART
    // 
    function updateStatus() {
        let currentWeight = 0;
        let currentValue = 0;

        const weightDisplay = document.getElementById('current-weight');
        const progressBar = document.getElementById('weight-progress');
        const donutChart = document.getElementById('capacity-donut');
        const donutText = document.getElementById('donut-text');

        backpackZone.classList.remove('zone-overweight');
        document.querySelectorAll('.item-card').forEach(item => item.classList.remove('item-overweight'));

        backpackZone.querySelectorAll('.item-card').forEach(item => {
            let itemWeight = parseInt(item.dataset.weight);
            currentWeight += itemWeight;
            currentValue += parseInt(item.dataset.value);

            if (currentWeight > maxCapacity) {
                item.classList.add('item-overweight');
            }
        });

        // Cập nhật text
        weightDisplay.textContent = currentWeight;
        document.getElementById('current-value').textContent = '$' + currentValue;

        // Tính % hiển thị cho Progress bar và Donut Chart
        let percent = (currentWeight / maxCapacity) * 100;
        let displayPercent = percent > 100 ? 100 : percent;

        progressBar.style.width = displayPercent + '%';
        donutChart.style.setProperty('--percent', displayPercent + '%');
        donutText.textContent = Math.round(percent) + '%';

        // Xử lý logic Quá tải
        if (currentWeight > maxCapacity) {
            progressBar.classList.add('overloaded');
            donutChart.style.background = `conic-gradient(#e74c3c 0%, #e74c3c var(--percent), #2c3e50 var(--percent), #2c3e50 100%)`;
            backpackZone.classList.add('zone-overweight');
            playDropSound(true); // Tiếng báo lỗi
        } else {
            progressBar.classList.remove('overloaded');
            donutChart.style.background = `conic-gradient(#FFD700 0%, #FFD700 var(--percent), #2c3e50 var(--percent), #2c3e50 100%)`;
            if (currentWeight > 0) playDropSound(false); // Tiếng píp thành công
        }
    }

    //
    // AI XẾP ĐỒ VỚI HIỆU ỨNG ANIMATION DELAY BAY VÀO LẦN LƯỢT
    // 
    document.getElementById('btn-ai-solve').addEventListener('click', () => {
        const btn = document.getElementById('btn-ai-solve');
        btn.disabled = true;
        btn.innerText = "⏳ Đang tính toán...";

        fetch('/Knapsack/GiaiQuyetBangAI', { method: 'POST' })
            .then(response => response.json()) //Bóc tách mảng [1,0,1...] ra khỏi hộp Return.OK
            .then(boGen => {
                // Biến "boGen" bây giờ là đại diện cho "PhươngAnTotNhat" từ phía Controller
                items.forEach(item => sourceZone.appendChild(item));
                updateStatus();

                let delay = 0;
                items.forEach((item, index) => {
                    // Nếu AI chọn nhặt (bằng 1), cho thẻ tự động bay vào Balo lần lượt
                    if (boGen[index] === 1) { //Nếu AI bảo nhặt (1)
                        setTimeout(() => {
                            backpackZone.appendChild(item);// Cho thẻ bay vào Balo
                            updateStatus();
                        }, delay);
                        delay += 500; // Mỗi thẻ cách nhau 0.3s
                    }
                });

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerText = "Tự động xếp bằng AI";
                }, delay + 300);
            });
    });

    // Khởi tạo lần đầu
    updateStatus();
});