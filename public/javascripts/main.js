$(document).ready(function(){
    // if there is a hash, trigger the change event to display the doc
    if(window.location.hash){
        $(window).trigger('hashchange');
    }

    // current sidebar links on page load
    getDocs(function(response){
        // create sidebar list from response
        populateSideMenu(response.docs);

        // set the navbar brand title from config
        $('.navbar-brand, .brand-logo').html(response.config.title);

        // set the hash to the first doc
        if(window.location.hash === '' && response.docs.length > 0){
            window.location.hash = '#' + response.docs[0].docSlug;
        }

        // show the first doc
        if(response.docs.length > 0){
            $('#main').html(response.docs[0].docBody);
            setMetaTags(response.docs[0]);
        }else{
            $('#main').html('<h3>No docs. Please create some docs.<h3>');
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
                            $('.sidebar').append('<li class="list-group-item sidebarLink collection-item"><a href="#' + value.docSlug + '">' + value.docTitle + '</a></li>');
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
    if(window.location.hash.trim() === '#' || window.location.hash.trim() === ''){
        getDocs(function(response){
            // show the first doc
            if(response.docs.length > 0){
                $('#main').html(response.docs[0].docBody);
                document.title = response.docs[0].docTitle;
                window.location.hash = '#' + response.docs[0].docSlug;
            }else{
                $('#main').html('<h3>No docs. Please create some docs.<h3>');
            }
        });
    }else{
        $.ajax({
            method: 'GET',
            url: '/doc/' + window.location.hash.substring(1, window.location.hash.length)
        })
        .done(function(response, status){
            $('#main').html(response.doc.docBody);
            if(response.doc.nextDoc){
                $('#linkNext a').removeClass("hidden hide");
                $('#linkNext a').attr("href", "#" + response.doc.nextDoc.docSlug)
            }else{
                $('#linkNext a').addClass("hidden hide");
            }
            if(response.doc.prevDoc){
                $('#linkPrev a').removeClass("hidden hide");
                $('#linkPrev a').attr("href", "#" + response.doc.prevDoc.docSlug)
            }else{
                $('#linkPrev a').addClass("hidden hide");
            }
            setMetaTags(response.doc);
        });
    }
});

function getDocs(callback){
    $.ajax({
        method: 'GET',
        url: '/sidebar'
    })
    .done(function(response, status){
        callback(response);
    });
}

function stripHTML(dirtyString){
    return $(dirtyString).text().trim();
}


function setMetaTags(doc){
    document.title = doc.docTitle;
    $("meta[property='og\\:title']").attr("content", doc.docTitle);
    $('meta[name=title]').attr('content', doc.docTitle);
    if(stripHTML(doc.docBody).length > 160){
        $("meta[property='og\\:description']").attr('content', stripHTML(doc.docBody.substring(0,200)));
        $('meta[name=description]').attr('content', stripHTML(doc.docBody.substring(0,200)));
    }else{
        $("meta[property='og\\:description']").attr('content', stripHTML(doc.docBody));
        $('meta[name=description]').attr('content', stripHTML(doc.docBody));
    }
}

function populateSideMenu(data){
    $.each(data, function(key, value){
        $('.sidebar').append('<li class="list-group-item sidebarLink collection-item"><a href="#' + value.docSlug + '">' + value.docTitle + '</a></li>');
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