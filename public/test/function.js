var cd;
var IsAllowed = false;

$(document).ready(function() {
    CreateCaptcha();
});

// Create Captcha
function CreateCaptcha() {
  var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  var captchaText = '';
  for (var i = 0; i < 6; i++) {
    captchaText += alpha[Math.floor(Math.random() * alpha.length)] + ' ';
  }
  cd = captchaText.trim();
  
  $('#CaptchaImageCode').empty().append('<canvas id="CapCode" class="capcode" width="300" height="80"></canvas>');
  
  var c = document.getElementById("CapCode");
  var ctx = c.getContext("2d");
  var x = c.width / 2;
  var img = new Image();
 
  img.src = "https://webdevtrick.com/wp-content/uploads/captchaback.jpg";
  img.onload = function () {
      var pattern = ctx.createPattern(img, "repeat");
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = "46px Roboto Slab";
      ctx.fillStyle = '#212121';
      ctx.textAlign = 'center';
      ctx.setTransform(1, -0.12, 0, 1, 0, 15);
      ctx.fillText(cd, x, 55);
  };
}

// Validate Captcha
function ValidateCaptcha() {
  return removeSpaces(cd) === removeSpaces($('#UserCaptchaCode').val());
}

// Remove Spaces
function removeSpaces(string) {
  return string.split(' ').join('');
}

// Check Captcha
function CheckCaptcha() {
  var result = ValidateCaptcha();
  if (!$("#UserCaptchaCode").val()) {
    $('#WrongCaptchaError').text('Please Enter Code Given Below In a Picture.').show();
    $('#UserCaptchaCode').focus();
  } else {
    if (!result) { 
      IsAllowed = false;
      $('#WrongCaptchaError').text('Invalid Captcha! Please Try Again.').show();
      CreateCaptcha();
      $('#UserCaptchaCode').focus().select();
    } else { 
      IsAllowed = true;
      $('#UserCaptchaCode').val('').attr('placeholder', 'Enter Captcha - Case Sensitive');
      CreateCaptcha();
      $('#WrongCaptchaError').fadeOut(100);
      $('#SuccessMessage').fadeIn(500).css('display', 'block').delay(5000).fadeOut(250);
    }
  }
}
