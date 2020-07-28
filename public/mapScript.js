      var map, marker, infowindow, geocoder;
      let coordinates = document.getElementById("coordinates")
      coordinates.innerHTML= "";

      function initMap() {
        var myLatLng = { lat: 38.5382783, lng: -121.7627639 };

        map = new google.maps.Map(document.getElementById("map"), {
          center: myLatLng,
          zoom: 15
        });
        geocoder = new google.maps.Geocoder();
        marker = new google.maps.Marker();
        marker.setPosition(map.center);
        marker.setDraggable(true);
        marker.setMap(map);
        
        google.maps.event.addListener(marker, "dragend", function(marker) {
          var latLng = marker.latLng;
          
          
          geocoder.geocode({ location: latLng }, function(results, status) {
            if (status === "OK") {
              if (results[0]) {
                //map.setZoom(11);
                document.getElementById("search-input").value = results[0].formatted_address;
                console.log(results[0].formatted_address);
                coordinates.innerHTML= results[0].formatted_address;
                console.log(coordinates);
                
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });
        });
      }
      function search() {
        let url =
          "/searchAddress?input=" +
          document.getElementById("search-input").value +
          ",Davis";
        fetch(url)
          .then(res => res.json())
          .then(data => {
            console.log(data);
            document.getElementById("search-input").value =
              data.candidates[0].name +
              ", " +
              data.candidates[0].formatted_address;
            marker.setPosition(data.candidates[0].geometry.location);
            map.setCenter(data.candidates[0].geometry.location);

            let coordMaker= data.candidates[0].geometry.location.lat;
            coordMaker = coordMaker + ", "
            coordMaker = coordMaker + data.candidates[0].geometry.location.lng
            
            coordinates.innerHTML= data.candidates[0].formatted_address;
            console.log(data.candidates[0].formatted_address);
          });

        function geocodeLatLng(geocoder, map, infowindow) {
          var input = document.getElementById("latlng").value;
          var latlngStr = input.split(",", 2);
          var latlng = {
            lat: parseFloat(latlngStr[0]),
            lng: parseFloat(latlngStr[1])
          };
          coordinates.innerHTML= latlng;
          console.log("HELOSDA");
          geocoder.geocode({ location: latlng }, function(results, status) {
            if (status === "OK") {
              if (results[0]) {
                map.setZoom(11);
                var marker = new google.maps.Marker({
                  position: latlng,
                  map: map
                });
                infowindow.setContent(results[0].formatted_address);
                infowindow.open(map, marker);
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });
        }
      }