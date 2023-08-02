using AutoMapper;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Services;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Bson.IO;

namespace Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class EventsController : BaseController
  {
    private readonly IUserService _userService;
    private readonly IEventsService _eventsService;
    private readonly ILogger _logger;
    private readonly IMapper _mapper;

    public EventsController(
      ILogger<EventsController> logger,
      IEventsService eventsService,
      IUserService userService,
      IMapper mapper
    )
    {
      _logger = logger;
      _userService = userService;
      _eventsService = eventsService;
      _mapper = mapper;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<string>>> GetEvents()
    {
      var events = await _eventsService.GetUserEvents(Account);
      var list = new List<string>();
      var jsonWriterSettings = new JsonWriterSettings { OutputMode = JsonOutputMode.CanonicalExtendedJson };
      foreach(var e in events) {
        list.Add(e.ToJson(jsonWriterSettings));
      }
      return Ok(list);
    }

    [Authorize]
    [HttpDelete]
    public async Task<ActionResult> RemoveAllEvents()
    {
      await _eventsService.RemoveUserEvents(Account);
      return Ok();
    }

    [Authorize]
    [HttpPut("{eventId}/")]
    public async Task<ActionResult> ReadEvent(string eventId)
    {
      await _eventsService.ReadEvent(eventId);
      // var userEvent = await _eventsService.GetEventById(eventId);
      // if (userEvent == null || userEvent.UserId != Account.Id || userEvent.Read != null)
      // {
      //   return NotFound();
      // }
      // await _eventsService.ReadEvent(userEvent);
      return Ok();
    }

    [Authorize]
    [HttpDelete("{eventId}/")]
    public async Task<ActionResult> DeleteEvent(string eventId)
    {
      await _eventsService.DeleteEvent(eventId);
      // var userEvent = await _eventsService.GetEventById(eventId);
      // if (userEvent == null || userEvent.UserId != Account.Id || userEvent.Read != null)
      // {
      //   return NotFound();
      // }
      // await _eventsService.RemoveEvent(userEvent);
      return Ok();
    }
  }
}
