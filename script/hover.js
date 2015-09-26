$( document ).ready(function() {
  $("img[data-hover-src]").hover(function() {
    $(this).data("origin-src", $(this).attr("src"));
    $(this).attr("src", $(this).data("hover-src"));
  }, function() {
    $(this).attr("src", $(this).data("origin-src"));
  });
});
