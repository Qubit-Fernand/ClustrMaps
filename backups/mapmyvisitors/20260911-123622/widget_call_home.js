var Map = function(map_el, options) {
        var _map = this;
        _map.container = map_el;
        _map.options = {
            'user': null,
            'domain': null,//alphanumeric domain name
            'loadMore': true,
            'updateCounts': false,
            'animate': true,
            'backgroundColor': '#2B77AC',
            'regionStyleFill': '#CCE190',
            'regionStyleStroke': '#636B4C',
            'dotColorOld': '#9db7d6',

            'markerStyleInitialFill': '#9db7d6', //RED
            'markerStyleInitialStroke': '#ffffff',
            'markerStyleFill': '#ff6b4a', //ORANGE
            'markerStyleStroke': '#FFFFFF',
            'dotColorRecent': '#ff6b4a',

            'addLabels': false,
            'mapType':'default',
            'addAds': false,
            'updateLink': false,
            'addRealtimeVisitors': false,
            'globalTotal': false,
            'zoomMax': 8,
            'zoomOnScroll': true,
            'panOnDrag': true,
            'zoomButtons': true,
            'retryConnetionInterval': 30000,//ms
            'dotRadiusScale': [3, 12]
        };

        if(typeof options == 'object'){
            _map.options = $.extend({}, _map.options, options);
        }

        _map.initial = true;
        _map.mapObject;

        _map.oneUp = function(one_up_container, num_element){
            var count = 1;
            var badges = one_up_container.find('.badge.plus');
            if(badges.length > 0){
                count += parseInt(badges.data('count'));
            }
            badges.remove();
            $('<span class="badge plus" style="margin: 0px 4px 0px 0px; vertical-align: middle;">+'+count+'</span>').data('count', count)
                .prependTo(one_up_container).fadeOut(3500, function(){
                $(this).remove();
            });
            var total_count = (parseInt(num_element.data('count'))+1);
            num_element.html(total_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                .data('count', total_count);
        };

        _map.updateCounts = function(ip_id, location, flag, date, hits, country_code){
            if(!_map.options.updateCounts){
                return false;
            }

            _map.container.find('.mapmyvisitors-visitors').html(hits+' visitors');
        }

        _map.addRealtimeVisitors = function(ip_id, location, flag, date, hits, country_code){
            if(!_map.options.addRealtimeVisitors){
                return false;
            }
            var notice = $('#large_map-container > .notice-centered-container');
            if(notice.length === 1){
                notice.remove();
            }
            var hits_text = 'times';
            var badge = '';
            var existing_country_item = $('#top_countries .item[data-country_code="'+country_code+'"]');


            if(hits === '1'){
                hits_text = 'time';
                badge = '<span class="badge">NEW</span> ';
                if(existing_country_item.length > 0){
                    var count = 1;
                    var badges = existing_country_item.find('.badge.plus');
                    if(badges.length > 0){
                        count += parseInt(badges.data('count'));
                    }
                    badges.remove();
                    $('<span class="badge plus" style="margin: 0px 4px 0px 0px; vertical-align: middle;">+'+count+'</span>').data('count', count)
                        .prependTo(existing_country_item.find('.right > .text')).fadeOut(3500, function(){
                        $(this).remove();
                    });
                    var country_count = (parseInt(existing_country_item.find('.right > .text > .count_text').data('count'))+1);
                    existing_country_item.data('visits', country_count).find('.right > .text > .count_text').html('<span class="count">'+country_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+ '</span> visits')
                        .data('count', country_count);
                }
            }

            $('.non_unique_visitor_count').each(function(index){
                _map.oneUp(
                    $(this).find('.non_unique_visitor_count-oneup'),
                    $(this).find('.non_unique_visitor_count-count')
                );
            });

            var emptied = false;
            var item_count = $('#recent_visitors').find('.item').length;
            if(!emptied && item_count === 0){
                $('#recent_visitors').html('');
                emptied = true;
            }else if(item_count >= 15 && $('#recent_visitors').css('max-height') === 'none'){
                ;
                $('#recent_visitors').css({
                    'max-height': 15*$('#recent_visitors').find('.item').one().css('height', 'auto').height() + 12,
                    'overflow':'hidden'
                });
            }

            var existing_item = $('#recent_visitors').find('.item[data-ip_id="'+ip_id+'"]');



            if(existing_item.length > 0){
                existing_item.remove();
            }
            //console.log(_map.initial_hit_date);
            //console.log(Math.round(+new Date() / 1000 ));
            var minutes = Math.ceil((parseInt(Math.round(+new Date() / 1000 )) - parseInt(_map.initial_hit_date))/60);
            if(minutes === 1){
                var since_text = 'minute';
            }else if(minutes >= 60){
                var since_text = Math.floor(minutes/60) + ' hour';
            }else{
                var since_text = minutes + ' minutes';
            }

            $('<div data-ip_id="'+ip_id+'" class="item" '
                +' style="height: 0px; visibility: hidden;">'
                +'<div class="control">'
                +'<span class="flag '+flag+'"> </span>'
                +'<span class="text"><span class="inner">Visitor from '+location+'</span></span>'
                +'<span class="subtext"><span class="inner">'+badge+'Visited '+hits+' '
                + hits_text +' within last '+since_text+'.</span></span>'
                +'<span class="right">'
                +'<span class="text">' +'<span class="timeago" title="'+date+' +0000">'
                +date+'</span>'+'<span class="expand"><i class="icon-down-dir"></i></span></span>'
                +'</span>'
                +'</div>'
                +'<div class="catchall"></div>'
                +'<div class="sub-items">'
                +'</div>'
                +'</div>').prependTo('#recent_visitors').animate({
                height: 38
            }, 300 , function(){
                $(this).css({'visibility': 'visible', 'height': 'auto', 'background-color': '#CCE190'}).animate({
                    'backgroundColor': "#fafafa"
                }, 1000 );
                $('#recent_visitors').find('item').slice(15).remove();
            });
        }



        _map.init = function(){


            _map.container.vectorMap({
                map: 'world_mill_en',
                backgroundColor: _map.options.backgroundColor,
                scaleColors: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial',
                hoverOpacity: 0.7,
                baseScale : 1,
                zoomOnScroll: false,
                zoomOnScroll: _map.options.zoomOnScroll,
                panOnDrag: _map.options.panOnDrag,
                zoomMax: _map.options.zoomMax,
                zoomMin: _map.options.zoomMin,
                zoomButtons: _map.options.zoomButtons,
                hoverColor: false,
                regionStyle: {
                    initial: {
                        fill: _map.options.regionStyleFill,
                        "fill-opacity": 1,
                        stroke: _map.options.regionStyleStroke,
                        "stroke-width": 1,
                        "stroke-opacity": 1
                    },
                    hover: {
                        "fill-opacity": 1,
                        fill: '#DCF1A0',
                        cursor: 'pointer'
                    },
                    selected: {
                    },
                    selectedHover: {
                    }
                },
                markerStyle: {
                    initial: {
                        fill: _map.options.markerStyleInitialFill,
                        stroke: _map.options.markerStyleInitialStroke,
                        "fill-opacity": .7,
                        "stroke-width": .5,
                        r: 3

                    },
                    hover: {
                        "fill-opacity": 1,
                        stroke: '#FFFFFF',
                        cursor: 'pointer'
                    }
                },
                series: {
                    markers: [{
                        attribute: 'r',
                        scale: _map.options.dotRadiusScale,
                        values: []
                    }]
                },
                markers: [
                                    ]
            });

            _map.mapObject = _map.container.vectorMap('get', 'mapObject');
                        _map.loadMore();
            
            _map.addLabels();
            _map.updateLink();


        };

        _map.last_hit_id = '0';
        _map.initial_hit_id = '0';//hit id since end of cached data.
        _map.initial_hit_date = '1789083849';

        _map.updateLink = function(){

            if(!_map.options.updateLink){
                return false;
            }


            _map.container.parent().parent().attr('href', "http://mapmyvisitors.com" + _map.options.profile_link);

        }
        _map.addLabels = function(){

            if(!_map.options.addLabels){
                return false;
            }

            
            _map.container.parent()
                .find('.mapmyvisitors-visitors').html('36 Total Pageviews');

                    }


        _map.evalInScope = function(data){
            eval(data);
        };


        _map.loadMore = function(){

            if(_map.initial !== true && _map.options.loadMore === false){
                return false;
            }


            _map.ajax(
                '//mapmyvisitors.com/ajax/map',
                {
                    'last_hit_id': _map.last_hit_id,
                    'initial_hit_id': _map.initial_hit_id,
                    'initial': _map.initial,
                    'animate': _map.options.animate,
                    'user': _map.options.user,
                    'url': _map.options.domain,
                    'id' : _map.options.project_id,
                    'globalTotal': _map.options.globalTotal,
                    'mapType': _map.options.mapType
                },
                false,
                false,
                _map.evalInScope,
                'jsonp'
            );

            _map.initial = false;
        };


        _map.ajax = function(
            url,
            data,
            destination,
            show_loader,/* true (default) = show full body loader;
             false = don't show any loaders;
             string = add ajax_loading class to element found by string;*/
            callback,
            dataType,
            replace_destination
        ){
            if(show_loader === undefined){
                show_loader = true;
            }
            if(show_loader === true){

            }else if(show_loader !== false){
                if(typeof show_loader === 'object'){
                    var loader_el = show_loader;
                }else{
                    var loader_el = $(show_loader);
                }
                //display loader overlay
                if(loader_el.find(' > .ajax_loader').length === 0){
                    loader_el.append('<div class="ajax_loader"></div>');
                }
                loader_el.addClass('ajax_loading');
            }

            $.ajax({
                type: "GET",
                url: url,
                timeout: 5000,
                dataType: dataType,
                data: data,
                complete: function(){
                    //hide loader overlay if open
                    if(show_loader === true){

                    }else if(show_loader !== false){
                        $(show_loader).removeClass('ajax_loading');
                    }
                },
                success: function(data, textStatus, jqXHR){
                    if(typeof callback === 'function'){
                        callback(data);
                    }
                    if(jqXHR.getResponseHeader('x-ajax-redirect') !== null){
                        window.location = jqXHR.getResponseHeader('x-ajax-redirect');
                        return false;
                    }
                    if(replace_destination === true){
                        $(destination).replaceWith(data);
                    }else{
                        $(destination).html(data);
                    }
                    _map.container.parent().find('.mapmyvisitors-connection')
                        .removeClass('mapmyvisitors-failed').addClass('mapmyvisitors-live').html('live');
                    //_app.fadeMessages(destination);
                    //replace html into destination
                    //alert(destination);
                },
                error: function(jqXHR, textStatus, errorThrown ){

                    console.log("error: could not connect to server!");

                    _map.container.parent().find('.mapmyvisitors-connection')
                        .addClass('mapmyvisitors-failed').removeClass('mapmyvisitors-live').html('connecting...');
                    setTimeout(function(){
                        _map.loadMore();
                    }, _map.options.retryConnetionInterval);

                    //if a overlay is open
                    //save to reopen later
                    //close it
                    //else
                    //clear out previous popup reference

                    //if custom error header was returned
                    //add it to error contents
                    //else
                    //set defaul error contents

                    //open error pop
                }

            });
        };

        _map.init();
        return this;
    };

                    $('.mapmyvisitors-loading').remove();
                var themap = new Map(
                    $(".mapmyvisitors-map"),
                    {
                        'user': "0",
                        'domain': '"https://fernand.tech/"',
                        'project_id': 2249830,
                        'profile_link' : '/web/1c7za',
                        'addLabels': true,
                        'animate': true,
                        'mapType': 'widget',
                        'updateCounts': true,
                        'backgroundColor': 'transparent',
                        'updateLink': true,
                        'loadMore': false,
                        'zoomOnScroll': false,
                        'panOnDrag': false,
                        'zoomButtons': false,
                        'dotRadiusScale': [2, 4]
                    }
                );