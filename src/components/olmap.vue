<template>
  <vl-map :controls="controls" id="map"  @click="mapClick"  :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
    <Cascader @on-change="handleChange" class="select" :data="data" v-model="value1"></Cascader>
    <Input @on-blur='onBlur' @on-search="search" style="width: 200px; position: absolute; left: 20px; top: 50px;" class="search" search enter-button="Search" placeholder="Enter something..." />
    <List id="list" style="width: 400px; padding: 4px; min-height: 20vh; max-height: 80vh; overflow-y: auto; overflow-x: auto; position: absolute; top: 100px; left: 20px; z-index: 5; background-color: white; display: none" item-layout='vertical'>
      <ListItem v-for="item in searchData" :key="item.title">
        <ListItemMeta :title="item.title" :description='item.description'>
          {{item.content}}
        </ListItemMeta>
        <template slot="action">
          <li style="float: right">
              <Icon @click="jumpTo(item)" style="color: red" type="md-flag" />
          </li>
        </template>
        <template slot="extra">
            <img :src="item.url" style="width: 140px; height: 110px; margin-right: 8px">
        </template>
      </ListItem>
    </List>
    <Button class="btn3" @click="showText" type="default">POI名称</Button>
    <Button class="btn2" @click="addPOI" type="primary">添加POI点</Button>
    <Button class="btn1" @click="showPoiList" type="info">POI列表</Button>
    <Modal id="popup" v-model="modal1"  @on-cancel="Radio_cancel"  width="360">
          <p slot="header" style="color:#f60;text-align:center">
              <Icon type="ios-information-circle"></Icon>
              <span>选择操作</span>
          </p>
          <div style="text-align:center">
            <RadioGroup @on-change="radioChange" v-model="type">
                <Radio label="lanya">
                    <span>绑定蓝牙</span>
                </Radio>
                <Radio label="GPS">
                    <span>绑定GPS</span>
                </Radio>
            </RadioGroup>
          </div>
          <div slot="footer">
              <Button type="primary" size="large" long @click="confirm">确定</Button>
          </div>
      </Modal>
      <div id='popName'>
        <h3 id='content'></h3>
      </div>
      <Modal @on-ok="modalOfLanyaFormOk" title="填写蓝牙信息" v-model="lanyaModal" width="40%">
          <Form :model="lanyaForm" :label-width="90">
            <FormItem label="蓝牙mac地址:">
              <Input  v-model="lanyaForm.input1" placeholder="Enter something..." />
            </FormItem>
            <FormItem  label="蓝牙名称:">
              <Input  v-model="lanyaForm.input2" placeholder="Enter something..." />
            </FormItem>
            <FormItem  label="蓝牙触发强度:">
              <Input  v-model="lanyaForm.input3" placeholder="Enter something..." />
            </FormItem>
            <FormItem  label="蓝牙UUID:">
              <Input  v-model="lanyaForm.input4" placeholder="Enter something..." />
            </FormItem>
            <FormItem  label="蓝牙major:">
              <Input  v-model="lanyaForm.input5" placeholder="Enter something..." />
            </FormItem>
            <FormItem  label="蓝牙minor:">
              <Input  v-model="lanyaForm.input6" placeholder="Enter something..." />
            </FormItem>
            <FormItem label="蓝牙备注:">
              <Input v-model="lanyaForm.input7" placeholder="Enter something..." />
            </FormItem>
          </Form>
      </Modal>
      <Modal title="填写GPS信息" v-model="GPSModal" @on-ok="saveGPS" @on-cancel="writeGpsMsgCancel"  width="40%">
        <Form :model="gpsForm" :label-width="90">
          <FormItem label="GPS经度:">
            <Input v-model="gpsForm.input1" placeholder="Enter something..." />
          </FormItem>

          <FormItem label="GPS纬度:">
            <Input v-model="gpsForm.input2" placeholder="Enter something..." />
          </FormItem>
        </Form>
      </Modal>

      <Modal
        v-model="modalAddPOI"
        title="添加POI点"
        @on-cancel="modalAddPOI_cancel"
      >
          <Form :model="POIForm" :label-width="80">
            <FormItem style="display: flex; just-content: center" label="POI名称:">
              <Input style="width: 200px" v-model="POIForm.input1" placeholder="Enter something..." />
            </FormItem>
            <FormItem style="display: flex; just-content: center" label="POI坐标:">
              <Input style="width: 98px" v-model="POIForm.input2" placeholder="经度" />
              -<Input style="width: 98px" v-model="POIForm.input4" placeholder="纬度" />
            </FormItem>
          </Form>
          <div slot="footer">
            <Button type="warning" :loading="modal_loading" @click="modalAddPOI_cancel">取消</Button>
            <Button type="info" :loading="modal_loading" @click="modalAddPOI_ok">确定</Button>
          </div>
      </Modal>
        <Modal
          id = 'special'
          v-model="modalAddPOIList"
          title="POI列表"
          footerHide
          footer-hide='true'
          @on-ok="ok"
          @on-cancel="cancel"
          >
          <Menu @on-select="menuSelect" style="max-height: 600px ;overflow-y:auto" active-name="1">
            <MenuItem v-for="i in menuRight" :key="i.id" :name="i">
              {{i.name}}
            </MenuItem>
          </Menu>
      </Modal>
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
    <vl-layer-tile>
      <vl-source-sputnik :url="url" :attributions="attributions" :layer-name="layerName" :matrix-set="matrixSet" :format="format"></vl-source-sputnik>
    </vl-layer-tile>
    <vl-geoloc>
      <template>
        <vl-feature v-for="(item) in poiList" :id="item.id" :key="item.id">
          <vl-geom-point  :coordinates="item.position"></vl-geom-point>
           <vl-style-box>
             <vl-style-text v-if="textVisible" :text="item.name" :scale="1.3" :offsetY="-40">
                <vl-style-fill color="white"></vl-style-fill>
                <vl-style-stroke color="red"></vl-style-stroke>
              </vl-style-text>
              <vl-style-icon v-if="!item.status" :src="img" :scale="0.03" :opacity='0.6' :anchor="[0.5, 1]"></vl-style-icon>
              <vl-style-icon v-else :src="img2" :scale="0.03" :opacity='0.6' :anchor="[0.5, 1]" ></vl-style-icon>
            </vl-style-box>
        </vl-feature>
      </template>
    </vl-geoloc>
  </vl-map>
</template>

<script>
  import VueLayers from 'vuelayers'
  import axios from 'axios'
  import config from '../../config'
  import { MAP, LOGIN } from '../../config'
  import Cookies from 'js-cookie'
  import img from '../assets/31567870801_.pic.jpg'
  import img2 from '../assets/31567870801_blue.jpg'
  let size = [1024, 968]
  let extent = [0, 0, ...size]
  export default {
    name: 'Map',
    data () {
      return { 
        zoom: 13,
        controls: {
          ZoomToExtent: true
        },
        geoloc: {
          position: [121.514585, 31.22461],
        },
        img: img,
        img2: img2,
        jugeIsSave: false,
        menuRight: ['1', '2'],
        center: [121.446235, 31.169152],
        poiList: [],
        rotation: 0,
        deviceType: 0,
        lanyaForm: {
          input1: '',
          input2: '',
          input3: '',
          input4: '',
          input5: '',
          input6: '',
          input7: ''
        },
        gpsForm: {
          input1: '',
          input2: ''
        },
        cityId: 310104,
        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
        layerName: '0',
        matrixSet: 'EPSG:4326',
        format: 'image/png',
        styleName: 'default',
        attributions: '',
        value1: [],
        seleted: false,
        fourthData: '',
        attractions: [],
        model1: '',
        modal1: false,
        lanyaModal: false,
        GPSModal: false,
        modalAddPOI: false,
        POIForm: {
          input1: '',
          input2: '', //经度
          input3: '',
          input4: '' //纬度
        },
        type: 'lanya',
        modalAddPOIList: false,
        searchData:[
          {
            title: 'This is title 1',
            description: 'This is description, this is description, this is description.',
            avatar: 'https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar',
            content: 'This is the content, this is the content, this is the content, this is the content.'
          },
          {
            title: 'This is title 2',
            description: 'This is description, this is description, this is description.',
            avatar: 'https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar',
            content: 'This is the content, this is the content, this is the content, this is the content.'
          },
          {
            title: 'This is title 3',
            description: 'This is description, this is description, this is description.',
            avatar: 'https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar',
            content: 'This is the content, this is the content, this is the content, this is the content.'
          }
        ],
        formItem: {
            input: '',
            select: '',
            radio: 'male',
            checkbox: [],
            switch: true,
            date: '',
            time: '',
            slider: [20, 50],
            textarea: ''
        },
        textVisible: true,
        menuList: [
          {
            value: 'bindLany',
            label: '绑定蓝牙'
          },
          {
            value: 'bindGPS',
            label: '绑定GPS'
          }
        ],
        data: []
      }
    },
    created() {
      // console.log('created',Cookies.get('token'))
      if(Cookies.get('token') === '') {
        if(config.LOGIN === LOGIN) {
          this.$router.push(LOGIN)
          window.location.href = config.LOGIN
        }else {
          window.location.href = `${config.isHttps?'https':'http'}://${config.host}:${config.port}${config.LOGIN}`
        }
      }
    },
    async mounted() {
      let res = await axios.get('http://106.14.190.2:8001/city/findTree')
      this.token = Cookies.get('token')
      let POIList = await axios.post('http://106.14.190.2:8001/push/poi/findListBy')
      this.POIList = POIList
      //menu的结构
      this.menuRight = POIList.data.data.reduce((r, c) => {
        return [
          ...r,
          ...(c.cityId === this.cityId?[c]:[])
        ]
      }, [])
      // this.cityId
      //做插标的数据结构
      this.poiList = POIList.data.data.reduce((r, c) => {
        return [
          ...r,
          {
            id: c.id,
            name: c.name,
            cityId: c.cityId,
            position: [c.lng, c.lat],
            poiType: c.poiType,
            status: false
          }
        ]
      }, [])
      console.log('lalala', this.poiList)
      //递归组装children层级
      const threeCascader = (res) => {
        return res.reduce((r, c) => {
          if(c.children.length > 0) {
            let cache = threeCascader(c.children)
            r.push({
              value: c.code,
              label: c.name,
              children: cache,
              latitude: c.latitude,
              longitude: c.longitude
            })
          }else {
            r.push({
              value: c.code,
              label: c.name,
              latitude: c.latitude,
              longitude: c.longitude
            })
          }
          return r
        }, [])
      }
      this.data = threeCascader(res.data.data)
      console.log('--------', res.data.data)
    },
    methods: {
      async confirm() {
        this.modal1 = false
        if(this.type==='lanya') {
          this.lanyaModal = true
        }else {
          this.GPSModal = true
        }
        console.log(this.selectedId)
        const res = this.poiList.reduce((r, c) => {
          if(c.id === this.selectedId) {
            r.push(c)
          }
          return r
        }, [])[0]

        console.log('hello world', res)
        // console.log('123', this.poiList[this.selectedId].id)
        let result = await axios.post('http://106.14.190.2:8001/push/device/findListeBy', {})
        console.log(result)
        const reWrite = result.data.data.reduce((r, c) => {
          if(c.poiId === res.id) {
            r.push(c)
          }
          return r
        }, [])
        console.log({reWrite})
        if(reWrite.length > 0) {
          this.jugeIsSave = true
          this.gpsForm.input1 = reWrite[0].lng
          this.gpsForm.input2 = reWrite[0].lat
          this.updateId = reWrite[0].id
          this.lanyaForm.input1 = reWrite[0].mac
          this.lanyaForm.input2 = reWrite[0].name
          this.lanyaForm.input3 = reWrite[0].offset
          this.lanyaForm.input4 = reWrite[0].uuid
          this.lanyaForm.input5 = reWrite[0].major
          this.lanyaForm.input6 = reWrite[0].minor
          this.lanyaForm.input7 = reWrite[0].remark
        }else {
          this.jugeIsSave = false
          this.updateId = ''
          console.log('回填', res)
          this.lanyaForm.input2 = res.name
          
          this.lanyaForm.input1 = ''
          this.lanyaForm.input3 = ''
          this.lanyaForm.input4 = ''
          this.lanyaForm.input5 = ''
          this.lanyaForm.input6 = ''
          this.lanyaForm.input7 = ''

          this.gpsForm.input1 = res.position[0]
          this.gpsForm.input2 = res.position[1]
        }
        
      }, 
      async saveGPS() {
        const item = this.poiList.reduce((r, c, i) => {
          if(c.id === this.selectedId) {
            r.push(c)
          }
          return r
        }, [])[0]
        const { status, ...rest } = item
        console.log(this.updateId)
        
        try {
          const rrr = await axios.post('http://106.14.190.2:8001/push/device/save', {
            poiId: rest.id,
            ...(this.jugeIsSave?{id: this.updateId}:{}),
            name: rest.name,
            cityId: rest.cityId,
            lng: this.gpsForm.input1,
            lat: this.gpsForm.input2,
            deviceType: this.deviceType
          }, {
            headers: {
              token: Cookies.get('token')
            }
          })
        } catch(err) {
          console.log(err)
        }
      },
      async modalOfLanyaFormOk() {
        // console.log(this.lanyaForm.input1)
        const item = this.poiList.reduce((r, c, i) => {
          if(c.id === this.selectedId) {
            r.push(c)
          }
          return r
        }, [])[0]
        const { status, ...rest } = item
        console.log({rest})
        try {
          const rrr = await axios.post('http://106.14.190.2:8001/push/device/save', {
            poiId: rest.id,
            ...(this.jugeIsSave?{id: this.updateId}:{}),
            name: rest.name,
            cityId: rest.cityId,
            lng: rest.position[0],
            lat: rest.position[1],
            deviceType: this.deviceType,
            mac: this.lanyaForm.input1,
            triggerRssi: Number(this.lanyaForm.input3),
            uuid: this.lanyaForm.input4,
            major: this.lanyaForm.input5,
            minor: this.lanyaForm.input6,
            remark: this.lanyaForm.input7
          }, {
            headers: {
              token: Cookies.get('token')
            }
          })
        } catch(err) {
          console.log(err)
        }
        let result = await axios.post('http://106.14.190.2:8001/push/device/findListeBy', {})
        console.log('push/device/list --->>>', result)
        if(!this.jugeIsSave) {
          const rr = await axios.post('http://106.14.190.2:8001/push/bindPoi/save', {
            poiId: rest.id,
            deviceId: result.data.data[0].id
          }, {
            headers: {
              token: Cookies.get('token')
            }
          })
          console.log('绑定', rr)
        }
        const lastData = result.data.data.reduce((r, c) => {
          if(c.poiId === rest.id) {
            r.push(c)
          }
          return r
        }, [])
        
        console.log({rrr})
        // if(re.data.status=)
      },
      Radio_cancel() {
        this.modal1 = false
      },
      Radio_ok() {
        console.log('hello world')
      },
      writeGpsMsgCancel() {
        this.GPSModal = false
      },
      mapClick(e) {
        document.getElementById('list').style.display = 'none'
        let that = this
        let pixel = e.map.getEventPixel(e.originalEvent);
        e.map.forEachFeatureAtPixel(pixel, function(feature) {
          that.modal1 = true
          that.selectedId = feature.id_
          that.poiList = that.poiList.reduce((r, c) => {
            if(c.id === feature.id_) {
              c.status = true
            }else {
              c.status = false
            }
            r.push(c)
            return r
          }, [])
        })
        if(!this.modal1) {
          this.poiList.push({
            name: '',
            id: '',
            position: e.coordinate,
            type: 'test'
          })
          this.modalAddPOI = true
          this.POIForm.input2 = e.coordinate[0]
          this.POIForm.input4 = e.coordinate[1]
        }
      },
      menuSelect(value) {
        console.log('menuSelect',value)
        this.center = [value.lng,value.lat]
        // this.zoom = 16
        this.poiList = this.poiList.reduce((r, c, i) => {
          if(value.id === c.id) {
            c.status = true
          }else {
            c.status = false
          }
          r.push(c)
          return r
        }, [])
        this.modalAddPOIList = false

      },
      handleChange (value, selectedData) {
        this.center = [selectedData[selectedData.length - 1].longitude, selectedData[selectedData.length - 1].latitude]
        // console.log(selectedData)
        this.cityId = selectedData[selectedData.length - 1].value
        // console.log(selectedData[selectedData.length - 1])
        this.menuRight = this.POIList.data.data.reduce((r, c) => {
          return [
            ...r,
            ...(c.cityId === this.cityId?[c]:[])
          ]
        }, [])
        console.log(this.menuRight)
      },
      radioChange (value) {
        // console.log(value)
        this.deviceType = value === 'GPS'?1:0
      },
      async search(value) {
        if(value !== '') {
          const res = await axios.get('https://restapi.amap.com/v3/place/text', {
            params: {
              key: 'ce9078cdd84ecbde67d73c2fd09a9c6a',
              keywords: value,
              city: this.cityId,
              types: 110000
            }
          })
          console.log('高德景点', res.data)
          this.searchData = res.data.pois.reduce((r, c) => {
            return [
              ...r,
              {
                title: c.name,
                location: c.location,
                description: `地址：${c.cityname}/${c.adname}/${c.address}`,
                url: c.photos.length > 0 ? c.photos[0].url : 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1570696568597&di=2d68b1eef6f79d475d1005f6e310d639&imgtype=0&src=http%3A%2F%2Ffs.zhenjiang365.cn%2Fbbsimg%2Ffcmb%2Fimage%2Fnopic590.jpg'
              }
            ]
          }, []) 
          document.getElementById('list').style.display = 'block'
        }else {
          this.$Message.error('搜索条件为空');
        }
      },
      jumpTo(item) {
        const arr = item.location.split(',')
        const newArr = arr.reduce((r, c) => {
          return [
            ...r,
            Number(c)
          ]
        }, [])
        this.center = newArr
      },
      // onBlur() {
      //   document.getElementById('list').style.display = 'none'
      // },
      async modalAddPOI_ok() {
        if(this.POIForm.input1 === '') {
          this.$Message.error('poi名称未填写');
        }else if(this.POIForm.input2 === '') {
          this.$Message.error('poi经度未填写');
        }else if(this.POIForm.input4 === '') {
          this.$Message.error('poi纬度未填写');
        }else {
          let res = await axios.post('http://106.14.190.2:8001/push/poi/save', {
              name: this.POIForm.input1,
              cityId: this.cityId,
              lng: this.POIForm.input2,
              lat: this.POIForm.input4
            }, {
              headers: {
                token: this.token
              }
            })
          let POIList = await axios.post('http://106.14.190.2:8001/push/poi/findListBy')
          //menu的结构
          this.menuRight = POIList.data.data.reduce((r, c) => {
            return [
              ...r,
              ...(c.cityId === this.cityId?[c]:[])
            ]
          }, [])
          //做插标的数据结构
          this.poiList = POIList.data.data.reduce((r, c) => {
            return [
              ...r,
              {
                id: c.id,
                name: c.name,
                cityId: c.cityId,
                position: [c.lng, c.lat],
                poiType: c.poiType
              }
            ]
          }, [])
          this.modalAddPOI = false
          this.POIForm.input1 = ''
          this.POIForm.input2 = ''
          this.POIForm.input4 = ''
        }
      },
      modalAddPOI_cancel() {
        // this.$Message.info('Clicked cancel');
        this.poiList = this.poiList.reduce((r, c) => {
          if(c.type && c.type === 'test') {

          }else {
            r.push(c)
          }
          return r
        }, [])
        this.POIForm.input1 = ''
        this.POIForm.input2 = ''
        this.POIForm.input4 = ''
        this.modalAddPOI = false
      },
      ok () {
        this.$Message.info('Clicked ok');

      },
      cancel () {
        this.$Message.info('Clicked cancel');
      },
      addPOI () {
        this.modalAddPOI = true
      },
      showPoiList () {
        console.log(1)
        this.modalAddPOIList = true
        console.log('hahaha',this.menuRight)
      },
      showText() {
        this.textVisible = !this.textVisible
        // console.log(this.textVisible)
        this.insertFeature(this.textVisible)
        // var params = source.getParams()
        // console.log(source)
        // console.log(params)
      }
    }
  }
</script>

<style >
.vl-map { height:100vh !important ;}
/*隐藏ol的一些自带元素*/
/* .ol-attribution,*/
.ol-zoom {
  top: 88vh !important ;
  left: 95vw !important ;
} 
.ol-control button{
  width: 2.1em !important ;
  height: 2.1em !important ;
}

.select{
  width: 180px;
  float: left;
  margin-left: 20px;
  z-index: 100;
  position: absolute;
}
.btn1{
  /* width: 180px; */
  /* float: right; */
  margin-left: 20px;
  z-index: 100;
  position: absolute;
  right: 60px;
}

.btn2{
  /* width: 180px; */
  /* float: right; */
  margin-left: 20px;
  z-index: 100;
  position: absolute;
  right: 160px;
}

.btn3{
  /* width: 180px; */
  /* float: right; */
  margin-left: 20px;
  z-index: 100;
  position: absolute;
  right: 260px;
}
#special .ivu-modal {
  width: 280px !important; 
  position: absolute !important; 
  right: 5% !important;
}
</style>