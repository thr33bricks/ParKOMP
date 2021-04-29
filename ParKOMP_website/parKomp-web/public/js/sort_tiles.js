function itemSelected(){
    var dropdwn = document.getElementById("drpdwn_srt");
    if(dropdwn.value == "loc"){
        sortByStr("tile_location");
    }
    else if(dropdwn.value == "date"){
        sortByDate();
    }
    else{
        sortByStr("tile_car_name");
    }
}

function sortByStr(clName) {
    var elements = document.getElementsByClassName("tile");
    var tiles = [];

    for (var i=0; i<elements.length; i++) {
        var prop = null;
        for (var x = 0; x < elements[i].childNodes.length; x++) {
            if (elements[i].childNodes[x].className == clName) {
                prop = elements[i].childNodes[x].innerHTML;
                break;
            }        
        }
        tiles.push([prop, elements[i]]);
    }
    console.log(tiles);
    tiles.sort(function compare( a, b ) {
        if (a[0] < b[0]){
          return -1;
        }
        if (a[0] > b[0]){
          return 1;
        }
        return 0;
    });
    for (var i=0; i<tiles.length; i++) {
        var cont = document.getElementById("main");
        cont.appendChild(tiles[i][1]);
    }
}

function sortByDate() {
    var elements = document.getElementsByClassName("tile");
    var tiles = [];

    for (var i=0; i<elements.length; i++) {
        var prop = null;
        for (var x = 0; x < elements[i].childNodes.length; x++) {
            if (elements[i].childNodes[x].className == "tile_date") {
                var date = elements[i].childNodes[x].innerHTML; //date-month-year
                var parts = date.split('-');
                prop = new Date(parts[2], parts[1], parts[0]); //year-month-date
                break;
            }        
        }
        tiles.push([prop, elements[i]]);
    }
    console.log(tiles);
    tiles.sort(function(a,b){
        return new Date(b[0]) - new Date(a[0]);
    });
    for (var i=0; i<tiles.length; i++) {
        var cont = document.getElementById("main");
        cont.appendChild(tiles[i][1]);
    }
}