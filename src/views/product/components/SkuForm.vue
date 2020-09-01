<template>
  <div>
    <el-form label-width="100px" :model="skuInfo">
      <el-form-item label="SPU名称">{{spu.spuName}}</el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input placeholder="价格" type="number" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <el-form-item label="重量(KG)">
        <el-input placeholder="重量" type="number" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input placeholder="规格描述" type="textarea" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="attrInfo.attrName"
            v-for="(attrInfo, index) in attrInfoList"
            :key="attrInfo.id"
          >
            <el-select placeholder="请输入" v-model="attrId">
              <el-option
                :label="attrValue.valueName"
                :value="attrValue.id"
                v-for="(attrValue, index) in attrInfo.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="spuSaleAttr.saleAttrName"
            v-for="(spuSaleAttr, index) in spuSaleAttrList"
            :key="spuSaleAttr.id"
          >
            <el-select placeholder="请输入" v-model="saleAttrValueId">
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue, index) in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table border style="width: 100%" :data="spuImageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="图片" width="width">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" alt style="width:80px;height:100px" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" width="width"></el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-button v-if="row.isDefault === '0'" type="primary" size="mini" @click="setDefault(row)">设为默认</el-button>
              <el-tag type="success" v-else>默认</el-tag>
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
  name: "SkuForm",
  data() {
    return {
      spu: {},
      attrInfoList: [],
      spuSaleAttrList: [],
      spuImageList: [],
      attrId: "",
      saleAttrValueId: "",

      imgList:[], //选中的图片列表

      skuInfo: {
        //第一大类：父组件传过来的
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        //第二大类： v-model直接收集的
        price: 0,
        skuDesc: "",
        skuName: "",
        weight: "",
        //第三大类： 我们需要自己整理的
        skuDefaultImg: "",
        skuAttrValueList: [
          {
            attrId: 0,
            id: 0,
            skuId: 0,
            valueId: 0,
          },
        ],
        skuImageList: [
          {
            id: 0,
            imgName: "string",
            imgUrl: "string",
            isDefault: "string",
            skuId: 0,
            spuImgId: 0,
          },
        ],
        skuSaleAttrValueList: [
          {
            id: 0,
            saleAttrValueId: 0,
            skuId: 0,
            spuId: 0,
          },
        ],
      },
    };
  },

  methods: {

    //设置默认图片
    setDefault(row){
      this.spuImageList.forEach(item => item.isDefault = '0')
      row.isDefault = '1'
      this.skuInfo.skuDefaultImg = row.imgUrl  //收集默认图片数据
    },

    //收集图片列表
    handleSelectionChange(val){
      this.imgList = val
    },

    async initAddSkuData(spu, category1Id, category2Id) {
      this.spu = spu;

      //这里是在获取父组件传递过来的参数整理到skuInfo当中后续用来发请求，也可以放在最后保存的时候去整理
      this.skuInfo.category3Id = spu.category3Id
      this.skuInfo.tmId = spu.tmId
      this.skuInfo.spuId = spu.id

      //http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      //http://localhost:9529/dev-api/admin/product/spuSaleAttrList/1100
      const promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      //http://localhost:9529/dev-api/admin/product/spuImageList/1100
      const promise3 = this.$API.sku.getSpuImageList(spu.id);

      // Promise.all返回值也是一个promise
      // 对多个promise一起处理，如果所有的promise都成功返回的promise才成功，如果有失败的那么返回的就是失败的promise
      // 参数必须是一个数组  数组当中全都是promise
      // Promise.all返回的promise是成功的，成功的结果是所有数组当中promise的成功结果组成的数组
      // Promise.all返回的promise是失败的，失败的结果是第一个失败的promise的结果（原因）

      const result = await Promise.all([promise1, promise2, promise3]);
      this.attrInfoList = result[0].data;
      this.spuSaleAttrList = result[1].data;
      let spuImageList = result[2].data;
      // 需要把图片添加默认值的属性
      spuImageList.forEach(item => {
        item.isDefault = '0'
      })
      this.spuImageList = spuImageList
    },
  },
};
</script>

<style scoped>
</style>
