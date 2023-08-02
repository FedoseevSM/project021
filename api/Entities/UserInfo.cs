using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Web.Entities
{
    public class UserInfo    {
        
        [Key] public int UserId { get; set; }
        
        public string City { get; set; }
        
        [Column("tags", TypeName = "varchar[]")] public string[] Tags { get; set; }
        
        [Column("links", TypeName = "varchar[]")] public string[] Links { get; set; }
        
        [Column("skills", TypeName = "varchar[]")] public string[] Skills { get; set; }
        
        public string Education { get; set; }
        
        public DateTime? Updated { get; set; }
    }
}