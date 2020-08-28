<template>
  <el-form :inline="true" :model="form" class="demo-form-inline">
    <el-form-item label="一级分类">
      <el-select v-model="form.category1Id" placeholder="请选择">
        <el-option :label="c1.name" :value="c1.id" v-for="(c1, index) in category1List" :key="c1.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select v-model="form.category2Id" placeholder="请选择">
        <el-option label="区域一" value="shanghai"></el-option>
        <el-option label="区域二" value="beijing"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select v-model="form.category3Id" placeholder="请选择">
        <el-option label="区域一" value="shanghai"></el-option>
        <el-option label="区域二" value="beijing"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "CategorySelector",
  data(){
    return {
      form:{
        category1Id:'',
        category2Id:'',
        category3Id:''
      },
      category1List:[],

    }
  },
  mounted(){
    //获取一级分类列表
    this.getCategory1List()
  },
  methods:{
    async getCategory1List(){
      //发请求拿数据存数据
      const result = await this.$API.category.getCategorys1()
      if(result.code === 200){
        this.category1List = result.data
      }
    }
  }
};
</script>
