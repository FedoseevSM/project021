using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.Entities;

namespace Web.Controllers
{
    [Controller]
    public abstract class BaseController : ControllerBase
    {
        // returns the current authenticated users (null if not logged in)
        public User Account => (User)HttpContext.Items["Account"];
    }
}
