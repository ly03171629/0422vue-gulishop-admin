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
              <HintButton
                icon="el-icon-edit"
                type="warning"
                size="mini"
                title="修改属性"
                @click="showUpdateDiv(row)"
              ></HintButton>
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

        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!form.attrName"
          @click="addAttrValue"
        >添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table border style="width: 100%;margin:20px 0" :data="form.attrValueList">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="valueName" label="属性值名称" width="width">
            <template slot-scope="{row,$index}">
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值"
                size="mini"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row,$index)"
                style="display:inline-block;height:100%;width:100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="form.attrValueList.splice($index,1)">
                <HintButton slot="reference" icon="el-icon-delete" size="mini" title="删除属性值" type="danger"></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";

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
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3,
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
      //解决添加之后取消，完啦再添加数据依然存在的bug
      this.form = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },

    showUpdateDiv(row) {
      this.isShowList = false;
      //浅拷贝已经解决不了我们的问题
      //浅拷贝拷贝row当中的数组（对象数据）仍然拷贝的是地址 使用深拷贝去解决
      // this.form = {...row}
      this.form = cloneDeep(row);

      //修改属性的时候，每个属性值身上也要添加isEdit标识数据  false
      this.form.attrValueList.forEach((item) => {
        // item.isEdit = false //错的  这样的添加不是响应式数据，因为数据劫持早都完了
        // $set
        this.$set(item, "isEdit", false); //对的  后期添加一个属性想让这个属性是响应式属性，必须使用vm.$set或者Vue.set
      });

      //
    },

    addAttrValue() {
      //点击添加属性值
      this.form.attrValueList.push({
        attrId: this.form.id, //form当中有id就拿form的id  没有就是undefined
        valueName: "",
        isEdit: true, //新添加的属性值身上添加isEdit标识数据 true
      });

      //永远是最后添加的那一个input获取焦点
      this.$nextTick(() => {
        this.$refs[this.form.attrValueList.length - 1].focus();
      });
    },

    // input 失去焦点或者回车后改变模式为查看模式
    toLook(row) {
      //属性值必须有有意义的值
      if (row.valueName.trim() === "") {
        this.$message.warning("属性值必须有值");
        row.valueName = "";
        return;
      }

      //除了自身的属性值之外，不允许其它的属性值和这个值一样
      let repeate = this.form.attrValueList.some((item) => {
        if (item !== row) {
          return item.valueName.trim() === row.valueName.trim();
        }
      });

      if (repeate) {
        this.$message.warning("属性值不能重复");
        row.valueName = "";
        return;
      }

      row.isEdit = false;
    },

    // 点击span后，改变模式为编辑模式
    toEdit(row, index) {
      row.isEdit = true;

      //自动获取焦点  让目前点击的这个span所对应的input获取焦点
      // this.$refs[index]   //拿的就是点击的span对应的下标 标识的ref获取的input
      //什么时候使用nextTick
      //数据变化很快，数据变化导致页面元素更新，元素更新比较慢，数据变化后的代码执行在元素变化之前，导致没效果
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
  },
};
</script>

