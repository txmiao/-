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
                新增分类
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
        >
            <el-table-column label="ID" prop="id" align="center" width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>

            <el-table-column label="分类名称" min-width="45px">
                <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
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
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="temp.name" placeholder="请填写分类名称"/>
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
    </div>
</template>

<script>
  import {
    deleteArticleCategory,
    updateArticleCategory,
    createArticleCategory,
    articleCategoryList
  } from '@/api/article-manage'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import waves from '@/directive/waves' // waves directive

  export default {
    name: 'ComplexTable',
    components: { Pagination },
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
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          // importance: undefined,
          _kw: undefined,
          // type: undefined,
          _t: 'name'
        },
        importanceOptions: [1, 2, 3],

        sortOptions: [{ label: '分类名称', key: 'name' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          name: ''
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
          name: [{ required: true, message: '分类名称必填', trigger: 'blur' }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        articleCategoryList(this.listQuery).then(response => {
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

        this.$confirm('确定删除此文章分类吗?', '删除提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteArticleCategory(row.id)
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

      resetTemp() {
        this.temp = {
          name: ''
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
            createArticleCategory(this.temp).then(response => {
              this.temp.id = response.data.id
              var str = response.data.created_at.date
              var s1 = str.substring(0, str.length - 7)
              this.temp.created_at = s1
              this.list.unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '文章分类',
                message: '增加分类成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(scope) {

        this.temp = Object.assign({}, scope.row) // copy obj
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
            updateArticleCategory(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '文章分类',
                message: '编辑分类成功',
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
