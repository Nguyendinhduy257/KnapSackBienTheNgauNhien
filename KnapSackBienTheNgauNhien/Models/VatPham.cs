namespace KnapSackBienTheNgauNhien.Models
{
    public class VatPham
    {
        public int Id { get; set; }
        public string Ten { get; set; }
        public int TrongLuong { get; set; }
        public int GiaTri { get; set; }
        //nếu Tỷ lệ bằng 0 thì sẽ không chọn vật phẩm đó vào balo
        public double TyLe =>TrongLuong==0 ? 0 : (double)GiaTri / TrongLuong;
    }
}
