/* eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoidGhhbmhuZ29jIiwiYSI6ImNrdWFub2ZtOTBpZTgybm1vOWJwNTJlbHUifQ.3pJ9McT_RoqeCaOAdtGMUg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/thanhngoc/ckuanw2gy7a5w17s9cpnk71kf',
    scrollZoom: false,
    //   center: [-118, 34],
    //   zoom: 10,
    //   interactive: false,
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(loc.coordinates).addTo(map);
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, { padding: { top: 200, bottom: 150, left: 100, right: 100 } });
};
