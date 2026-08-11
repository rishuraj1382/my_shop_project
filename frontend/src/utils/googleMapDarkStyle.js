// frontend/src/utils/googleMapDarkStyle.js
// Google Maps renders its own tiles via canvas/WebGL, outside our CSS/token system —
// the only way to theme it is the Maps JS API's `styles` array, passed conditionally
// based on the app's resolved theme. Standard dark "night mode" style rules.
const GOOGLE_MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#767676' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#213529' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2f2f2f' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17573d' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5c8f79' }] },
];

export default GOOGLE_MAP_DARK_STYLE;
