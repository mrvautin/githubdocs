$(document).ready(function() {
    // current sidebar links on page load
    var currentListGroup = $('.sidebarLink');
    
    // if user searches
    $('#searchInput').on('keyup', function(){
        // only search if input more than 3 chars
        if($('#searchInput').val().length > 3){
            $.ajax({
                method: 'POST',
                data: {keyword: $('#searchInput').val()},
                url: '/search'
            })
            .done(function(response, status){
                if(status === 'success'){
                    // remove current list
                    $('.sidebarLink').remove();

                    $.each(response, function(key, value){
                        $('.sidebar').append('<li class="list-group-item sidebarLink"><a href="/doc/' + value.docSlug + '">' + value.docTitle + '</a></li>');
                    });
                }else{
                    // remove current list
                    $('.sidebarLink').remove();
                    $('.sidebar').append(currentListGroup);
                }
            });
        }else{
            // remove current list
            $('.sidebarLink').remove();
            $('.sidebar').append(currentListGroup);
        }
    });
});