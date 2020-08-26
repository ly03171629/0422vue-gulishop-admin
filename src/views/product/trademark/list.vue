<template>
  <div>tradeMarkList</div>
</template>

<script>
export default {
  name: 'Trademark',
  mounted(){
    this.$API.trademark.getPageList(1,3)
  }
}
</script>

<style scoped>

</style>
