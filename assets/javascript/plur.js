var events = []
var pages = []
var activePage = 1
var createdPagesAlready = false
var featured = ["coachella", "electric zoo", "ultra", "electric daisy", "creamfields", "electric forest", "holy ship", "escape", "countdown", "burning man", "lollapalooza", "moonrise festival", "crssd", "tomorrowland"]
var liked = JSON.parse(localStorage.getItem('liked'))||{}


// var eventList = JSON.parse(localStorage.getItem("storedEvents")) 

var eventParameters = {
    client: "d5cf6acf-f0c3-408b-9a6c-31d016f980aa",
    locationIds: "38",
    startDate: "",
    endDate: ""
}

function getEvents() {
    pages = []
    events = []
    $(".cardDisplay").empty()
    var query = $.param(eventParameters);
    $.ajax({
        url: "https://edmtrain.com/api/events?" + query,
        method: "GET",
    }).done(function (response) {
        var dataList = response.data
        for (var i in dataList) {
            events[i] = dataList[i]
            if (i % 6 == 0) {
                pages.push(events)
                events = []
            }
        }
        $("tbody").empty()

        displayPage()
        //prevents pages from repeating
        if (createdPagesAlready) return
        if (pages.length > 10) {
            createPageButtons("<")
        }
        for (var i in pages) {
            createPageButtons(Number(i) + Number(1))
            if (i > 8) {
                createPageButtons(">")
                break
            }
        }
        createdPagesAlready = true
    }).fail(function () {
        var response = eventsData
        var dataList = response.data
        for (var i in dataList) {
            events[dataList[i].id] = dataList[i]
        }
    });
}

var locationParameters = {
    client: "d5cf6acf-f0c3-408b-9a6c-31d016f980aa",
    state: "New York"
}

function getStateId() {
    var query = $.param(locationParameters)
    $.ajax({
        url: "https://edmtrain.com/api/locations?" + query,
        method: "GET"
    }).done(function (response) {
        var locations = ""
        for (var i in response.data) {
            var location = response.data[i]
            locations += location.id + ","
        }
        eventParameters.locationIds = locations
        getEvents()
    }).fail(function () {
        alert("Bad Location")
    })
}

$(function () {
    featuredEvents()
    $(".submitButton").click(function () {
        event.preventDefault()
        $('.carouselHeader').addClass('hide')
        $('.festivalCard').addClass('hide')
        $('.mapEvents').removeClass('hide')
        makeSearch()
        
    })
    $(".buttonBar").on("click", ".pageButton", function () {
        var page = $(this).text()
        if (page != ">" && page != "<") {
            activePage = page
            displayPage()
        } else if (page == ">") {
            for (var i = 0; i < 10; i++) {
                var current = $($(".buttonBar").children()[i + 1]).text()
                var last = $(".buttonBar").children().last().prev().text()
                if (last == pages.length) { return }
                if (current == ">" || current == "<") { continue }
                $(".buttonBar").children()[i + 1].firstChild.innerText = Number(1) + Number(current)
            }
        } else if (page == "<") {
            var first = $(".buttonBar").children().first().next().text()
            if (first != "1") {
                for (var i = 0; i < 10; i++) {
                    var current = $($(".buttonBar").children()[i + 1]).text()
                    if (current == ">" || current == "<") { continue }
                    $(".buttonBar").children()[i + 1].firstChild.innerText = Number(current) - Number(1)
                }
            }
        }
    })
})

function makeSearch(){
    var state = $("input[type = search]").val()
        locationParameters.state = state

        var startD = (moment(moment($(".start-date").val(), "MM-DD-YYYY")).format("YYYY-MM-DD"))
        if (startD == 'Invalid date') {
            startD = ""
        }

        var endD = (moment(moment($(".end-date").val(), "MM-DD-YYYY")).format("YYYY-MM-DD"))
        if (endD == 'Invalid date') {
            endD = ""
        }
        eventParameters.startDate = startD
        eventParameters.endDate = endD
        getStateId()
}

function createEventName(event) {
    var eventName = event.name
    if (eventName == null) {
        eventName = ""
        for (var i in event.artistList) {
            if (i == 0) {
                eventName += event.artistList[i].name
                continue
            }
            eventName += ", " + event.artistList[i].name
        }
    }
    return eventName
}

function createCard(event,target) {
    var target = target|| $(".cardDisplay")
    var card = $("<div>").addClass("card eventCard p-3 w-100 my-3 ml-3 shadow-sm")
    card.attr('data', JSON.stringify(event))

    var topRow = $("<div>").addClass("row")

    var nameCol = $("<div>").addClass("col-8")
    var nameElem = $("<h5>").addClass("card-title")
    nameElem.css({
        width: "fit-content"
    })
    var eventName = createEventName(event)

    /*jack added like button*/
    var heartFull = $("<img>").attr('src', 'assets/images/like-full.png').addClass(" heartButton heartButtonFull")
    var heartEmpty = $("<img>").attr('src', 'assets/images/like-empty.png').addClass(" heartButton heartButtonEmpty")

    heartFull.css({
        'width': '25px',
        'height': '25px'
    })
    heartEmpty.css({
        'width': '25px',
        'height': '25px'
    })

    nameElem.text(eventName)
    nameCol.append(nameElem)
    topRow.append(nameCol)

    var dateCol = $("<div>").addClass("col-4 text-right")
    var convertedDate = moment(event.date, "YYYY-MM-DD");
    dateCol.text(moment(convertedDate).format("MM/DD/YY"))
    topRow.append(dateCol)
    card.append(topRow)

    var bottomRow = $("<div>").addClass('row')
    var locationCol = $("<div>").addClass("col-11")
    var locationP = $("<p>").css({width:"fit-content"})
    locationP.text(event.venue.address)
    locationCol.append(locationP)
    bottomRow.append(locationCol)


    if (event.festivalInd == true) {
        locationCol.addClass('col-10')
        var badgeCol = $("<div>").addClass('col-2 text-right')
        var badgeText = $("<p>").addClass("badge-warning text-black text-center")
        badgeText.text('Electronic Festival')
        badgeCol.append(badgeText)
        bottomRow.append(badgeCol)
    }

    card.append(bottomRow)
    if(liked[event.id]==null){
        bottomRow.append(heartEmpty)
    }else{
        bottomRow.append(heartFull)
    }

    target.append(card)


    /*jack added like button*/
    $(heartEmpty).each(function () {
        heartEmpty.click(function () {
            var data = JSON.parse($(this).parent().parent().attr("data"))
            liked[data.id]=data
            localStorage.setItem("liked",JSON.stringify(liked))
            $(heartEmpty).remove();
            bottomRow.append(heartFull);
            refreshLikedLightbox()
        });
    });


    $(heartFull).each(function () {
        heartFull.click(function () {
            var data = JSON.parse($(this).parent().parent().attr("data"))
            delete liked[data.id]
            localStorage.setItem("liked",JSON.stringify(liked))
            $(heartFull).remove();
            bottomRow.append(heartEmpty);
            refreshLikedLightbox()
        });
    });
}

function openLightbox(target){
    target.animate({
        right:'0px',
    })

}
function closeLightbox(target){

    target.animate({
        right:'-40%',
    })

}

function splitAddress(address) {
    array = address.split(",")
    let a1 = array[0]
    let a2 = array[1] + "," + array[2]
    $(".lightbox-address-1").text(a1)
    $(".lightbox-address-2").text(a2)
}

function lightbox(event) {
    openLightbox($(".lightbox"))
    var eventName = createEventName(event)
    $(".lightbox-title").text(eventName)
    var convertedDate = moment(event.date, "YYYY-MM-DD");
    $(".lightbox-date").text(moment(convertedDate).format("MM/DD/YY"))
    $(".lightbox-venue").text(event.venue.name)
    splitAddress(event.venue.address)
    let ticketURL = (`<a href=` + event.ticketLink + ` target='_blank' +><i class="fas fa-ticket-alt"></i></a>`)
    $(".lightbox-ticketURL").html(ticketURL)
    let ticketInfo = (`<a href=` + event.link + ` target='_blank' +><i class="fas fa-info-circle"></i></a>`)
    $(".lightbox-infoURL").html(ticketInfo)
    let weatherInfo = (`<div class="result_lb" id="weather-data"></div>`) 
    /* API2 Do not remove ---- let weatherInfo = (`<div class="lightbox-weather"><div id="result_lb" style="display: none"><div id="icon"></div><div id="city"><strong></strong></div><div id="weather"></div></div>`) */
    $(".lightbox-weather").html(weatherInfo)
    let shareInfo = (`<h4>Share this event:</h4> <a href="mailto:?Subject=Simple Share Buttons&amp;Body=I%20saw%20this%20and%20thought%20of%20you!%20` + event.ticketLink + `"><img src="https://simplesharebuttons.com/images/somacro/email.png" width="30px" alt="Email" /></a>
    <a href="http://www.facebook.com/sharer.php?u=` + event.ticketLink+ `" target="_blank"><img src="https://simplesharebuttons.com/images/somacro/facebook.png" width="30px" alt="Facebook" /></a>
    <a href="https://plus.google.com/share?url=` + event.ticketLink+ `" target="_blank"><img src="https://simplesharebuttons.com/images/somacro/google.png" width="30px" alt="Google" /></a>
    <a href="http://www.linkedin.com/shareArticle?mini=true&amp;url=` + event.ticketLink + `https://simplesharebuttons.com" target="_blank"><img src="https://simplesharebuttons.com/images/somacro/linkedin.png" width="30px" alt="LinkedIn" /></a>
    <a href="http://www.tumblr.com/share/link?url=` + event.ticketLink+ `&amp;title=Simple Share Buttons" target="_blank"><img src="https://simplesharebuttons.com/images/somacro/tumblr.png" width="30px" alt="Tumblr" /></a>
    <a href="https://twitter.com/share?url=` + event.ticketLink+ `&amp;text=Simple%20Share%20Buttons&amp;hashtags=simplesharebuttons" target="_blank"><img src="https://simplesharebuttons.com/images/somacro/twitter.png" width="30px" alt="Twitter" /></a>`)
    $(".lightbox-share").html(shareInfo)
    restaurants(event.venue.address)
    getWeather(event.venue.address)
}

$(function () {
    $(".cardDisplay").on("click", ".eventCard", function () {
        var event = JSON.parse($(this).attr('data'))
        lightbox(event)
    })
})

$('.closeLightbox').on('click', function () {
    closeLightbox($(".lightbox"))
})


function createPageButtons(pageNum) {
    var col = $("<div>").addClass("col mx-0 px-0 ")
    var butt = $("<button>").addClass("d-inline pageButton")
    butt.text(pageNum)
    col.append(butt)
    $(".buttonBar").append(col)
}

function displayPage() {
    $(".cardDisplay").empty()
    for (var i in pages[activePage]) {
        createCard(pages[activePage][i])
    }
    //deletes pre-existing markers on map
    deleteMarkers()
    //creates a marker on the map
    for (var i in pages[activePage]) {
        var event = pages[activePage][i]
        var eventName = createEventName(event)
        var pos = { lat: event.venue.latitude, lng: event.venue.longitude }
        var contentHTML= '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">'+eventName+'</h1>'+
        '<div id="bodyContent">'+
        '<p>'+event.venue.name+'</p>'+
        '<p><a href = '+event.link+'>MORE INFO</a></p>'+
        '</div>'+
        '</div>';
        var infowindow = new google.maps.InfoWindow();
          lastOpenedInfoWindow=infoWindow
        var marker = new google.maps.Marker({
            position: pos, 
            title: createEventName(event)
        });
        google.maps.event.addListener(marker,'click', (function(marker,contentHTML,infowindow,eventName){ 
            return function() {
                closeLastOpenedInfoWindow()
                // infowindow.open(map,marker);
                infowindow.setContent(contentHTML);
                var correspondingCard = findEventCard(eventName);
                correspondingCard.click()
            };
        })(marker,contentHTML,infowindow,eventName));  
    markers.push(marker)
    map.setCenter(pos)
    // marker.setAnimation(google.maps.Animation.BOUNCE)
}
setMapOnAll(map)

}
function findEventCard(title){
    var eventsOnPage = $(".cardDisplay").children()
    for(var i in eventsOnPage){
        var card  = eventsOnPage[i];
        var data = JSON.parse($(card).attr("data"))
        if (createEventName(data) == title){return card}
    }
}
function featuredEvents() {
    var parameters = {
        client: "d5cf6acf-f0c3-408b-9a6c-31d016f980aa",
    }
    var query = $.param(parameters);
    $.ajax({
        url: "https://edmtrain.com/api/events?" + query,
        method: "GET",
    }).done(function (response) {
        var dataList = response.data
        var counter = 0;
        var addedFeatureds = []
        for (var i in dataList) {
            var event = dataList[i]
            for (var n in featured) {
                var fName = featured[n]
                if (event.name == null) { continue }
                if (addedFeatureds.indexOf(event.name) > -1) { continue }
                if (event.name.toLowerCase().search(fName) > -1) {
                    addedFeatureds.push(event.name)
                    counter++
                    var target = $(".featured" + counter)
                    var stateElem = target.children().first().children()
                    stateElem.text(event.venue.state)
                    var titleElem = target.children().last().children().first()
                    titleElem.text(event.name)
                    var linkElem = target.children().last().children().last()
                    linkElem.attr('href', event.ticketLink)
                    var dateElem = target.children().first().next().children().first().next().children().first()
                    var convertedDate = moment(event.date, "YYYY-MM-DD");
                    dateElem.text(moment(convertedDate).format("MM/DD/YY"))
                    var venueElem = target.children().first().next().children().first().next().children().first().next()
                    venueElem.text(event.venue.name)
                    var addressElem = target.children().first().next().children().first().next().children().first().next().next()
                    addressElem.text(event.venue.address)
                    if (counter == 4) { return }
                }
            }
        }
    })
}

