let currentItems = [];
let isGenerating = false;

// BƯỚC 1: KHAI BÁO BIẾN AUDIO CONTEXT TOÀN CỤC (CHỈ TẠO 1 LẦN)
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    // Trình duyệt (nhất là Chrome/Edge) thường chặn âm thanh cho đến khi người dùng tương tác.
    // Dòng này giúp đánh thức Audio nếu nó đang bị trình duyệt cho "ngủ".
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTickSound() {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'triangle';
    // Sử dụng audioCtx.currentTime để âm thanh phát ra NGAY LẬP TỨC không có độ trễ
    osc.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function generateRandomItems() {
    if (isGenerating) return;

    const container = document.getElementById('item-container');
    const btnGenerate = document.getElementById('btn-generate');
    const btnSubmit = document.getElementById('btn-submit');

    if (!container) return;

    // BƯỚC 2: KHỞI ĐỘNG HỆ THỐNG ÂM THANH NGAY KHI BẤM NÚT
    initAudio();

    isGenerating = true;
    if (btnGenerate) {
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = 'Đang quay số...';
        btnGenerate.style.opacity = '0.7';
    }
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.5';
    }

    container.innerHTML = '';
    currentItems = [];

    let delay = 0;
    const totalItems = 10;

    //danh sách tên vật phẩm ngẫu nhiên
    const danhSachTenVatPham = [
        "Súng lục 1911",
        "Súng lục Baretta M9A4",
        "Súng lục Desert Eagle .50",
        "Súng lục CZ-75",
        "Súng lục Walther PPK",
        "Súng lục Sig Sauer P226",
        "Súng lục Colt Python",
        "Súng lục Smith & Wesson M&P",
        "Súng lục Glock 17",
        "Súng lục Pit Viper 2011",
        "Mũ cối Level 3",
        "Áo Giáp Kevlar",
        "Giáp chống đạn Level 4",
        "Mũ ACH Level 3A",
        "Plate Carrier với tấm ceramic",
        "Mũ OPS-Core FAST",
        "Áo giáp mềm NIJ Level II",
        "Mũ beret đặc nhiệm",
        "Giáp vai chống sát thương",
        "Kính bảo hộ balistic",
        "Găng tay chống đạn",
        "Giày chống mảnh văng",
        "Balo chiến thuật",
        "Lựu đạn M67",
        "Bộ cứu thương (Medkit)",
        "Ống nhòm tầm xa",
        "Dao găm quân dụng",
        "Mặt nạ phòng độc",
        "Đèn pin chiến thuật",
        "Hộp đạn 9mm",
        "Bandage cứu thương",
        "Bình nước",
        "Súng trường AK-47",
        "Súng ngắn Glock 17",
        "Giáp chống đạn Level 4",
        "Kính nhìn đêm NVG",
        "Súng bắn tỉa M24",
        "Bom khói M18",
        "Thuốc giảm đau (Painkillers)",
        "Thiết bị theo dõi sức khỏe",
        "Hộp đạn 7.62mm",
        "Bộ dụng cụ sửa chữa",
        "Hộp đạn 5.56mm",
        "Áo ngụy trang",
        "Giày boots quân sự",
        "Dao đa năng Leatherman",
        "Pin dự phòng",
        "La bàn định vị"
    ];

    for (let i = 1; i <= totalItems; i++) {
        setTimeout(() => {
            const weight = Math.floor(Math.random() * 20) + 1;//Weight từ 1-20kg
            const value = Math.floor(Math.random() * 90) + 10;//Value từ 10-99$
            const ratio = (value / weight).toFixed(2); //tỷ lệ
            //bốc ngẫu nhiên 1 cái tên cho Vật phẩm
            // Math.random() sẽ bốc ngẫu nhiên 1 vị trí (index) từ 0 đến độ dài của danhSachTenVatPham
            const viTriNgauNhien = Math.floor(Math.random() * danhSachTenVatPham.length);
            const tenVatPham = danhSachTenVatPham[viTriNgauNhien];
            // Lưu trữ thông tin vật phẩm vào mảng hiện tại
            currentItems.push({
                Id: i,
                TrongLuong: weight,
                GiaTri: value,
                Ten: tenVatPham //gửi kèm tên để lưu
            });
            //Đưa thông tin vật phẩm ra thẻ và hiện lên màn hình giao diện
            const card = document.createElement('div');
            card.className = 'item-card';
            card.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.innerHTML = `
                <h4 style="color: #FFD700; font-size: 16px; margin-bottom: 10px;">${tenVatPham} (ID:${i})</h4>
                <p><strong>Khối lượng:</strong> ${weight} kg</p>
                <p><strong>Giá trị:</strong> $${value}</p>
                <p><strong>Tỷ lệ:</strong> ${ratio}</p>
            `;
            container.appendChild(card); //quảng thẻ lên màn hình giao diện

            // Âm thanh giờ đây sẽ gọi thẳng vào phần cứng, không cần khởi tạo lại
            playTickSound();

            if (i === totalItems) {
                if (btnGenerate) {
                    btnGenerate.disabled = false;
                    btnGenerate.innerHTML = 'Xoay ngẫu nhiên lại';
                    btnGenerate.style.opacity = '1';
                }
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.style.opacity = '1';
                }
                isGenerating = false;
            }
        }, delay);

        delay += 150; //độ chễ khi quay ra từng thẻ một
    }
}

function submitItems() {
    if (currentItems.length === 0 || isGenerating) return;

    fetch('/Knapsack/LuuTruVatPham', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItems)
    })
        .then(response => {
            //Nếu Phía Controller Return.OK() thì cho phép chuyển sang trang Game
            if (response.ok) {
                window.location.href = '/Knapsack/Game';
            } else {
                alert("Đã xảy ra lỗi khi lưu vật phẩm.");
            }
        });
}

document.addEventListener('DOMContentLoaded', generateRandomItems);