using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Onbo_Vishal.Server.Dtos;
using Onbo_Vishal.Server.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Onbo_Vishal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly OnboardingContext _context;

        private readonly ILogger<SalesController> _logger;

        public SalesController(OnboardingContext context, ILogger<SalesController> logger)
        {
            _context = context;
            _logger = logger;
        }
        // GET: api/Sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales()
        {
            var sales = await _context.Sales
                .Include(s => s.Customer)
                .Include(s => s.Product)
                .Include(s => s.Store)
                .ToListAsync();

            var salesDto = sales.Select(s => new SaleDto
            {
                Id = s.Id,
                saleDate = s.saleDate,
                CustomerId = s.CustomerId,
               // CustomerName = s.Customer?.Name, // Use ?. to handle nulls safely
                ProductId = s.ProductId,
               // ProductName = s.Product?.Name,
                StoreId = s.StoreId,
               // StoreName = s.Store?.Name,
                TotalPrice = s.Product?.Price ?? 0, // Using Product's price or 0 if null
                Products = new List<ProductDto>
        {
            new ProductDto
            {
                Id = s.ProductId,
                Name = s.Product?.Name,
                Price = s.Product?.Price ?? 0
            }
        }
            }).ToList();

            return Ok(salesDto);
        }


        // GET: api/Sales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SaleDto>> GetSale(int id)
        {
            var sale = await _context.Sales
                .Include(s => s.Customer)
                .Include(s => s.Product)
                .Include(s => s.Store)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                return NotFound();
            }

            var saleDto = new SaleDto
            {
                Id = sale.Id,
               // ProductName = sale.Product.Name,
                saleDate = sale.saleDate,
                CustomerId = sale.CustomerId,
                ProductId = sale.ProductId,
                StoreId = sale.StoreId
            };

            return saleDto;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSale(int id, SaleDto saleDto)
        {
            _logger.LogInformation($"Received Sale - CustomerId: {saleDto.CustomerId}, ProductId: {saleDto.ProductId}, StoreId: {saleDto.StoreId}, SaleDate: {saleDto.saleDate}");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != saleDto.Id)
            {
                return BadRequest();
            }

            // Fetch the existing sale from the database
            var sale = await _context.Sales.FindAsync(id);
            if (sale == null)
            {
                return NotFound();
            }

            // Update the properties of the existing sale
            sale.ProductId = saleDto.ProductId;
            sale.saleDate = saleDto.saleDate;
            sale.CustomerId = saleDto.CustomerId;
            sale.StoreId = saleDto.StoreId;

            try
            {
                // Save changes to the database
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SaleExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Sales
        [HttpPost]
        public async Task<IActionResult> PostSale([FromBody] SaleDto saleDto)
        {
            
_logger.LogInformation($"Received Sale - CustomerId: {saleDto.CustomerId}, ProductId: {saleDto.ProductId}, StoreId: {saleDto.StoreId}, SaleDate: {saleDto.saleDate}");            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var customerExists = await _context.Customers.AnyAsync(c => c.Id == saleDto.CustomerId);
            var productExists = await _context.Products.AnyAsync(p => p.Id == saleDto.ProductId);
            var storeExists = await _context.Stores.AnyAsync(s => s.Id == saleDto.StoreId);

            //if (!customerExists || !productExists || !storeExists)
            //{
            //    return BadRequest("Invalid CustomerId, ProductId, or StoreId.");
            //}
            var sale = new Sale
            {
                CustomerId = saleDto.CustomerId,
                ProductId = saleDto.ProductId,
                StoreId = saleDto.StoreId,
                saleDate = saleDto.saleDate,
                
               
                // TotalPrice is calculated separately if needed
            };

            // Save the sale entity to the database
            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, sale);
        }

        
        // DELETE: api/Sales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            var sale = await _context.Sales.FindAsync(id);
            if (sale == null)
            {
                return NotFound();
            }

            _context.Sales.Remove(sale);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SaleExists(int id)
        {
            return _context.Sales.Any(e => e.Id == id);
        }
    }
}
