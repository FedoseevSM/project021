using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Web.Helpers;
using Web.Middleware;
using Web.Services;
using Microsoft.OpenApi.Models;
using Web.Hubs;

namespace Web
{
  public class Startup
  {
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    // add services to the DI container
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDbContext<DataContext>();
      services.AddCors();
      services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.IgnoreNullValues = false);
      services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
      services.AddSwaggerGen(c =>
      {
          c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
          {
              In = ParameterLocation.Header,
              Description = "Please insert JWT with Bearer into field",
              Name = "Authorization",
              Type = SecuritySchemeType.ApiKey
          });
          c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] { }
                }
          });
      });


      

      // configure strongly typed settings object
      services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));

            // configure DI for application services
      services.AddScoped<IFileService, FileService>();
      services.AddSingleton<IEventsContext, EventsContext>();
      services.AddScoped<IUserService, UserService>();
      services.AddScoped<IPageService, PageService>();
      services.AddScoped<IProjectService, ProjectService>();
      services.AddScoped<ICommentService, CommentService>();
      services.AddScoped<IEmailService, EmailService>();
      services.AddScoped<IEventsService, EventsService>();
      
      services.AddSignalR();
      services.AddHttpClient();
    }

    // configure the HTTP request pipeline
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory,
      DataContext context)
    {
      // migrate database changes on startup (includes initial db creation)
      context.Database.Migrate();

      loggerFactory.AddFile("logs/{Date}.log");
      
      if (env.IsProduction())
      {
        app.UsePathBase(new PathString("/api"));
      }
      else
      {
        app.Use(async (context, next) =>
        {
          Console.WriteLine("Catch request:" + context.Request.Path);
          await next.Invoke();
        });
      }

      // generated swagger json and swagger ui middleware
      app.UseSwagger();
      app.UseSwaggerUI(x => x.SwaggerEndpoint("/swagger/v1/swagger.json", "ASP.NET Core Sign-up and Verification API"));

      app.UseRouting();
      app.UseStaticFiles();

      // global cors policy
      app.UseCors(x => x
        .SetIsOriginAllowed(origin => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .WithExposedHeaders("Set-Cookie"));

      // global error handler
      app.UseMiddleware<ErrorHandlerMiddleware>();

      // custom jwt auth middleware
      app.UseMiddleware<JwtMiddleware>();

      app.UseEndpoints(x => x.MapControllers());

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapHub<NotificationHub>("/ws/profile");
      });
    }
  }
}