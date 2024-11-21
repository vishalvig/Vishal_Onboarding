using System;
using System.Collections.Generic;

namespace Onbo_Vishal.Server.Models;

public partial class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Price { get; set; }
  
    public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
