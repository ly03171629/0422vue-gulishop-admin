<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>

    <el-card style="margin-top:20px">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddSpuForm"
        >添加SPU</el-button>

        <el-table border style="width: 100%" :data="spuList">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称"></el-table-column>
          <el-table-column prop="description" label="SPU描述"></el-table-column>

          <el-table-column prop="prop" label="操作">
            <template slot-scope="{row,$index}">
              <HintButton
                icon="el-icon-plus"
                type="primary"
                size="mini"
                title="添加SKU"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                icon="el-icon-edit"
                type="warning"
                size="mini"
                title="修改SPU"
                @click="showUpdateSpuForm(row)"
              ></HintButton>
              <HintButton icon="el-icon-info" type="info" size="mini" title="查看spu的所有sku" @click="showDialog(row)"></HintButton>
              <HintButton icon="el-icon-delete" type="danger" size="mini" title="删除spu" @click="deleteSpu(row)"></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align:center"
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout=" prev, pager, next, jumper,->, sizes,total"
          :total="total"
        ></el-pagination>
      </div>

      <SpuForm
        v-show="isShowSpuForm"
        :visible.sync="isShowSpuForm"
        ref="spu"
        @saveSuccess="saveSuccess"
        @cancelBack="cancelBack"
      ></SpuForm>
      <!-- <SpuForm v-show="isShowSpuForm" :visible="isShowSpuForm" @update:visible="isShowSpuForm = $event"></SpuForm> -->

      <SkuForm v-show="isShowSkuForm" :visible.sync="isShowSkuForm" ref="sku"></SkuForm>
    </el-card>

    <el-dialog title="收货地址" :visible.sync="isShowDialog" :before-close="handleBeforeClose">
      <el-table v-loading="loading" :data="skuList">
        <el-table-column prop="skuName"  label="名称"></el-table-column>
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="weight" label="重量"></el-table-column>
        <el-table-column prop="skuDefaultImg" label="默认图片">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" alt="" style="width:100px;height:80px">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SkuForm from "@/views/product/components/SkuForm";
import SpuForm from "@/views/product/components/SpuForm";
export default {
  name: "Spu",
  components: {
    SkuForm,
    SpuForm,
  },
  data() {
    return {
      isShowDialog:false,
      loading:true,
      skuList:[],

      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 3,
      total: 0,
      //只是为了传递给三级分类来控制三级分类的可操作性
      isShowList: true,

      //这两个数据是正儿八经的控制三个页面的切换
      isShowSkuForm: false,
      isShowSpuForm: false,
    };
  },
  methods: {

    async deleteSpu(row){
      const result = await this.$API.spu.remove(row.id)
      if(result.code === 200){
        this.$message.success('删除spu成功')
        this.getSpuList(this.spuList.length > 1? this.page : this.page - 1)
      }else{
        this.$message.error('删除spu失败')
      }
    },

    //关闭dialog之前的回调
    handleBeforeClose(){
      this.loading = true
      this.skuList = []
      this.isShowDialog = false
    },
    async showDialog(row){
      //显示dialog
      this.isShowDialog = true
      //发请求拿当前spu下的所有sku
      const result = await this.$API.sku.getListBySpuId (row.id)

      this.skuList = result.data

      this.loading = false  //请求数据拿到之后切记把loading去掉
    },

    changeCategory({ categoryId, level }) {
      console.log(categoryId, level);
      if (level === 1) {
        this.category1Id = categoryId;

        //重修选择1级分类的时候需要将23级的id和attrList清空
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        //重修选择1级分类的时候需要将23级的id和attrList清空
        this.category3Id = "";
        this.spuList = [];
      } else {
        this.category3Id = categoryId;
        //发请求拿数据
        this.getSpuList();
      }
    },
    async getSpuList(pagee = 1) {
      //发请求拿属性的列表数据
      this.page = pagee;
      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },

    //点击添加和修改spu及点击添加sku 各个页面之间的切换
    showAddSpuForm() {
      this.isShowSpuForm = true;
      this.$refs.spu.initAddSpuData(this.category3Id); //最后切记把category3Id传递过去使用
    },
    showUpdateSpuForm(row) {
      this.spuId = row.id; //最后为了判断是添加成功回来还是修改成功回来所添加的判断依据
      this.isShowSpuForm = true;
      //通知子组件发送请求获取初始化展示的数据
      this.$refs.spu.initUpdateSpuData(row);
    },
    showAddSkuForm(row) {
      this.isShowSkuForm = true;
      this.$refs.sku.initAddSkuData(row,this.category1Id,this.category2Id)
    },
    //是spu保存成功后返回的操作
    saveSuccess() {
      //怎么返回的
      if (this.spuId) {
        //修改回来的 重新获取当前页面的列表数据
        this.getSpuList(this.page);
      } else {
        //添加回来的 重新获取第一页的列表数据
        this.getSpuList();
      }
      this.spuId = null; //添加成功或者修改成功保存ok后把判断标识置为null，后期如果重新点击从新开始
    },

    cancelBack() {
      this.isShowSpuForm = false; //没有使用.sync一样可以关闭添加和更新spu的页面
      this.spuId = null;
    },
  },
};
</script>

