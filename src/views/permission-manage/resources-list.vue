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
                新增资源
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

            <el-table-column label="资源名称" width="150px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="资源图标" min-width="50px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.icon }}</span>
                </template>
            </el-table-column>
            <el-table-column label="资源链接" width="180px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.link }}</span>
                </template>
            </el-table-column>

            <el-table-column label="资源权限" width="180px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.permission }}</span>
                </template>
            </el-table-column>

            <el-table-column label="上级资源" width="150px" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.belongs_to_parent !=null">{{ scope.row.belongs_to_parent.name }}</span>
                    <span v-else>顶级资源</span>
                </template>
            </el-table-column>

            <el-table-column label="排序" width="50px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.sort }}</span>
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
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px"
                     style="width: 400px; margin-left:50px;">

                <el-form-item label="父级资源" prop="pid">
                    <el-select v-model="temp.pid" class="filter-item" placeholder="请选择父级资源" @change="inLink">
                        <el-option v-for="item in plist" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>
                </el-form-item>

                <el-form-item label="资源名称" prop="name">
                    <el-input v-model="temp.name" placeholder="请填写资源名称"/>
                </el-form-item>
                <el-form-item label="资源图标" prop="icon">
                    <el-input v-model="temp.icon" placeholder="请填写资源图标"/>
                </el-form-item>
                <el-form-item label="资源排序" prop="sort">
                    <el-input v-model.number="temp.sort" placeholder="请填写资源排序"/>
                </el-form-item>
                <el-form-item label="资源权限" prop="permission">
                    <el-input v-model="temp.permission" placeholder="请填写资源权限"/>
                </el-form-item>
                <el-form-item label="资源链接" prop="link" v-if="showTopresources">
                    <el-input v-model="temp.link" placeholder="请填写资源链接"/>
                </el-form-item>

                <el-form-item label="前端路由" prop="path">
                    <el-input v-model="temp.path" placeholder="请填写前端路由"/>
                </el-form-item>

                <el-form-item label="前端组件" prop="component">
                    <el-input v-model="temp.component" placeholder="请填写前端组件"/>
                </el-form-item>

                <el-form-item label="跳转地址" prop="redirect">
                    <el-input v-model="temp.redirect" placeholder="请填写面包屑重定向地址"/>
                </el-form-item>

                <el-form-item label="前端路由名称" prop="v_name">
                    <el-input v-model="temp.v_name" placeholder="请填写前端路由名称"/>
                </el-form-item>

                <el-form-item label="前端展示名称" prop="title">
                    <el-input v-model="temp.title" placeholder="请填写前端展示名称"/>
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
  import { deleteResources, updateResources, createResources, topresourcesList, resourcesList, } from '@/api/permission-manage'
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
        plist: null,
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
        sortOptions: [{ label: '资源名称', key: 'name' }, { label: '资源链接', key: 'link' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          name: '',
          pid: ''
        },
        dialogFormVisible: false,
        showTopresources: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        dialogPvVisible: false,
        pvData: [],
        rules: {
          name: [{ required: true, message: '资源名称必填', trigger: 'blur' }],
          sort: [{ type: 'number', message: '资源排序须为数字值' }, { required: true, message: '资源排序必填', trigger: 'blur' }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
      this.topmenuList()
    },
    methods: {
      getList() {
        this.listLoading = true
        resourcesList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      topmenuList() {
        topresourcesList().then(response => {
          this.plist = response.data
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      inLink() {
        if (this.temp.pid == 0) {
          this.showTopresources = false
        } else {
          this.showTopresources = true
        }
      },
      handleModifyStatus({ $index, row }) {

        this.$confirm('确定删除此资源吗?', '删除提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteResources(row.id)
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
        this.temp = {
          name: '',
          pid: 0
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
            createResources(this.temp).then(response => {
              this.temp.id = response.data.id
              this.temp.belongs_to_parent = response.data.belongs_to_parent
              var str = response.data.created_at.date
              var s1 = str.substring(0, str.length - 7)
              this.temp.created_at = s1
              this.list.unshift(this.temp)
              this.dialogFormVisible = false
              // this.getList()
              this.$notify({
                title: '资源',
                message: '增加资源成功',
                type: 'success',
                duration: 2000
              })
            }).catch(err => {
              console.log(err)
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
            updateResources(tempData).then(() => {
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
