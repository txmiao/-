<template>
    <div class="app-container">
        <el-button type="primary" @click="handleAddRole">新增角色</el-button>

        <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
            <el-table-column align="center" label="角色" width="220">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="名称" width="220">
                <template slot-scope="scope">
                    {{ scope.row.display_name }}
                </template>
            </el-table-column>
            <el-table-column align="header-center" label="描述">
                <template slot-scope="scope">
                    {{ scope.row.description }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="handleUpdate(row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改角色':'增加角色'">
            <el-form :model="temp" label-width="80px" label-position="left">
                <el-form-item label="角色">
                    <el-input v-model="temp.name" placeholder="请填写角色"/>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="temp.display_name" placeholder="请填写角色名称"/>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input
                            v-model="temp.description"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            type="textarea"
                            placeholder="请填写角色描述"
                    />
                </el-form-item>
                <el-form-item label="选择权限">
                    <el-checkbox-group v-model="checked" @change="test">
                        <el-checkbox v-for="item in checkList" :key="item.id" :label="item.id">{{item.display_name}}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <div style="text-align:right;">
                <el-button type="danger" @click="dialogVisible=false">取消</el-button>
                <!--<el-button type="primary" @click="confirmRole">确定</el-button>-->
                <el-button type="primary" @click="dialogType==='new'?createData():updateData()">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
  import path from 'path'
  import { deepClone } from '@/utils'
  import { getRoutes, addRole, deleteRole, updateRole } from '@/api/role'

  import { createRole, getRoles, getPermissionlist } from '@/api/permission-manage'

  const defaultRole = {
    key: '',
    name: '',
    description: '',
    routes: []
  }

  export default {
    data() {
      return {
        checked: [],
        temp: {
          name: '',
          perm_id: ''
        },
        checkList: [],
        role: Object.assign({}, defaultRole),
        routes: [],
        rolesList: [],
        dialogVisible: false,
        dialogType: 'new',
        checkStrictly: false,
        defaultProps: {
          children: 'children',
          label: 'title'
        }
      }
    },
    computed: {
      routesData() {
        return this.routes
      }
    },
    created() {
      // Mock: get all routes and roles list from server
      this.getRoutes()
      this.getRoles()
      this.permissionList()
    },
    methods: {
      createData() {
        createRole(this.temp).then(response => {

          this.rolesList.unshift(this.temp)
          this.dialogVisible = false
          this.$notify({
            title: '资源',
            message: '增加资源成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      updateData() {
        createRole(this.checkList).then(response => {

        })
      },
      test() {
        console.log(this.checked)
        this.temp.perm_id = this.checked
      },
      async permissionList() {
        const res = await getPermissionlist()
        this.checkList = res.data
      },
      async getRoutes() {
        const res = await getRoutes()
        console.log(1)
        console.log(res)
        console.log(2)
        this.serviceRoutes = res.data
        this.routes = this.generateRoutes(res.data)
        console.log(JSON.stringify(this.routes))
        console.log(3)
      },
      async getRoles() {
        const res = await getRoles()
        this.rolesList = res.data.data
      },

      // Reshape the routes structure so that it looks the same as the sidebar
      generateRoutes(routes, basePath = '/') {
        const res = []

        for (let route of routes) {
          // skip some route
          if (route.hidden) {
            continue
          }

          const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

          if (route.children && onlyOneShowingChild && !route.alwaysShow) {
            route = onlyOneShowingChild
          }

          const data = {
            path: path.resolve(basePath, route.path),
            title: route.meta && route.meta.title

          }

          // recursive child routes
          if (route.children) {
            data.children = this.generateRoutes(route.children, data.path)
          }
          res.push(data)
        }
        return res
      },
      generateArr(routes) {
        let data = []
        routes.forEach(route => {
          data.push(route)
          if (route.children) {
            const temp = this.generateArr(route.children)
            if (temp.length > 0) {
              data = [...data, ...temp]
            }
          }
        })
        return data
      },
      handleAddRole() {
        this.role = Object.assign({}, defaultRole)
        if (this.$refs.tree) {
          this.$refs.tree.setCheckedNodes([])
        }
        this.dialogType = 'new'
        this.dialogVisible = true
      },
      handleEdit(scope) {
        this.dialogType = 'edit'
        this.dialogVisible = true
        this.checkStrictly = true
        this.role = deepClone(scope.row)
        this.$nextTick(() => {
          const routes = this.generateRoutes(this.role.routes)
          this.$refs.tree.setCheckedNodes(this.generateArr(routes))
          // set checked state of a node not affects its father and child nodes
          this.checkStrictly = false
        })
      },
      handleDelete({ $index, row }) {
        this.$confirm('Confirm to remove the role?', 'Warning', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(async() => {
            await deleteRole(row.key)
            this.rolesList.splice($index, 1)
            this.$message({
              type: 'success',
              message: 'Delete succed!'
            })
          })
          .catch(err => {
            console.error(err)
          })
      },
      generateTree(routes, basePath = '/', checkedKeys) {
        const res = []

        for (const route of routes) {
          const routePath = path.resolve(basePath, route.path)

          // recursive child routes
          if (route.children) {
            route.children = this.generateTree(route.children, routePath, checkedKeys)
          }

          if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
            res.push(route)
          }
        }
        return res
      },
      async confirmRole() {
        const isEdit = this.dialogType === 'edit'

        const checkedKeys = this.$refs.tree.getCheckedKeys()
        this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)

        if (isEdit) {
          await updateRole(this.role.key, this.role)
          for (let index = 0; index < this.rolesList.length; index++) {
            if (this.rolesList[index].key === this.role.key) {
              this.rolesList.splice(index, 1, Object.assign({}, this.role))
              break
            }
          }
        } else {
          const { data } = await addRole(this.role)
          this.role.key = data.key
          this.rolesList.push(this.role)
        }

        const { description, key, name } = this.role
        this.dialogVisible = false
        this.$notify({
          title: 'Success',
          dangerouslyUseHTMLString: true,
          message: `
            <div>Role Key: ${key}</div>
            <div>Role Nmae: ${name}</div>
            <div>Description: ${description}</div>
          `,
          type: 'success'
        })
      },
      // reference: src/view/layout/components/Sidebar/SidebarItem.vue
      onlyOneShowingChild(children = [], parent) {
        let onlyOneChild = null
        const showingChildren = children.filter(item => !item.hidden)

        // When there is only one child route, the child route is displayed by default
        if (showingChildren.length === 1) {
          onlyOneChild = showingChildren[0]
          onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
          return onlyOneChild
        }

        // Show parent if there are no child route to display
        if (showingChildren.length === 0) {
          onlyOneChild = { ...parent, path: '', noShowingChildren: true }
          return onlyOneChild
        }

        return false
      }
    }
  }
</script>

<style lang="scss" scoped>
    .app-container {
        .roles-table {
            margin-top: 30px;
        }
        .permission-tree {
            margin-bottom: 30px;
        }
    }
</style>
