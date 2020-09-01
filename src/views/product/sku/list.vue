<template>
  <div>
    SkuList
    <h2>我你赵丽颖</h2>
    <parent></parent>
    <child></child>
  </div>
</template>

<script>
import parent from '@/views/product/sku/parent'
import child from '@/views/product/sku/child'
export default {
  name: 'Sku',
  components:{
    child,
    parent
  }
}
</script>

<style lang="scss" scoped>
  /deep/h2{
    color: hotpink;
  }
</style>


