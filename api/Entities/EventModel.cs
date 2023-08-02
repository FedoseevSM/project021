using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Web.Entities
{
  public class EventModel
  {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    public string Type { get; set; }

    public BsonDocument Metadata { get; set; }

    public DateTime Created { get; set; }

    public DateTime? Read { get; set; }

    public int UserId { get; set; }
  }
}
