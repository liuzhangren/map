import Vue from 'vue'
import App from './App.vue'
import { 
  Map, 
  TileLayer, 
  OsmSource, 
  Geoloc, 
  SputnikSource, 
  WmtsSource, 
  WmsSource, 
  ImageLayer,
  ImageStaticSource,
  VectorLayer,
  IconStyle,
  VectorSource,
  Feature,
  StyleBox,
  PointGeom,
  TextStyle,
  StrokeStyle,
  FillStyle
} from 'vuelayers'
import iView from 'iview'
import router from './router'
import 'iview/dist/styles/iview.css'
import 'vuelayers/lib/style.css'

Vue.config.productionTip = false
Vue.use(iView)
Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)
Vue.use(Geoloc)
Vue.use(SputnikSource)
Vue.use(ImageLayer)
Vue.use(ImageStaticSource)
Vue.use(VectorLayer)
Vue.use(IconStyle)
Vue.use(VectorSource)
Vue.use(Feature)
Vue.use(StyleBox)
Vue.use(PointGeom)
Vue.use(TextStyle)
Vue.use(StrokeStyle)
Vue.use(FillStyle)

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
