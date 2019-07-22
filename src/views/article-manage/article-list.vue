<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input v-model="listQuery._kw" placeholder="请输入搜索内容" style="width: 200px;" class="filter-item"
                      @keyup.enter.native="handleFilter"/>
            <el-select v-model="listQuery._t" style="width: 140px" class="filter-item" @change="handleFilter">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
            </el-select>
            <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
                搜索
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                       @click="handleCreate">
                新增文章
            </el-button>
        </div>

        <el-table
                :key="tableKey"
                v-loading="listLoading"
                :data="list"
                border
                fit
                highlight-current-row
                style="width: 100%;"
                @sort-change="sortChange"
        >
            <el-table-column label="ID" prop="id" align="center" width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>

            <el-table-column label="标题" min-width="45px">
                <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                </template>
            </el-table-column>
            <el-table-column label="分类" width="280px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.category_name }}</span>
                </template>
            </el-table-column>


            <el-table-column label="增加时间" width="160px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.created_at}}</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click="handleUpdate(scope)">
                        编辑
                    </el-button>
                    <el-button size="mini" type="danger" @click="handleModifyStatus(scope)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                    @pagination="getList"/>

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px"
                     style="width: 400px; margin-left:50px;">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="temp.title" placeholder="请填写标题"/>
                </el-form-item>

                <el-form-item label="文章分类" prop="category_id">
                    <el-select v-model="temp.category_id" class="filter-item" placeholder="请选择文章分类">
                        <el-option v-for="item in categorylist" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>
                </el-form-item>


                <el-form-item label="是否展示" prop="is_show">
                    <el-radio-group v-model="temp.is_show">
                        <el-radio :label="101">不展示</el-radio>
                        <el-radio :label="100">展示</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="是否置顶" prop="is_top">
                    <el-radio-group v-model="temp.is_top">
                        <el-radio :label="101">不置顶</el-radio>
                        <el-radio :label="100">置顶</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!--action="https://jsonplaceholder.typicode.com/posts/"-->
                <!--action="http://yuanhangcw.me/manage/article"-->
                <el-form-item label="缩略图">
                    <el-upload
                            class="avatar-uploader" name="image"
                            action="http://yuanhangcw.me/manage/article/store_image"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>

                <el-form-item label="内容" prop="is_top">
                    <div>
                        <tinymce v-model="temp.content" :height="300" style="width: 580px;"/>
                    </div>
                </el-form-item>


            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">
                    取消
                </el-button>
                <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
                    确定
                </el-button>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
            <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
                <el-table-column prop="key" label="Channel"/>
                <el-table-column prop="pv" label="Pv"/>
            </el-table>
            <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
  import {
    getCategoryList,
    articleList,
    createArticle,
    updatePermission,
    deleteArticle
  } from '@/api/article-manage'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import waves from '@/directive/waves' // waves directive
  import Tinymce from '@/components/Tinymce'

  export default {
    name: 'ComplexTable',
    components: { Pagination, Tinymce },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'info',
          deleted: 'danger'
        }
        return statusMap[status]
      },
      typeFilter(type) {
        return calendarTypeKeyValue[type]
      }
    },
    data() {
      return {
        imageUrl: '',
        tableKey: 0,
        list: null,
        categorylist: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          _kw: undefined,
          _t: 'name'
        },
        importanceOptions: [1, 2, 3],

        sortOptions: [{ label: '标题', key: 'name' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          is_show: 101,
          is_top: 101,
          category_id: '',
          images: '',
          content: ''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        dialogPvVisible: false,
        pvData: [],
        rules: {
          title: [{ required: true, message: '标题必填', trigger: 'blur' }],
          category_id: [{ required: true, message: '分类必填', trigger: 'blur' }]

        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
      this.categoryList()
    },
    methods: {
      handleAvatarSuccess(res, file) {
        this.imageUrl = URL.createObjectURL(file.raw)
        this.temp.images = res.data
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg'
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        return isJPG && isLt2M
      },

      categoryList() {
        getCategoryList().then(response => {
          this.categorylist = response.data
        })
      },
      getList() {
        this.listLoading = true
        articleList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleModifyStatus({ $index, row }) {

        this.$confirm('确定删除此文章吗?', '删除提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteArticle(row.id)
            this.list.splice($index, 1)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
          .catch(err => {
            console.error(err)
          })
      },
      sortChange(data) {
        const { prop, order } = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      },
      resetTemp() {
        this.imageUrl = ''
        this.temp = {
          is_show: 101,
          is_top: 101,
          content: ''

        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createArticle(this.temp).then(response => {
              this.temp.id = response.data.id
              var str = response.data.created_at.date
              var s1 = str.substring(0, str.length - 7)
              this.temp.created_at = s1
              this.temp.category_name = response.data.cat_name
              this.list.unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '文章',
                message: '增加文章成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(scope) {

        this.temp = Object.assign({}, scope.row) // copy obj
        console.log(JSON.stringify(this.temp))

        this.imageUrl = this.temp.thumbnail
        // this.temp.timestamp = new Date(this.temp.timestamp)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            this.$delete(tempData, 'created_at')
            updatePermission(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '权限',
                message: '编辑权限成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleDelete(row) {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }
    }
  }
</script>

<style scoped>
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .el-icon-plus {
        border: 1px dashed #d9d9d9;
    }

    .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
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
