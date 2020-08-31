<template>
  <div>
    <el-form ref="form" label-width="100px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option :label="trademark.tmName" :value="trademark.id" v-for="(trademark, index) in trademarkList" :key="trademark.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input placeholder="SPU描述" type="textarea" rows="4" v-model="spuInfo.description"></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select placeholder="还有三个未选择" value>
          <el-option value></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>
        <el-table border style="width: 100%;margin-top:20px">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="prop" label="属性名" width="150"></el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width"></el-table-column>
          <el-table-column label="操作" width="150"></el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button @click="$emit('update:visible',false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  props:['visible'],
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spu:'',
      spuInfo:{
        spuName:'',
        tmId:'',
        description:'',

      },
      spuImageList:[],
      trademarkList:[],
      baseSaleAttrList:[]

    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //点击父组件当中的修改按钮，父组件需要调用这个函数让子组件发请求获取初始化展示的数据
    initUpdateSpuData(spu){
      this.spu = spu  //保存从父组件修改传过来的某个spu 为了后面我们可以使用它内部的数据

      //http://localhost:9529/dev-api/admin/product/getSpuById/1122  获取对应id的spu详情
      this.getSpuInfo(spu.id)
      //http://localhost:9529/dev-api/admin/product/spuImageList/1122 获取对应id的spu的图片列表
      this.getSpuImageList(spu.id)
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表
      this.getTrademarkList()  
      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList  获取所有的基础销售属性列表
      this.getBaseSaleAttrList()
    },
    //点击添加spu按钮，通知子组件发请求获取初始化展示数据
    initAddSpuData(){
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表
      this.getTrademarkList()  
      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList  获取所有的基础销售属性列表
      this.getBaseSaleAttrList()
    },

    async getSpuInfo(spuId){
      const result = await this.$API.spu.get(spuId)
      this.spuInfo = result.data
    },
    async getSpuImageList(spuId){
      const result = await this.$API.sku.getSpuImageList (spuId)
      //图片获取到的结构和最终upload要展示的结构不同，我们需要变为upload需要的结构
      let spuImageList = result.data
      spuImageList.forEach(item => {
        item.name = item.imgName
        item.url = item.imgUrl
      })
      this.spuImageList = spuImageList
    },
    async getTrademarkList(){
      const result = await this.$API.trademark.getList()
      this.trademarkList = result.data
    },
    async getBaseSaleAttrList(){
      const result = await this.$API.spu.getSaleList ()
      this.baseSaleAttrList = result.data
    } 
  },
};
</script>

<style scoped>
</style>
