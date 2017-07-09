$(document).ready(function() {
    // current sidebar links on page load
    getSideBarMenu(function(response){
        // create sidebar list from response
        populateSideMenu(response.docs);

        // set the navbar brand title from config
        $('.navbar-brand').html(response.config.title);

        // set the hash to the first doc
        if(window.location.hash === '' && response.docs.length > 0){
            window.location.hash = '#' + response.docs[0].docSlug;
        }

        // show the first doc
        if(response.docs.length > 0){
            $('#main').html(response.docs[0].docBody);
            document.title = response.docs[0].docTitle;
        }else{
            $('#main').html('No docs. Please create some docs.');
        }

        // store the inital list for later
        var currentListGroup = $('.sidebarLink');;

        // populate the top menu
        populateTopMenu();

        // if user searches
        $('#searchInput').on('keyup', function(){
            // only search if input more than 2 chars
            if($('#searchInput').val().length > 2){
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
                            $('.sidebar').append('<li class="list-group-item sidebarLink"><a href="#' + value.docSlug + '">' + value.docTitle + '</a></li>');
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

    $('.sidebarToggle').click(function(){
        $('.sidebar-container').toggleClass('sidebar-container-show');
    });
  
    $('body').on('click', '.sidebarLink a', function() { 
        $('.sidebar-container').toggleClass('sidebar-container-show');
    });
});

$(window).bind('hashchange', function(){
    $.ajax({
        method: 'GET',
        url: '/doc/' + window.location.hash.substring(1, window.location.hash.length)
    })
    .done(function(response, status){
        $('#main').html(response.doc.docBody);
        document.title = response.doc.docTitle;
    });
});

function getSideBarMenu(callback){
    $.ajax({
        method: 'GET',
        url: '/sidebar'
    })
    .done(function(response, status){
        callback(response);
    });
}

function populateSideMenu(data){
    $.each(data, function(key, value){
        $('.sidebar').append('<li class="list-group-item sidebarLink"><a href="#' + value.docSlug + '">' + value.docTitle + '</a></li>');
    });
}

function populateTopMenu(){
    $.ajax({
        method: 'GET',
        url: '/config'
    })
    .done(function(response, status){
        $.each(response.menuItems, function(key, value){
            $('.nav').append('<li><a href="' + value.menuLink + '">' + value.menuTitle + '</a></li>');
        });
    });
}