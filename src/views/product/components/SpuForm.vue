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
                @close="row.spuSaleAttrValueList.splice(index,1)"
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>

              <!-- row.isEidt是后面我们编辑模式和查看模式的依据 我们把这个数据放在属性身上而不是属性值身上
              因为每个属性同时只能出现一个input  row.saleAttrValueName代表input到时候收集的属性值名称数据，先暂存在属性身上,后面
              用到了要从这个属性身上去拿的-->
              <el-input
                class="input-new-tag"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              ></el-input>

              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+添加属性值</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <el-popconfirm
                title="这是一段内容确定删除吗？"
                @onConfirm="spuInfo.spuSaleAttrList.splice($index,1)"
              >
                <HintButton
                  slot="reference"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除销售属性"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
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
  // },

  methods: {

    cancel(){
      this.$emit('cancelBack')
      this.resetData()
    },  

    resetData(){
      this.dialogImageUrl = ""
      this.dialogVisible = false
      this.spu = ""
      this.attrIdattrName = ""
      this.spuInfo = {
        spuName: "",
        tmId: "",
        description: "",
        spuSaleAttrList: [],
      }
      this.spuImageList = []//获取到的图片列表
      this.trademarkList = []
      this.baseSaleAttrList = []
      this.imgList = [] //收集的图片列表
    },



    async save() {
      //获取参数
      let { spu, imgList, spuInfo } = this;

      //整理参数
      //1、整理图片
      //    {
      //       "imgName": "string",
      //       "imgUrl": "string",
      //       "spuId": 0
      //     }
      imgList = imgList.map(item => {
        return {
          imgName:item.imgName || item.name,
          imgUrl:item.imgUrl || item.response.data,
          spuId:spu.id
        }
      })

      spuInfo.spuImageList = imgList
      

      //2、自己添加的一些参数需要去除
      spuInfo.spuSaleAttrList.forEach(item => {
        delete item.isEdit
        delete item.saleAttrValueName
      })

      //3、category3Id需要加上
      spuInfo.category3Id = spu.category3Id
      console.log(spuInfo)

      //发送请求
      const result = await this.$API.spu.addUpdate(spuInfo)
      if(result.code === 200){
        //成功干啥
        this.$message.success('保存spu成功')
        //返回到列表页
          // 到了列表页之后要干啥
          // 是怎么到的列表页（添加还是修改）
        this.$emit('saveSuccess')

        //关闭添加和修改spu的页面
        this.$emit('update:visible',false)


        
      }else{
        //失败干啥
        this.$message.error('保存spu失败')
      }
      //清空当前的data数据
      this.resetData()
    },

    //失去焦点的时候或者回车的时候我们需要保存这个输入的属性值名称
    //属性值名称我们当时是输入的时候暂存在属性身上（row）
    handleInputConfirm(row) {
      //1\先从row身上把属性值名称等获取到
      let { saleAttrValueName, baseSaleAttrId, saleAttrName } = row;
      let spuId = this.spu.id;
      //2\构造固定格式的对象
      let attrValue = {
        saleAttrValueName,
        baseSaleAttrId,
        saleAttrName,
        spuId,
      };
      // {
      //  "baseSaleAttrId": 0,
      //  "saleAttrName": "string",
      //  "saleAttrValueName": "string",
      //  "spuId": 0
      // }

      //添加之前要判断
      //判断 1 属性值是不是为空
      //判断 2 和其它的属性值不能重复
      if (saleAttrValueName.trim() === "") return;
      let repeat = row.spuSaleAttrValueList.some(
        (item) => attrValue.saleAttrValueName === item.saleAttrValueName
      );
      if (repeat) {
        this.$message.warning("属性值不能重复");
        row.isEdit = false;
        row.saleAttrValueName = "";
        return;
      }

      //3\添加到对应的属性值列表当中
      row.spuSaleAttrValueList.push(attrValue);

      //4\ 再让当前的这个属性的属性值变为查看模式
      row.isEdit = false;

      //5\ 将input清空
      row.saleAttrValueName = "";
    },

    //点击按钮变为input（编辑模式）

    showInput(row) {
      this.$set(row, "isEdit", true);
      //自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

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
      let [baseSaleAttrId, saleAttrName] = this.attrIdattrName.split(":");
      baseSaleAttrId *= 1;
      let spuId = this.spu.id;
      let spuSaleAttrValueList = [];
      let attr = {
        baseSaleAttrId,
        saleAttrName,
        spuId,
        spuSaleAttrValueList,
      };
      this.spuInfo.spuSaleAttrList.push(attr);

      this.attrIdattrName = "";
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
