using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Web.Validations
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    sealed public class MaximumDigitsAttribute : ValidationAttribute
    {
        public int MaximumDigits { get; set; }

        public override bool IsValid(object value)
        {
            string digits = (string)value;

            char[] digitsArray = digits.ToCharArray();

            var count = digits.Where(n => n >= '0' && n <= '9').Count();

            if(count > MaximumDigits)
            {
                return false;
            }
            return true;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} can't contain more than {MaximumDigits} numbers";
        }
    }
}
