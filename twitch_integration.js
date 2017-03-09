$(document).ready(function() {
  var loggedin=false;
  var userId;
  var clientId = 'xuah90gskedx3f27besvxs8edx5x9o';
  Twitch.init(
  { clientId: clientId }, 
  function(error, status) {
    if(error) {
      console.log(error);
      alert("error"); 
    }
    if(status.authenticated) {
      loggedin = true;
      console.log("Now twitch initiated"); 
      console.log(status);
      userId=status._id;
      Twitch.api({method: 'channel'}, function(error, channel) {
        console.log(channel);
      });
      userId="rinoa";

      Twitch.api({method:'streams/followed', params: {limit: 4}}, function(error, result) {
        console.log("User following data"); 
        console.log(error);
        console.log(result);
        console.log("user following data"); 
      }); 

    }
  }); 

  // Twitch.logout();

  $("#logintwitch").click(function() {
    if(loggedin) return;
    Twitch.login({
      scope: ['user_read', 'channel_read']
    }); 
  });  

  function get_featured(stream, target) {
    Twitch.api({method: 'streams', params: {client_id: clientId, channel: stream.slice(1)}}, function(error, result) {
      console.log(error);
      console.log(result); 
      var streams = result.streams;
      var current_stream = result._links.self;
      var offline = false;
      current_stream = current_stream.slice(current_stream.indexOf('=')+1, current_stream.indexOf('&'));
      target.append(
      "<iframe "+ 
      "src=\"http:\/\/player.twitch.tv\/?channel="+ current_stream + "\" "+
      "height=\"100%\" "+ 
      "width=\"180%\" "+
      "frameborder=\"0\" "+
      "scrolling=\"no\" "+ 
      "allowfullscreen=\"true\" >"+
      "</iframe>"); 
      if(streams.length > 1) {
        $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-left > a > img").attr("src", streams[0].channel.logo);
        $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-body > span").text(streams[0].viewers + "views"); 
        $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-body > h4").text(streams[0].game);
        $("article.ipsContained.ipsSpacer_top section.ipsType_richText.ipsType_normal").first().html(streams[0].channel.status);
      } else {
        offline = true;
        Twitch.api({method: "channels/"+current_stream, params: {client_id: clientId }}, function(error, result) {
          console.log("FEATURE OFFLINE");
          console.log(error);
          console.log(result);
          console.log("/FEATURE OFFLINE"); 
          $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-left > a > img").attr("src", result.logo);
          $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-body > span").text(result.views + "views"); 
          $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-body > h4").text(result.game);
          $("article.ipsContained.ipsSpacer_top section.ipsType_richText.ipsType_normal").first().html(result.status);
        });
      }

      // Getting VODs

      Twitch.api({method: "channels\/"+current_stream+"\/videos", params:{client_id: clientId, broadcast: true}}, function(error, result) {
        console.log("VOD");
        console.log(error);
        console.log(result); 
        console.log("/VOD");
        var i = 0;
        var videos = result.videos; 
        $("#streams-all .single-streams-profile").each(function() {
          $(this).attr('video-id', videos[i]._id);
          $(this).children("img").first().attr("src", videos[i].preview);
          var hover = $(this).children(".single-streams-profile-hover").first(); 
          $(hover).children("h4").first().text(videos[i].game);
          $(hover).find("div.like").first().text(videos[i].views);
          $(this).click(function() {
            target.html('');
            target.append(
            "<iframe "+ 
            "src=\"http:\/\/player.twitch.tv\/?video="+ videos[i]._id + "\" "+
            "height=\"100%\" "+ 
            "width=\"180%\" "+
            "frameborder=\"0\" "+
            "scrolling=\"no\" "+ 
            "allowfullscreen=\"true\" >"+
            "</iframe>"); 
          }); 
          i ++;
        }); 
      });
    }); 

  }

  function reload_featured() {
    var featured = $(".streams-video"); 
    if(featured.length==0) return;
    get_featured($(featured.attr("stream-name")).text().split(":")[1], featured);
    //  console.log($(featured.attr("stream-name")).text().split(":")[1]);
  }  

  reload_featured();

  function list_users() {
    var stream, wrapper=[];
    console.log("Listing users");
    $(".single-carousel").each(function() {
      stream=$($(this).attr("stream-name")).text().split(":")[1].slice(1);
      wrapper[stream]=this;
      Twitch.api({method: 'streams', params: {client_id: clientId, channel: stream}}, function(error, result) {
        console.log("USER");
        console.log(error);
        console.log(result);
        var streams=result.streams;
        var current_stream = result._links.self;
        current_stream = current_stream.slice(current_stream.indexOf('=')+1, current_stream.indexOf('&'));
        console.log(streams.length);
        console.log("/USER");
        if(streams.length == 0) {
          Twitch.api({method: 'channels/' + current_stream, params: {client_id: clientId}}, function(error, result) {
            console.log("OFFLINE");
            console.log(error);
            console.log(result);
            console.log("/OFFLINE");
            $(wrapper[result.name]).find("img").first().attr("src", result.video_banner);
            $(wrapper[result.name]).find(".like>span").first().text(result.views);
            $(wrapper[result.name]).find(".streams-carousel-top>h4").css('color', 'red');
            $(wrapper[result.name]).find(".streams-carousel-top>h4").css('background', 'rgba(255,65,84,0.1)');
            $(wrapper[result.name]).find(".streams-carousel-top>h4").text("OFFLINE");
            $(wrapper[result.name]).find(".streams-carousel-top>h5").text("twitch.com/"+result.name);
            $(wrapper[result.name]).find(".streams-carousel-header>span").first().text(result.game);

            $(wrapper[result.name]).parent().insertAfter($(".single-carousel:last").parent());
          }); 
          return ;
        }
        $(wrapper[streams[0].channel.name]).find("img").first().attr("src", streams[0].preview.medium);
        $(wrapper[streams[0].channel.name]).find(".like>span").first().text(streams[0].viewers);
        $(wrapper[streams[0].channel.name]).find(".streams-carousel-top>h5").text("twitch.com/"+streams[0].channel.name);
        $(wrapper[streams[0].channel.name]).find(".streams-carousel-header>span").first().text(streams[0].channel.game);
        console.log("/USER/END!");
      });
    });
  }

  list_users();
  
  /* Script on Display template */
  $("#dimButton").click(function() {
    $("#screenFade").toggle();
  }); 
  
  /*
  Twitch.api({method: 'streams', params: {client_id: clientId}}, function(error, result) {
  console.log("LIVES");
  console.log(error);
  console.log(result); 
  console.log("/LIVES");
  if(error) return ;
  var streams = result.streams;
  var stream_holder = $(".streams-tab")[0]; 
  //    $(".streams-video>img").attr('src', streams[0].preview.large);
  /*    $(".streams-video").append(
  "<iframe "+ 
  "src=\"http:\/\/player.twitch.tv\/?channel="+ streams[0].channel.name + "\" "+
  "height=\"100%\" "+ 
  "width=\"180%\" "+
  "frameborder=\"0\" "+
  "scrolling=\"no\" "+ 
  "allowfullscreen=\"true\" >"+
  "</iframe>"); 
  $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-left > a > img").attr("src", streams[0].channel.profile_banner);
  $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-body > span").text(streams[0].channel.views + "views"); 
  $("#streams-all > div.streams-profile > div > div.streams-media-outer > div.streams-media > div.streams-media-body > h4").text(streams[0].channel.name);
  console.log(streams[0].preview.large); 
}); 
  */

}); 