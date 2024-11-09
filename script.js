var map, overlay;

//Function to initialise Google Maps map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5.7,
        center: { lat: 55.7609, lng: -2.4282 }, //centers the map perfectly
    });

    //Create a new overlay
    overlay = new google.maps.OverlayView();

    //Overlay added to the map
    overlay.onAdd = function() {
        //Create a D3 overlay
        let layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
            .attr("class", "overlay-layer");

        //Load data this also draws the markers
        loadData(layer);

        //Draw markers on the map
        overlay.draw = function() {

            //Exit if data hasn't loaded
            if (overlay.data === undefined || overlay.data === null) {
                return;
            }

            //Clear existing markers
            layer.selectAll("svg").remove();

            let projection = this.getProjection();
            let padding = 10;

            //SVG elements for each marker
            let markers = layer.selectAll("svg")
                .data(overlay.data)
                .enter()
                .append("svg")
                .attr("class", "marker");

            markers.each(function(town) {

                //Convert lat/lng to pixel coordinates
                let latLng = new google.maps.LatLng(town.lat, town.lng);
                let point = projection.fromLatLngToDivPixel(latLng);

                //Position markers to the pixel coordinates
                d3.select(this)
                    .style("left", (point.x - padding) + "px")
                    .style("top", (point.y - padding) + "px");

                //Scale radius based on population, 0.02 works best
                let radius = Math.sqrt(town.Population) * 0.02;

                //Circle of each marker
                d3.select(this).append("circle")
                    .attr("r", radius)
                    .attr("cx", padding)
                    .attr("cy", padding)
                    .attr("fill", "blue")
                    .attr("fill-opacity", 0.6);

                //Text label for the town name
                d3.select(this).append("text")
                    .attr("x", padding + 12)
                    .attr("y", padding + 4)
                    .text(town.Town)
                    .attr("class", "town-name");
            });

            //Update towns list
            updateVisibleTowns();
        };
    };

    //Set overlay
    overlay.setMap(map);
}

//Function to load data from json URL provided
function loadData(layer) {

    d3.json("http://34.147.162.172/Circles/Towns/50").then(data => {
        overlay.data = data;
        //Test data has loaded
        console.log(data);
        //Should be first draw
        overlay.draw();
    });
}

//Function to update the list of towns on map
function updateVisibleTowns() {

    const bounds = map.getBounds();

    //Look for towns in the current bounds of the map
    //ChatGPT showed how to do this part, I feel it adds a really cool feature
    const visibleTowns = overlay.data.filter(town => 
        bounds.contains(new google.maps.LatLng(town.lat, town.lng))
    );

    //Update the list to show the towns on the map
    const townsList = d3.select("#visibleTowns");
    townsList.selectAll("li").remove();
    townsList.selectAll("li")
        .data(visibleTowns)
        .enter()
        .append("li")
        .text(town => `${town.Town}`);
}

//Function to reload
function reloadData() {

    const layer = d3.select(".overlay-layer");
    loadData(layer);
}