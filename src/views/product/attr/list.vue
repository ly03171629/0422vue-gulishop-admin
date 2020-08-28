<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory"></CategorySelector>
    </el-card>

    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddDiv"
        >添加属性</el-button>
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"></el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton icon="el-icon-edit" type="warning" size="mini" title="修改属性"></HintButton>
              <HintButton icon="el-icon-delete" type="danger" size="mini" title="删除属性"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form ref="form" :model="form" :inline="true">
          <el-form-item label="属性名">
            <el-input v-model="form.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table
          border
          style="width: 100%;margin:20px 0">
          <el-table-column
            align="center"
            type="index"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="prop"
            label="属性值名称"
            width="width">
          </el-table-column>
          <el-table-column
            label="操作"
            width="width">
          </el-table-column>
        </el-table>
        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,

      // {
      //   attrName: "string",
      //   attrValueList: [
      //     {
      //       attrId: 0,
      //       id: 0,
      //       valueName: "string",
      //     },
      //   ],
      //   categoryId: 0,
      //   categoryLevel: 0,
      //   id: 0,
      // },

      form: {
        attrName:'',
        attrValueList:[],
        categoryId: '',
        categoryLevel:3
      },
    };
  },
  methods: {
    changeCategory({ categoryId, level }) {
      console.log(categoryId, level);
      if (level === 1) {
        this.category1Id = categoryId;

        //重修选择1级分类的时候需要将23级的id和attrList清空
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        //重修选择1级分类的时候需要将23级的id和attrList清空
        this.category3Id = "";
        this.attrList = [];
      } else {
        this.category3Id = categoryId;
        //发请求拿数据
        this.getAttrList();
      }
    },
    async getAttrList() {
      //发请求拿属性的列表数据
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },

    showAddDiv() {
      this.isShowList = false;
    },
  },
};
</script>

