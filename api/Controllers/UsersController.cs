using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Web.Entities;
using Web.Models.User;
using Web.Services;

namespace Web.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : BaseController
    {
        private readonly ILogger _logger;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public UsersController(
            ILogger<AccountController> logger,
            IUserService userService,
            IMapper mapper)
        {
            _logger = logger;
            _userService = userService;
            _mapper = mapper;
        }

        [Authorize]
        [HttpGet]
        public ActionResult<IEnumerable<UserResponse>> GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }
        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserResponse>> GetById(int id)
        {
            // // users can get their own user and admins can get any user
            // if (id != Account.Id && Account.Role != Role.Admin)
            //     return Unauthorized(new { message = "Unauthorized" });

            var user = await _userService.GetById(id);
            return Ok(_mapper.Map<UserResponse>(user));
        }

        [Authorize(Role.Admin)]
        [HttpPost]
        public ActionResult<UserResponse> Create(CreateUserRequest model)
        {
            var user = _userService.Create(model);
            return Ok(user);
        }

        [Authorize]
        [HttpPut("{id:int}")]
        public ActionResult<UserResponse> Update(int id, UpdateUserRequest model)
        {
            // users can update their own user and admins can update any user
            if (id != Account.Id && Account.Role != Role.Admin)
                return Unauthorized(new { message = "Unauthorized" });

            // only admins can update role
            if (Account.Role != Role.Admin)
                model.Role = null;

            var user = _userService.Update(id, model);
            return Ok(user);
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            // users can delete their own user and admins can delete any user
            if (id != Account.Id && Account.Role != Role.Admin)
                return Unauthorized(new { message = "Unauthorized" });

            _userService.Delete(id);
            return Ok(new { message = "User deleted successfully" });
        }
        
        
        [HttpGet("{id:int}/info")]
        public async Task<ActionResult<UserResponse>> GetUserInfo(int id)
        {
            // // users can get their own user and admins can get any user
            // if (id != Account.Id && Account.Role != Role.Admin)
            //     return Unauthorized(new { message = "Unauthorized" });

            var user = await _userService.GetById(id);
            var info = await _userService.GetUserInfo(user);
            return Ok(info);
        }

    }
}
