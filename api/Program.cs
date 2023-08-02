using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sentry.AspNetCore;

namespace Web
{
  public class Program
  {
    public static void Main(string[] args)
    {
      CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
        .ConfigureLogging(logging =>
        {
          logging.ClearProviders();
          logging.AddConsole();
          logging.AddTraceSource("Information, ActivityTracing");
          // logging.AddFile("logs/mylog-{Date}.txt");
        })
        .ConfigureWebHostDefaults(webBuilder =>
        {
          webBuilder.UseSentry();
          var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
          if (env == "Development")
          {
            webBuilder.UseStartup<Startup>()
              .UseUrls("https://*:4000");
          }
          else
          {
            webBuilder.UseStartup<Startup>()
              .UseUrls("http://*:5000");
          }
        });
  }
}