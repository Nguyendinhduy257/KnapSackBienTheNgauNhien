using KnapSackBienTheNgauNhien.Models;
using Microsoft.AspNetCore.Mvc;

namespace KnapSackBienTheNgauNhien.Controllers
{
    public class KnapsackController : Controller
    {
        //lưu trữ tạm thời trong bộ nhớ
        public static List<VatPham> _danhSachVatPham=new List<VatPham>();
        public static int _sucChuaBaLo = 50;//sức chứa của balo
        //màn hình khởi tạo cho n = 10 vật phẩm (được cho các giá trị ngẫu nhiên)
        public IActionResult Index()
        {
            return View();
        }
        //Một khi đã chốt 10 vật phẩm, thì hệ thống sẽ kiểm tra danh sách NULL??
        //Nếu Danh sách OK và không NULL thì lưu trữ vật phẩm đã chốt từ JS gửi lên
        [HttpPost]
        public IActionResult LuuTruVatPham([FromBody] List<VatPham> danhSach)
        {
            if (danhSach != null && danhSach.Count > 0)
            {
                _danhSachVatPham = danhSach;
                return Ok(new { success = true });
            }
            //trả về kết quả lỗi 400 nếu dữ liệu không hợp lệ
            return BadRequest();
        }
        //Màn hình chơi (Kéo thả thủ công hoặc AI)
        //Đưa đến giao diện của Bước 2, tại đây sẽ có thêm 1 ngăn Balo đang rỗng túi của người chơi
        public IActionResult Game()
        {
            ViewBag.SucChua=_sucChuaBaLo;
            return View(_danhSachVatPham);
        }

        //
        // Thuật toán Random Search giải quyết bài toán KnapSack
        //
        [HttpPost]
        //vòng lặp [i] : Lượt quay ngẫu nhiên, quay liên tục 10,000 lần
        //(Tạo ra 10.000 ván chơi)
        // Ra mặt ngửa (1): nhặt vật phẩm [ j ] vào Balo
        // Ra mặt sấp  (0): Bỏ qua vật phẩm  [ j ] này
        public IActionResult GiaiQuyetBangAI(int soLanLap = 10000)
        {
            int soLuong=_danhSachVatPham.Count;
            int giaTriTotNhat = 0;
            int[] phuongAnTotNhat = new int[soLuong];
            Random rnd=new Random();
            //vòng lặp [i] : Lượt quay ngẫu nhiên, quay liên tục 10,000 lần
            //(Tạo ra 10.000 ván chơi)
            for (int i = 0; i < soLanLap; i++)
            {
                int[] phuongAnHienTai =new int[soLuong];
                int tongTrongLuong = 0;
                int tongGiaTri = 0;
                //vòng lặp [j]: Lặp qua từng vật phẩm trong 1 lượt quay (Để quyết định nhặt hay bỏ món đó)
                for (int j=0;j<soLuong; j++)
                {
                    //mỗi vật phẩm được chọn ngẫu nhiên
                    //Mặt ngửa ( 1 ): chọn vật phẩm [j] vào Balo
                    //Mặt sấp ( 0 ): bỏ qua vật phẩm [j] này
                    phuongAnHienTai[j] = rnd.Next(0, 2); //0 hoặc 1
                    //Nếu vật phẩm được gắn là "Lấy vật phẩm này"
                    if (phuongAnHienTai[j] == 1)
                    {
                        //cập nhật Balo chứa các vật phẩm cho vàng lặp [ j ]
                        tongTrongLuong += _danhSachVatPham[j].TrongLuong;
                        tongGiaTri+= _danhSachVatPham[j].GiaTri;
                    }
                }
                //thỏa mãn ĐK trọng lượng không vượt quá sức chứa và giá trị phải lớn hơn giá trị tốt nhất hiện tại
                //--> ta cập nhật phương án tốt nhất và giá trị tốt nhất trong lịch sử chạy
                if (tongTrongLuong<= _sucChuaBaLo && tongGiaTri > giaTriTotNhat)
                {
                    giaTriTotNhat = tongGiaTri;
                    Array.Copy(phuongAnHienTai, phuongAnTotNhat, soLuong);
                }
                // Nếu Else (quá tải) --> Vứt bỏ vòng lặp [i] lỗi và không cập nhật gì cả
            }
            return Ok(phuongAnTotNhat);
        }
    }
}
