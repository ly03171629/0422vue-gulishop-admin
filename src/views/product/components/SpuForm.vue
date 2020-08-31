<template>
  <div>
    <el-form ref="form" label-width="100px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :label="trademark.tmName"
            :value="trademark.id"
            v-for="(trademark, index) in trademarkList"
            :key="trademark.id"
          ></el-option>
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
          :on-success="handleSuccess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          :placeholder="unUsedBaseSaleAttrList.length > 0?`还有${unUsedBaseSaleAttrList.length}个未选择`:'没有啦！！！'"
          v-model="attrIdattrName"
        >
          <el-option
            :label="unUsedBaseSaleAttr.name"
            :value="`${unUsedBaseSaleAttr.id}:${unUsedBaseSaleAttr.name}`"
            v-for="(unUsedBaseSaleAttr, index) in unUsedBaseSaleAttrList"
            :key="unUsedBaseSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr">添加销售属性</el-button>
        <el-table border style="width: 100%;margin-top:20px" :data="spuInfo.spuSaleAttrList">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150"></el-table-column>
          <el-table-column label="属性值名称列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag
                :key="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue,index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>
              <!-- @close="handleClose(tag)" -->

              <!-- row.isEidt是后面我们编辑模式和查看模式的依据 我们把这个数据放在属性身上而不是属性值身上
              因为每个属性同时只能出现一个input  row.saleAttrValueName代表input到时候收集的属性值名称数据，先暂存在属性身上,后面
              用到了要从这个属性身上去拿的-->
              <el-input
                class="input-new-tag"
                v-if="row.isEidt"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
              ></el-input>
              <!--  @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"-->
              <el-button v-else class="button-new-tag" size="small">+添加属性值</el-button>
              <!--  @click="showInput" -->
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton size="mini" type="danger" icon="el-icon-delete" title="删除销售属性"></HintButton>
            </template>
          </el-table-column>
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
  props: ["visible"],
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spu: "",
      attrIdattrName: "",
      spuInfo: {
        spuName: "",
        tmId: "",
        description: "",
        spuSaleAttrList: [],
      },
      spuImageList: [], //获取到的图片列表
      trademarkList: [],
      baseSaleAttrList: [],
      imgList: [], //收集的图片列表
    };
  },

  // {
  //   "category3Id": 0,
  //   "description": "string",
  //   "spuImageList": [
  //     {
  //       "id": 0,
  //       "imgName": "string",
  //       "imgUrl": "string",
  //       "spuId": 0
  //     }
  //   ],
  //   "spuName": "string",
  //   "spuSaleAttrList": [
  //     {
  //       "baseSaleAttrId": 0,
  //       "id": 0,
  //       "saleAttrName": "string",
  //       "spuId": 0,
  //       "spuSaleAttrValueList": [
  //         {
  //           "baseSaleAttrId": 0,
  //           "id": 0,
  //           "isChecked": "string",
  //           "saleAttrName": "string",
  //           "saleAttrValueName": "string",
  //           "spuId": 0
  //         }
  //       ]
  //     }
  //   ],
  //   "tmId": 0
  // }

  methods: {
    //点击添加spu销售属性
    //本质就是往spuInfo.spuSaleAttrList数组当中明push一个规定格式的对象
    addSaleAttr() {
      //把规定格式的对象给构造好
      // {
      //       "baseSaleAttrId": 0,
      //       "saleAttrName": "string",
      //       "spuId": 0,
      //       "spuSaleAttrValueList": []
      // }
      let [baseSaleAttrId,saleAttrName] = this.attrIdattrName.split(':')
      let spuId = this.spu.id
      let spuSaleAttrValueList = []

      let attr ={
        baseSaleAttrId,
        saleAttrName,
        spuId,
        spuSaleAttrValueList
      }

      this.spuInfo.spuSaleAttrList.push(attr);

      this.attrIdattrName = ''
    },

    //图片被删除的时候调用
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.imgList = fileList; //把删除剩余的图片列表收集起来
    },
    //图片上传成功后调用
    handleSuccess(response, file, fileList) {
      console.log(response, file, fileList);
      this.imgList = fileList; //把添加完成的图片列表收集起来
    },

    handlePictureCardPreview(file) {
      //点击显示大图的操作
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //点击父组件当中的修改按钮，父组件需要调用这个函数让子组件发请求获取初始化展示的数据
    initUpdateSpuData(spu) {
      this.spu = spu; //保存从父组件修改传过来的某个spu 为了后面我们可以使用它内部的数据

      //http://localhost:9529/dev-api/admin/product/getSpuById/1122  获取对应id的spu详情
      this.getSpuInfo(spu.id);
      //http://localhost:9529/dev-api/admin/product/spuImageList/1122 获取对应id的spu的图片列表
      this.getSpuImageList(spu.id);
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表
      this.getTrademarkList();
      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList  获取所有的基础销售属性列表
      this.getBaseSaleAttrList();
    },
    //点击添加spu按钮，通知子组件发请求获取初始化展示数据
    initAddSpuData() {
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表
      this.getTrademarkList();
      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList  获取所有的基础销售属性列表
      this.getBaseSaleAttrList();
    },

    async getSpuInfo(spuId) {
      const result = await this.$API.spu.get(spuId);
      this.spuInfo = result.data;
    },
    async getSpuImageList(spuId) {
      const result = await this.$API.sku.getSpuImageList(spuId);
      //图片获取到的结构和最终upload要展示的结构不同，我们需要变为upload需要的结构
      let spuImageList = result.data;
      spuImageList.forEach((item) => {
        item.name = item.imgName;
        item.url = item.imgUrl;
      });
      this.spuImageList = spuImageList;
    },
    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      this.trademarkList = result.data;
    },
    async getBaseSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.baseSaleAttrList = result.data;
    },
  },
  computed: {
    unUsedBaseSaleAttrList() {
      return this.baseSaleAttrList.filter((baseSaleAttr) =>
        this.spuInfo.spuSaleAttrList.every(
          (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        )
      );
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
