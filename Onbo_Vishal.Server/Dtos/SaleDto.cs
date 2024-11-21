

using System.ComponentModel.DataAnnotations.Schema;

namespace Onbo_Vishal.Server.Dtos
{
    public class SaleDto
    {
        public int Id { get; set; }
        // public string ProductName { get; set; }  // Add this property if you want to include product names
        // public decimal Price { get; set; }
       
        public int StoreId { get; set; }
       
        public int ProductId { get; set; }

        public int CustomerId { get; set; }
       // [Column(TypeName = "datetime2")]
        public DateTime? saleDate { get; set; }
        public decimal TotalPrice { get; set; }
        public List<ProductDto> ?Products { get; set; }
    }
}
