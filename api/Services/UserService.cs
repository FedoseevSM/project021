using AutoMapper;
using BC = BCrypt.Net.BCrypt;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Web.Entities;
using Web.Helpers;
using Web.Models.User;

namespace Web.Services
{
  public interface IUserService
  {
    AuthenticateResponse Authenticate(AuthenticateRequest model, string ipAddress);
    AuthenticateResponse RefreshToken(string token, string ipAddress);
    void RevokeToken(string token, string ipAddress);
    Task<bool> Register(RegisterRequest model, string origin);
    Task<bool> ResendConfirmEmail(AuthenticateRequest model, string origin);
    bool VerifyEmail(string token);
    void ForgotPassword(ForgotPasswordRequest model, string origin);
    void ValidateResetToken(ValidateResetTokenRequest model);
    void ResetPassword(ResetPasswordRequest model);

    string IpAddress(HttpRequest request, HttpContext context);
    
    void SetTokenCookie(HttpResponse response, string token);

    Task<AuthenticateResponse> GetOrRegister(string email, string name, string ipAddress);
    IEnumerable<UserResponse> GetAll();
    Task<User> GetById(int id);
    UserResponse Create(CreateUserRequest model);
    Task<UserResponse> Update(int id, UpdateUserRequest model);
    
    Task<User> UpdateUser(User user);
    User? GetByEmail(string email);
    Task<AuthenticateResponse?> LoginByFb(string code, string redirectUri, string ipAddress);
    Task<AuthenticateResponse?> LoginByVk(string code, string redirectUri, string ipAddress);
    
    Task<AuthenticateResponse?> LoginByGoogle(string code, string redirectUri, string ipAddress);

    Task<UserInfo> GetUserInfo(User user);
    
    Task<UserInfo> UpdateUserInfo(UserInfo info);
    void Delete(int id);
  }

  public class UserService : IUserService
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;
    private readonly IEmailService _emailService;
    private readonly IHttpClientFactory _httpFactory;

    public UserService(
      DataContext context,
      IMapper mapper,
      IOptions<AppSettings> appSettings,
      IEmailService emailService,
      IHttpClientFactory httpFactory
    )
    {
      _context = context;
      _mapper = mapper;
      _appSettings = appSettings.Value;
      _emailService = emailService;
      _httpFactory = httpFactory;
    }

    public AuthenticateResponse Authenticate(AuthenticateRequest model, string ipAddress)
    {
      var user = _context.Users.SingleOrDefault(x => x.Email == model.Email.ToLower());

      if (user == null || !BC.Verify(model.Password, user.PasswordHash))
        throw new AppException("Email or password is incorrect");

      if (!user.IsVerified)
        throw new AppException("Email not confirmed");
      // authentication successful so generate jwt and refresh tokens
      var jwtToken = generateJwtToken(user);
      var refreshToken = generateRefreshToken(ipAddress);
      user.RefreshTokens.Add(refreshToken);

      // remove old refresh tokens from user
      // removeOldRefreshTokens(user);

      // save changes to db
      _context.Update(user);
      _context.SaveChanges();

      var response = _mapper.Map<AuthenticateResponse>(user);
      response.JwtToken = jwtToken;
      response.RefreshToken = refreshToken.Token;
      return response;
    }

    public async Task<AuthenticateResponse> GetOrRegister(string email, string name, string ipAddress)
    {
      var user = _context.Users.SingleOrDefault(x => x.Email == email.ToLower());
      if (user == null)
      {
        user = new User();
        user.Name = name;
        user.Email = email;
        user.Role = Role.User;
        user.Created = DateTime.UtcNow;
        user.PasswordHash = "";
        user.Verified = DateTime.UtcNow;
        user.VerificationToken = null;
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        user = _context.Users.SingleOrDefault(x => x.Email == email.ToLower());
      }
      var jwtToken = generateJwtToken(user);
      var refreshToken = generateRefreshToken(ipAddress);
      user.RefreshTokens.Add(refreshToken);
      await _context.SaveChangesAsync();
      
      var response = _mapper.Map<AuthenticateResponse>(user);
      response.JwtToken = jwtToken;
      response.RefreshToken = refreshToken.Token;
      return response;
    }

    public AuthenticateResponse RefreshToken(string token, string ipAddress)
    {
      var (refreshToken, user) = getRefreshToken(token);

      // replace old refresh token with a new one and save
      var newRefreshToken = generateRefreshToken(ipAddress);
      refreshToken.Revoked = DateTime.UtcNow;
      refreshToken.RevokedByIp = ipAddress;
      refreshToken.ReplacedByToken = newRefreshToken.Token;
      user.RefreshTokens.Add(newRefreshToken);

      removeOldRefreshTokens(user);

      _context.Update(user);
      _context.SaveChanges();

      // generate new jwt
      var jwtToken = generateJwtToken(user);

      var response = _mapper.Map<AuthenticateResponse>(user);
      response.JwtToken = jwtToken;
      response.RefreshToken = newRefreshToken.Token;
      return response;
    }

    public void RevokeToken(string token, string ipAddress)
    {
      var (refreshToken, user) = getRefreshToken(token);

      // revoke token and save
      refreshToken.Revoked = DateTime.UtcNow;
      refreshToken.RevokedByIp = ipAddress;
      _context.Update(user);
      _context.SaveChanges();
    }

    public async Task<bool> Register(RegisterRequest model, string origin)
    {
      var user = GetByEmail(model.Email);
      if (user != null)
      {
        throw new DbUpdateException("Email already registered");
      }


      // validate
      // if (_context.Users.Any(x => x.Email == model.Email))
      //{
      // send already registered error in email to prevent user enumeration
      //    sendAlreadyRegisteredEmail(model.Email, origin);
      //  return;
      //}

      // map model to new user object
      user = _mapper.Map<User>(model);

      // first registered user is an admin
      var isFirstUser = _context.Users.Count() == 0;
      user.Role = isFirstUser ? Role.Admin : Role.User;
      user.Created = DateTime.UtcNow;
      user.VerificationToken = randomTokenString();

      // hash password
      user.PasswordHash = BC.HashPassword(model.Password);

      // save user
      _context.Users.Add(user);
      _context.SaveChanges();

      // send email
      return await sendVerificationEmail(user, origin);
    }

    public async Task<bool> ResendConfirmEmail(AuthenticateRequest model, string origin)
    {
      var user = _context.Users.SingleOrDefault(x => x.Email == model.Email.ToLower());
      
      if (user == null || !BC.Verify(model.Password, user.PasswordHash))
        throw new AppException("Email or password is incorrect");
      
      if (user.IsVerified)
        throw new AppException("Email already confirmed");
      user.VerificationToken = randomTokenString();
      _context.Update(user);
      _context.SaveChanges();
      return await sendVerificationEmail(user, origin);
    }
    

    public bool VerifyEmail(string token)
    {
      var user = _context.Users.SingleOrDefault(x => x.VerificationToken == token);

      if (user == null)
      {
        return false;
      }

      user.Verified = DateTime.UtcNow;
      user.VerificationToken = null;

      _context.Users.Update(user);
      _context.SaveChanges();
      return true;
    }

    public void ForgotPassword(ForgotPasswordRequest model, string origin)
    {
      var user = _context.Users.SingleOrDefault(x => x.Email == model.Email);

      // always return ok response to prevent email enumeration
      if (user == null) return;

      // create reset token that expires after 1 day
      user.ResetToken = randomTokenString();
      user.ResetTokenExpires = DateTime.UtcNow.AddDays(1);

      _context.Users.Update(user);
      _context.SaveChanges();

      // send email
      sendPasswordResetEmail(user, origin);
    }

    public void ValidateResetToken(ValidateResetTokenRequest model)
    {
      var user = _context.Users.SingleOrDefault(x =>
        x.ResetToken == model.Token &&
        x.ResetTokenExpires > DateTime.UtcNow);

      if (user == null)
        throw new AppException("Invalid token");
    }

    public void ResetPassword(ResetPasswordRequest model)
    {
      var user = _context.Users.SingleOrDefault(x =>
        x.ResetToken == model.Token &&
        x.ResetTokenExpires > DateTime.UtcNow);

      if (user == null)
        throw new AppException("Invalid token");

      // update password and remove reset token
      user.PasswordHash = BC.HashPassword(model.Password);
      user.PasswordReset = DateTime.UtcNow;
      user.ResetToken = null;
      user.ResetTokenExpires = null;

      _context.Users.Update(user);
      _context.SaveChanges();
    }

    public IEnumerable<UserResponse> GetAll()
    {
      var users = _context.Users;
      return _mapper.Map<IList<UserResponse>>(users);
    }

    public async Task<User> GetById(int id)
    {
      var user = await getUser(id);
      return user;
    }

    public User? GetByEmail(string email)
    {
      var users =
        (from u in _context.Users
          where u.Email == email.ToLower()
          select u).AsNoTracking().ToList();

      if (users.Count() == 0)
      {
        return null;
      }

      return users[0];
    }

    public UserResponse Create(CreateUserRequest model)
    {
      // validate
      if (_context.Users.Any(x => x.Email == model.Email))
        throw new AppException($"Email '{model.Email}' is already registered");

      // map model to new user object
      var user = _mapper.Map<User>(model);
      user.Created = DateTime.UtcNow;
      user.Verified = DateTime.UtcNow;

      // hash password
      user.PasswordHash = BC.HashPassword(model.Password);

      // save user
      _context.Users.Add(user);
      _context.SaveChanges();

      return _mapper.Map<UserResponse>(user);
    }

    public async Task<UserResponse> Update(int id, UpdateUserRequest model)
    {
      var user = await getUser(id);

      // validate
      if (user.Email != model.Email && _context.Users.Any(x => x.Email == model.Email))
        throw new AppException($"Email '{model.Email}' is already taken");

      // hash password if it was entered
      if (!string.IsNullOrEmpty(model.Password))
        user.PasswordHash = BC.HashPassword(model.Password);

      // copy model to user and save
      _mapper.Map(model, user);
      user.Updated = DateTime.UtcNow;
      _context.Users.Update(user);
      _context.SaveChanges();

      return _mapper.Map<UserResponse>(user);
    }

    public async void Delete(int id)
    {
      var user = await getUser(id);
      _context.Users.Remove(user);
      _context.SaveChanges();
    }

    public async Task<AuthenticateResponse?> LoginByFb(string code, string redirectUri, string ip)
    {
      var uri = "https://graph.facebook.com/v8.0/oauth/access_token?client_id=690941554862239&redirect_uri=" +
                redirectUri + "&client_secret=6310efc76f903e83eee7b8c29ec2fe1b&code=" + code;
      var request = new HttpRequestMessage(HttpMethod.Get, uri);
      var client = _httpFactory.CreateClient();
      var response = await client.SendAsync(request);

      if (response.IsSuccessStatusCode)
      {
        var responseStream = await response.Content.ReadAsStreamAsync();
        var data = await JsonSerializer.DeserializeAsync<FbTokenResponse>(responseStream);
        var userRequest = new HttpRequestMessage(
          HttpMethod.Get,
          "https://graph.facebook.com/v8.0/me?fields=name,email&access_token=" + data.access_token
        );
        var userResponse = await client.SendAsync(userRequest);
        var userStream = await userResponse.Content.ReadAsStreamAsync();
        var data1 = await JsonSerializer.DeserializeAsync<FbMeResponse>(userStream);
        var email = data1.email;
        var name = data1.name;
        return await GetOrRegister(email, name, ip);
      }

      return null;
    }
    
    public async Task<AuthenticateResponse?> LoginByVk(string code, string redirectUri, string ip)
    {
      var uri = "https://oauth.vk.com/access_token?client_id=7658610&redirect_uri=" + redirectUri +
                "&client_secret=mskiRCsWJAqmpRiynnix&code=" + code;
      var request = new HttpRequestMessage(HttpMethod.Get, uri);
      var client = _httpFactory.CreateClient();
      var response = await client.SendAsync(request);

      if (response.IsSuccessStatusCode)
      {
        var responseStream = await response.Content.ReadAsStreamAsync();
        var data = await JsonSerializer.DeserializeAsync<VkTokenResponse>(responseStream);
        var email = data.email;
        var infoRequest = new HttpRequestMessage(
          HttpMethod.Get,
          "https://api.vk.com/method/users.get?v=5.21&access_token=" + data.access_token
        );
        var infoResponse = await client.SendAsync(infoRequest);
        var infoStream = await infoResponse.Content.ReadAsStreamAsync();
        var userData = await JsonSerializer.DeserializeAsync<VkUserResponse>(infoStream);
        var name = userData.response[0].first_name + ' ' + userData.response[0].last_name;
        return await GetOrRegister(email, name, ip);
      }

      return null;
    }
    
    public async Task<AuthenticateResponse?> LoginByGoogle(string code, string redirectUri, string ip)
    {
      var reqUri = "https://oauth2.googleapis.com/token";
      var postData = new []
      {
        new KeyValuePair<string, string>("client_id", "1973025920-gssbktvedt8952jq87u3kl29lebva4rn.apps.googleusercontent.com"),
        new KeyValuePair<string, string>("grant_type", "authorization_code"),
        new KeyValuePair<string, string>("redirect_uri", redirectUri),
        new KeyValuePair<string, string>("client_secret", "-6Sk5DIcFkR9qPSFMNM6U_xQ"),
        new KeyValuePair<string, string>("code", code),
      };
      var content = new FormUrlEncodedContent(postData);
      content.Headers.Clear();
      content.Headers.Add("Content-Type", "application/x-www-form-urlencoded");
      var client = _httpFactory.CreateClient();
      var response = await client.PostAsync(reqUri, content);

      if (response.IsSuccessStatusCode)
      {
        var responseStream = await response.Content.ReadAsStreamAsync();
        var data = await JsonSerializer.DeserializeAsync<GoogleTokenResponse>(responseStream);
        
        var infoRequest = new HttpRequestMessage(
          HttpMethod.Get, 
          "https://openidconnect.googleapis.com/v1/userinfo?access_token=" + data.access_token
        );
        var infoResponse = await client.SendAsync(infoRequest);
        var infoStream = await infoResponse.Content.ReadAsStreamAsync();
        var userData = await JsonSerializer.DeserializeAsync<GoogleUserResponse>(infoStream);
        var name = userData.name;
        var email = userData.email;
        return await GetOrRegister(email, name, ip);
      }

      return null;
    }
    
    public string IpAddress(HttpRequest request, HttpContext context)
    {
      if (request.Headers.ContainsKey("X-Forwarded-For"))
        return request.Headers["X-Forwarded-For"];
      return context.Connection.RemoteIpAddress.MapToIPv4().ToString();
    }
    
    public void SetTokenCookie(HttpResponse response, string token)
    {
      var cookieOptions = new CookieOptions
      {
        HttpOnly = false,
        Expires = DateTime.UtcNow.AddDays(7),
        SameSite = SameSiteMode.None,
        Secure = true
      };
      response.Cookies.Append("refreshToken", token, cookieOptions);
    }

    public async Task<UserInfo> GetUserInfo(User user)
    {
      var info = await Task.FromResult(_context.UserInfo.SingleOrDefault(x => x.UserId == user.Id));
      if (info == null)
      {
        info = new UserInfo()
        {
          UserId = user.Id,
          City = "",
          Education = "",
          Links = new string[]{},
          Skills = new string[]{},
          Tags = new string[]{},
          Updated = DateTime.UtcNow
        };
        await _context.UserInfo.AddAsync(info);
        await _context.SaveChangesAsync();
      }

      return info;
    }

    public async Task<UserInfo> UpdateUserInfo(UserInfo info)
    {
      var updated = await Task.FromResult(_context.UserInfo.Update(info));
      await _context.SaveChangesAsync();
      return updated.Entity;
    }

    public async Task<User> UpdateUser(User user)
    {
      var updated = await Task.FromResult(_context.Users.Update(user));
      await _context.SaveChangesAsync();
      return updated.Entity;
    }

    // helper methods

    private async Task<User> getUser(int id)
    {
      var user = await _context.Users.FindAsync(id);
      if (user == null) throw new KeyNotFoundException("User not found");
      return user;
    }

    private (RefreshToken, User) getRefreshToken(string token)
    {
      var user = _context.Users.SingleOrDefault(u => u.RefreshTokens.Any(t => t.Token == token));
      if (user == null) throw new AppException("Invalid token");
      var refreshToken = user.RefreshTokens.Single(x => x.Token == token);
      if (!refreshToken.IsActive) throw new AppException("Invalid token");
      return (refreshToken, user);
    }

    private string generateJwtToken(User user)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(new[] {new Claim("id", user.Id.ToString())}),
        Expires = DateTime.UtcNow.AddMinutes(15),
        SigningCredentials =
          new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };
      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    private RefreshToken generateRefreshToken(string ipAddress)
    {
      return new RefreshToken
      {
        Token = randomTokenString(),
        Expires = DateTime.UtcNow.AddDays(7),
        Created = DateTime.UtcNow,
        CreatedByIp = ipAddress
      };
    }

    private void removeOldRefreshTokens(User user)
    {
      user.RefreshTokens.RemoveAll(x =>
        !x.IsActive &&
        x.Created.AddDays(_appSettings.RefreshTokenTTL) <= DateTime.UtcNow);
    }

    private string randomTokenString()
    {
      using var rngCryptoServiceProvider = new RNGCryptoServiceProvider();
      var randomBytes = new byte[40];
      rngCryptoServiceProvider.GetBytes(randomBytes);
      // convert random bytes to hex string
      return BitConverter.ToString(randomBytes).Replace("-", "");
    }

    private async Task<bool> sendVerificationEmail(User user, string origin)
    {
      string message;
      if (!string.IsNullOrEmpty(origin))
      {
        var verifyUrl = $"{origin}/account/verify-email?token={user.VerificationToken}";
        message = $@"<p>Please click the below link to verify your email address:</p>
                             <p><a href=""{verifyUrl}"">{verifyUrl}</a></p>";
      }
      else
      {
        message =
          $@"<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                             <p><code>{user.VerificationToken}</code></p>";
      }

      return await _emailService.Send(
        to: user.Email,
        subject: "Project021: Verify Email",
        html: $@"<h4>Verify Email</h4>
                         <p>Thanks for registering!</p>
                         {message}"
      );
    }

    private async void sendAlreadyRegisteredEmail(string email, string origin)
    {
      string message;
      if (!string.IsNullOrEmpty(origin))
        message =
          $@"<p>If you don't know your password please visit the <a href=""{origin}/account/forgot-password"">forgot password</a> page.</p>";
      else
        message =
          "<p>If you don't know your password you can reset it via the <code>/accounts/forgot-password</code> api route.</p>";

      await _emailService.Send(
        to: email,
        subject: "Project021: - Email Already Registered",
        html: $@"<h4>Email Already Registered</h4>
                         <p>Your email <strong>{email}</strong> is already registered.</p>
                         {message}"
      );
    }

    private async void sendPasswordResetEmail(User user, string origin)
    {
      string message;
      if (!string.IsNullOrEmpty(origin))
      {
        var resetUrl = $"{origin}/reset-password?token={user.ResetToken}";
        message = $@"<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                             <p><a href=""{resetUrl}"">{resetUrl}</a></p>";
      }
      else
      {
        message =
          $@"<p>Please use the below token to reset your password with the <code>/reset-password</code> api route:</p>
                             <p><code>{user.ResetToken}</code></p>";
      }

      await _emailService.Send(
        to: user.Email,
        subject: "Project021: Reset Password",
        html: $@"<h4>Reset Password Email</h4>
                         {message}"
      );
    }
  }
}