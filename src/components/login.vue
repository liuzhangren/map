<template>
  <div>
    <Modal
        v-model="tokenVisible"
        title="请输入token"
        @on-ok="ok"
        @on-cancel="cancel">
        <a href='http://106.14.190.2/#/login' target="view_window">点击获取token...</a> <br />
        <Input v-model="value" placeholder="token..." style="width: 300px" />
    </Modal>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import config from '../../config'
import { MAP, LOGIN } from '../../config'
export default {
  name: 'Login',
  data() {
    return {
      tokenVisible: true,
      value: '',
    }
  },
  methods: {
    async ok() {
      await Cookies.set('token', this.value)
      this.tokenVisible = false 
      console.log(MAP, LOGIN)
      if(config.MAP === MAP) {
        this.$router.push(MAP)
      }else {
        window.location.href = `${config.isHttps?'https':'http'}://${config.host}:${config.port}${config.MAP}`
      }
    },
    cancel() {
      this.$Message.info('Clicked cancel');
    }
  }
}
</script>


<style>

</style>