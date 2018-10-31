$.getJSON("/labs", function(data){
  i = 0;
  $.each(data, function() {
    f = '<tr> <td style="width: 70%;border-bottom-color: black;\
         border-bottom-width: 1px;border-bottom-style: solid;">'
    f = f + '<a href="/hemograma/' + data[i]['id'] + '">'
    f = f + '<p>';
    f = f + data[i]['day'];
    f = f + ' / ';
    f = f + data[i]['month'];
    f = f + ' / ';
    f = f + data[i]['year'];
    f = f + '</p> </a> </td>';
    f = f + '<td style="padding-left: 8px;border-bottom-color: black;\
            border-bottom-width: 1px;border-bottom-style: solid;"> <p>';
    f = f + data[i]['doctor'];
    f = f + '</p> </td> </tr>'
    i = i + 1;
    $(f).appendTo("#labs")
  });
});
