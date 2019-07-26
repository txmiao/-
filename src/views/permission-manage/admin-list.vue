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
                新增管理员
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

            <el-table-column label="用户名" min-width="45px">
                <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="邮箱" width="280px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.email }}</span>
                </template>
            </el-table-column>
            <el-table-column label="角色" width="280px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.roles_name }}</span>
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
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
                     style="width: 400px; margin-left:50px;">
                <el-form-item label="用户名" prop="name">
                    <el-input v-model="temp.name" placeholder="请填写用户名"/>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="temp.email" placeholder="请填写邮箱"/>
                </el-form-item>
                <el-form-item label="密码" :prop="temp.mima">
                    <el-input v-model="temp.password" :placeholder="temp.hint"/>
                </el-form-item>

                <el-form-item label="登录方式" prop="login_method">
                    <el-radio-group v-model="temp.login_method" >
                        <el-radio :label="100">密码</el-radio>
                        <el-radio :label="101">验证码</el-radio>
                        <el-radio :label="102" >密码+验证码</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="选择角色">
                    <el-checkbox-group v-model="checked" @change="test">
                        <el-checkbox v-for="item in checkList" :key="item.id" :label="item.id">{{item.display_name}}
                        </el-checkbox>
                    </el-checkbox-group>
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
    deleteAdmin,
    checkedRole,
    updateAdmin,
    createAdmim,
    getRolelist,
    adminList,
    permissionList,
    createPermission,
    updatePermission,
    deletePermission
  } from '@/api/permission-manage'
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
        checkList: [],
        checked: [],
        listQuery: {
          page: 1,
          limit: 10,
          // importance: undefined,
          _kw: undefined,
          // type: undefined,
          _t: 'name'
        },
        importanceOptions: [1, 2, 3],

        sortOptions: [{ label: '用户名', key: 'name' }, { label: '邮箱', key: 'email' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          name: '',
          hint: '请输入密码'

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
          name: [{ required: true, message: '用户名必填', trigger: 'blur' }],
          password: [{ required: true, message: '密码必填', trigger: 'blur' }],
          email: [{ required: true, message: '邮箱必填', trigger: 'blur' }]
          // description: [{ required: true, message: '权限描述必填', trigger: 'blur' }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
      this.roleList()
    },
    methods: {
      test() {
        console.log(this.checked)
        this.temp.role_id = this.checked
      },
      async roleList() {
        const res = await getRolelist()
        this.checkList = res.data
      },
      getList() {
        this.listLoading = true
        adminList(this.listQuery).then(response => {
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

        this.$confirm('确定删除此管理员吗?', '删除提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteAdmin(row.id)
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
        this.checked = [],
          this.temp = {
            name: '',
            hint: '请输入密码',
            mima: 'password',
            login_method:100
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
        this.$delete(this.temp,'mima')
        this.$delete(this.temp,'hint')
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createAdmim(this.temp).then(response => {
              this.temp.id = response.data.id
              this.temp.roles_name = response.data.roles_name
              this.$delete(this.temp,'password')
              this.temp.hint = '不填写为不修改密码'
              var str = response.data.created_at.date
              var s1 = str.substring(0, str.length - 7)
              this.temp.created_at = s1
              this.list.unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '权限',
                message: '增加权限成功',
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
        this.temp.hint = '不填写为不修改密码'
        // this.temp.timestamp = new Date(this.temp.timestamp)
        checkedRole(scope.row.id).then(response => {
          this.checked = response.data
          this.temp.role_id = this.checked
        })

        console.log(JSON.stringify(this.temp))
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.hint = '不填写为不修改密码'
            const tempData = Object.assign({}, this.temp)
            this.$delete(tempData, 'created_at')
            this.$delete(tempData, 'hint')
            this.$delete(tempData, 'roles_name')
            updateAdmin(tempData).then(() => {
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
