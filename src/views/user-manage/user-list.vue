<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input v-model="listQuery._kw" placeholder="请输入搜索内容" style="width: 200px;" class="filter-item"
                      @keyup.enter.native="handleFilter"/>
            <el-select v-model="listQuery.type" style="width: 140px" class="filter-item" @change="handleFilter">
                <el-option v-for="item in typeOptions" :key="item.key" :label="item.label" :value="item.key"/>
            </el-select>
            <el-select v-model="listQuery._t" style="width: 140px" class="filter-item" @change="handleFilter">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
            </el-select>
            <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
                搜索
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                       @click="handleCreate">
                新增用户
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

            <el-table-column label="姓名" min-width="80px">
                <template slot-scope="scope">
                    <span>{{ scope.row.real_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="手机" width="250px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.phone }}</span>
                </template>
            </el-table-column>

            <el-table-column label="类型" width="120px" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.type==100">学生</span>
                    <span v-else>在职</span>
                </template>
            </el-table-column>

            <el-table-column label="身份证号码" width="280px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.id_card }}</span>
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
                <el-form-item label="真实姓名" prop="real_name">
                    <el-input v-model="temp.real_name" placeholder="请填写真实姓名"/>
                </el-form-item>

                <el-form-item label="身份证号" prop="id_card">
                    <el-input v-model="temp.id_card" placeholder="请填写身份证号"/>
                </el-form-item>

                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="temp.phone" placeholder="请填写手机号"/>
                </el-form-item>

                <el-form-item label="用户昵称" prop="nickname">
                    <el-input v-model="temp.nickname" placeholder="请填写昵称"/>
                </el-form-item>

                <el-form-item label="用户密码" :prop="temp.mima">
                    <el-input v-model="temp.password" :placeholder="temp.hint"/>
                </el-form-item>

                <el-form-item label="用户类型" prop="type">
                    <el-select v-model="temp.type" class="filter-item" placeholder="请选择用户类型">
                        <el-option v-for="item in typeOptionst" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>
                </el-form-item>

                <el-form-item label="用户头像">
                    <el-upload
                            class="avatar-uploader" name="uploadImage"
                            action="http://yuanhangcw.me/manage/system/upload"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
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
    updateUser,
    deleteUser,
    createUser,
    userList,
    getCategoryList,
    articleList,
    createArticle,
    updateArticle,
    deleteArticle
  } from '@/api/user-manage'
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
      var checkPhone = (rule, value, callback) => {
        const phoneReg = /^1[3|4|5|6|7|8][0-9]{9}$/
        if (!value) {
          return callback(new Error('电话号码不能为空'))
        }
        setTimeout(() => {

          if (!Number.isInteger(+value)) {
            callback(new Error('请输入数字值'))
          } else {
            if (phoneReg.test(value)) {
              callback()
            } else {
              callback(new Error('电话号码格式不正确'))
            }
          }
        }, 100)
      };

      // 身份证号验证
      var checkIDCardNumber = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('身份证不能为空'));
        }
        let aCity={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"}
        let iSum = 0 ;
        let info = "" ;
        if(!/^\d{17}(\d|x)$/i.test(value)) {
          return callback(new Error("你输入的身份证长度或格式错误"));
        }
        value = value.replace(/x$/i,"a");
        if(aCity[parseInt(value.substr(0,2))] == null) {
          return callback(new Error("你的身份证地区非法")) ;
        }
        let sBirthday = value.substr(6,4)+"-" + Number(value.substr(10,2)) + "-" + Number(value.substr(12,2));
        let  d = new Date(sBirthday.replace(/-/g,"/")) ;
        if(sBirthday !== (d.getFullYear()+ "-" + (d.getMonth()+1) + "-" + d.getDate())){
          return callback(new Error("身份证上的出生日期非法"));
        }
        for(var i = 17;i>=0;i --) {
          iSum += (Math.pow(2,i) % 11) * parseInt(value.charAt(17 - i),11) ;
        }
        if(iSum%11 !== 1) {
          return callback(new Error("你输入的身份证号非法"));
        }
        return callback();
      };

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
          _t: 'real_name',
          type: ''
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '姓名', key: 'real_name' }, { label: '用户ID', key: 'id' }, { label: '手机号', key: 'phone' }],
        typeOptions: [{ label: '全部', key: '' }, { label: '学生', key: 100 }, { label: '在职', key: 101 }],
        typeOptionst: [{ id: 100, name: '学生' }, { id: 101, name: '在职' }]
        ,
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        temp: {
          is_show: 101,
          is_top: 101,
          hint: '请输入密码',
          type: '',
          uploadImage: ''
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
          real_name: [{ required: true, message: '真实姓名必填', trigger: 'blur' }],
          // id_card: [{ required: true, message: '身份证号必填', trigger: 'blur' }],

          id_card: [{validator: checkIDCardNumber, trigger: ['blur', 'change']}, {required: true, message: '请输入证件号码', trigger: 'change'}],

          // phone: [{ required: true, message: '手机号码必填', trigger: 'blur' }],
          phone: [{ required: true, validator: checkPhone, trigger: 'blur' }],
          nickname: [{ required: true, message: '用户昵称必填', trigger: 'blur' },,{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }],
          password: [{ required: true, message: '用户密码必填', trigger: 'blur' },{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }],

          type: [{ required: true, message: '用户类型必填', trigger: 'change', type: 'number' }]
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
        this.temp.avatar = res.data.path
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
        userList(this.listQuery).then(response => {
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

        this.$confirm('确定删除此用户吗?', '删除提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteUser(row.id)
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
          real_name: '',
          id_card: '',
          phone: '',
          nickname: '',
          hint: '请输入密码',
          mima: 'password'
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
            createUser(this.temp).then(response => {
              this.temp.id = response.data.id
              this.$delete(this.temp,'password')
              this.temp.hint = '不填写为不修改密码'
              var str = response.data.created_at.date
              var s1 = str.substring(0, str.length - 7)
              this.temp.created_at = s1
              // this.temp.category_name = response.data.cat_name
              this.list.unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '用户',
                message: '增加用户成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(scope) {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true

        this.temp = Object.assign({}, scope.row) // copy obj

        console.log(JSON.stringify(this.temp))
        this.temp.hint = '不填写为不修改密码'
        var urlq = 'http://yuanhangcw.me/storage/'
        this.imageUrl = urlq + this.temp.avatar

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
            this.$delete(tempData, 'category_name')
            this.$delete(tempData, 'hint')
            this.$delete(tempData, 'deleted_at')
            this.$delete(tempData, 'last_actived_at')
            this.$delete(tempData, 'last_actived_ip')
            this.$delete(tempData, 'is_auth')
            updateUser(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '用户',
                message: '编辑用户成功',
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
