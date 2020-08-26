<template>
  <div>
    <el-button type="primary" icon="el-icon-plus">添加</el-button>

    <el-table
      border
      style="width: 100%;margin:20px 0"
    >
      <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
      <el-table-column prop="" label="品牌名称"></el-table-column>
      <el-table-column prop="" label="品牌LOGO"></el-table-column>
      <el-table-column prop="" label="操作"></el-table-column>
    </el-table>

    <el-pagination
      style="text-align:center"
      :current-page="1"
      :page-sizes="[10, 20, 50]"
      :page-size="3"
      layout=" prev, pager, next, jumper,->, sizes,total"
      :total="0">
    </el-pagination>
    <!--  @size-change="handleSizeChange"
      @current-change="handleCurrentChange" -->
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data(){
    return {
      page:1,
      limit:3,
      total:0,
      trademarkList:[]
    }
  },
  mounted() {
    // this.$API.trademark.getPageList(1, 3);
    this.getTrademarkList()
  },
  methods:{
    async getTrademarkList(){
      const result = await this.$API.trademark.getPageList(this.page,this.limit);
      if(result.code === 200){
        this.trademarkList = result.data.records
        this.total = result.data.total
      }
    }
  }
};
</script>

<style scoped>
</style>
