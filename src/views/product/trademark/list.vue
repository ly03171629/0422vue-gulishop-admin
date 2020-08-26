<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>

    <el-table :data="trademarkList" border style="width: 100%;margin:20px 0">
      <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称"></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO">
        <template slot-scope="{row,$index}">
          <!-- 当你要展示的数据结构由你说了算 -->
          <img :src="row.logoUrl" alt style="width:100px;height:60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row,$index}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align:center"
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout=" prev, pager, next, jumper,->, sizes,total"
      :total="total"
    ></el-pagination>

    <el-dialog :title="`${form.id?'修改':'添加'}品牌`" :visible.sync="isShowDialog">
      <el-form :model="form" style="width:80%">
        <el-form-item label="品牌名称" :label-width="'100px'">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      //列表页的数据
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: [],

      isShowDialog: false,
      form: {
        tmName: "",
        logoUrl: "",
      },
    };
  },
  mounted() {
    // this.$API.trademark.getPageList(1, 3);
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },
    //点击添加按钮，弹出对话框
    showAddDialog() {
      this.isShowDialog = true;
      // 为了解决添加后取消，再点击添加数据仍然存在的bug
      this.form = {
        tmName: "",
        logoUrl: "",
      };
    },

    //点击修改按钮，弹出对话框（和添加）
    showUpdateDialog(row) {
      this.isShowDialog = true;
      // this.form = row
      //form和row(trademarkList当中的对象) 是同一个对象（地址一样） 修改form就相当于修改row
      this.form = { ...row }; //浅拷贝一个新的对象  必须和row不是同一个
    },

    //上传成功后的处理
    handleAvatarSuccess(res, file) {
      // console.log(res,file) // res是上传成功后图片所在服务器上的路径，真是的线上路径，我们要的是它
      // console.log(URL.createObjectURL(file.raw)) //本地图片的路径，我们要的不是它
      this.form.logoUrl = res.data; //真正的收集上传成功的图片路径
    },

    //上传之前的处理
    //其实就是让你在上传之前对文件进行一下子限制
    beforeAvatarUpload(file) {
      const fileTypes = ["image/jpeg", "image/png"];
      const isJPGOrPNG = fileTypes.indexOf(file.type) !== -1;
      const isLt500K = file.size / 1024 < 500;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 JPG 格式或者 PNG格式!");
      }
      if (!isLt500K) {
        this.$message.error("上传头像图片大小不能超过 500KB!");
      }
      return isJPGOrPNG && isLt500K; //只有都为true才符合我们的限制需求
    },

    async save() {
      //1、获取请求所需的参数
      let trademark = this.form;
      //2、发请求
      try {
        const result = await this.$API.trademark.addOrUpdate(trademark);
        if (result.code === 200) {
          //3、成功干啥
          //3-1  关闭dialog
          this.isShowDialog = false;
          //3-2  重新发请求拿列表数据
          this.getTrademarkList(trademark.id ? this.page : 1);
          //添加的时候默认添加再最后一个，重新发请求我们拿的是第一页
          //修改的时候默认修改完成还是停留在当前这一页的列表

          //3-3  提示一下
          this.$message.success(`${trademark.id ? "修改" : "添加"}品牌成功`);
        } else {
          //4、失败干啥（提示）
          this.$message.error(`${trademark.id ? "修改" : "添加"}品牌失败`);
        }
      } catch (error) {
        //发送ajax请求失败
        this.$message.error(error.message);
      }
    },

    deleteTrademark(row) {
      this.$confirm(`你确定删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          //点击确定按钮
          //发请求
          try {
            const result = await this.$API.trademark.delete(row.id);
            //成功
            if (result.code === 200) {
              //提示
              this.$message.success("删除品牌成功");
              //重新获取列表数据
              this.getTrademarkList(
                this.trademarkList.length > 1 ? this.page : this.page - 1
              );
            } else {
              //失败
              this.$message.error("删除品牌失败");
            }
          } catch (error) {
            this.$message.error("发送请求失败");
          }
        })
        .catch(() => {
          //点击取消按钮
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
