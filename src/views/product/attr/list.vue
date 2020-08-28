<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory"></CategorySelector>
    </el-card>

    <el-card style="margin-top:20px">
      
    </el-card>

  </div>
</template>

<script>
export default {
  name: 'Attr',
  data(){
    return {
      category1Id:'',
      category2Id:'',
      category3Id:'',
    }
  },
  methods:{
    changeCategory({categoryId,level}){
      console.log(categoryId,level)
      if(level === 1){
        this.category1Id = categoryId
      }else if(level === 2){
        this.category2Id = categoryId
      }else{
        this.category3Id = categoryId
        //发请求拿数据
        
      }
    }
  }
}
</script>

