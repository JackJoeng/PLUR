var events = {}

var eventParameters = {
    client: "d5cf6acf-f0c3-408b-9a6c-31d016f980aa",
    locationIds: "38"
}

function getEvents() {
    var query = $.param(eventParameters);
    $.ajax({
        url: "https://edmtrain.com/api/events?" + query,
        method: "GET",
        contentType: 'text/plain',
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    }).done(function (response) {
        var dataList = response.data
        for (var i in dataList) {
            events[dataList[i].id] = datalist[i]
        }
        console.log(events)
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
    location: "New York"
}

function getStateId() {
    var query = $.param(locationParameters)
    $.ajax({
        url: "https://edmtrain.com/api/locations?" + query,
        method: "GET"
    }).done(function (response) {
        console.log(response)
    }).fail(function () {
        console.log(locationData)
    })
}