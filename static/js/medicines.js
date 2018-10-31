$.getJSON("/medications", function(data){
  i = 0;
  $.each(data, function() {
    f = '<td style="width:75%"> <p style="font-family: Inconsolata, sans-serif;">';
    f = f + '<b style="font-size: 20px;">•</b> ';
    f = f + data[i]['med_brand_name'];
    f = f + '</p></td>';
    f = f + '<td> <p style="font-family: Inconsolata, sans-serif; width: 75px;\
    text-align: right;">';
    f = f + 'qty. '
    f = f + data[i]['med_quantity'];
    i = i + 1;
    $("<div/>",{
       html: f
     }).appendTo("#medications_container")
  });
});

$.getJSON("/medications", function(data){
  i = 0;
  $.each(data, function() {
    f = '<p>';
    f = f + data[i]['med_drug'];
    f = f + '</p>';
    i = i + 1;
    $(f).appendTo("#medications")
  });
});
