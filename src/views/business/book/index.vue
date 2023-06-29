<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户" prop="customerName">
        <el-input
            v-model="queryParams.customerName"
            placeholder="请输入客户姓名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="沟通内容" prop="connectContent">
        <el-input
            v-model="queryParams.connectContent"
            placeholder="请输入沟通内容"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="到期时间" style="width: 308px;">
        <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="bookList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="客户名称" align="center" prop="customerName"/>
      <el-table-column label="联系电话" align="center" prop="pass"/>
      <el-table-column label="证书类型" align="center" prop="certificateType"/>
      <el-table-column label="证书专业" align="center" prop="certificateSpeciality"/>
      <el-table-column label="初始/转注" align="center" prop="remark"/>
      <el-table-column label="省份-城市" align="center" prop="addr"/>
      <el-table-column label="客户来源" align="center" prop="sources"/>
<!--      <el-table-column label="备注" align="center" prop="notes"/>-->
      <el-table-column label="备注" align="notes">
        <template #default="scope">
          <div style="color: #409eff">备注：{{scope.row.notes}}</div>
          <div v-if="scope.row.connectContent" style="color: red">{{scope.row.connectContent}}</div>
        </template>
      </el-table-column>
      <el-table-column label="领取人" align="center" prop="userName"/>
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="到期时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <el-date-picker clearable
                          @change="getEndTime($event,scope.row.bookId)"
                          style="width: 150px;"
                          prefix-icon="CircleClose1"
                          v-model="scope.row.endTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择到期时间">
          </el-date-picker>
        </template>
      </el-table-column>
      <el-table-column label="是否沟通" align="center" width="180">
        <template #default="scope">
          <el-tag v-if="scope.row.connectCount > 0">已沟通</el-tag>
          <el-tag v-else class="ml-2" type="danger">未沟通</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="沟通记录" align="center" width="180">
        <template #default="scope">
          <span style="color: blue;font-weight: 900;cursor: pointer;text-decoration:underline;"
                @click="openDrawer(scope.row)">沟通记录</span>
          <span v-if="scope.row.connectCount > 0">:{{scope.row.connectCount}}次</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:book:remove']">删除</el-button>
          <el-button link type="primary" @click="recovery(scope.row)">回收</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改客户通讯录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="bookRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="customerPhone">
          <el-input v-model="form.customerPhone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="证书类型" prop="certificateType">
          <el-input v-model="form.certificateType" placeholder="请输入证书类型"/>
        </el-form-item>
        <el-form-item label="证书专业" prop="certificateSpeciality">
          <el-input v-model="form.certificateSpeciality" placeholder="请输入证书专业"/>
        </el-form-item>
        <el-form-item label="初始/转注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入初始/转注"/>
        </el-form-item>
        <el-form-item label="省份-城市" prop="addr">
          <el-input v-model="form.addr" placeholder="请输入省份-城市"/>
        </el-form-item>
        <el-form-item label="客户来源" prop="sources">
          <el-input v-model="form.sources" placeholder="请输入客户来源"/>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="form.notes" placeholder="请输入备注"/>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 沟通记录对话框   -->
    <el-drawer v-model="drawerOpen" direction="rtl" size="60%" :destroy-on-close="true" @close="drawerClose">
      <template #header>
        <h4>客户沟通记录</h4>
      </template>
      <template #default>
        <customerConnect :user="userObj" :list="customerConnectList"
                         :customerConnectTotal="customerConnectTotal"></customerConnect>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="Book">
import {listBook, getBook, delBook, addBook, updateBook,recoverys} from "@/api/business/book";

import customerConnect from '../customerConnect/index.vue'
import {listCustomerConnect} from "@/api/business/customerConnect";

const {proxy} = getCurrentInstance();

const bookList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const customerConnectTotal = ref(0);
const title = ref("");
const drawerOpen = ref(false)
const userObj = ref({})
const customerConnectList = ref([]);
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: null,
    userId: null,
    isRecovery: null,
    endTime: null,
    connectContent:null
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询客户通讯录列表 */
function getList() {
  loading.value = true;
  listBook(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    bookList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function drawerClose(){
  getList()
}

function openDrawer(row) {
  userObj.value = row
  customerConnectList.value = [];
  getCustomerConnectList(row.customerId);
}

function getCustomerConnectList(customerId) {
  listCustomerConnect({customerId: customerId}).then(response => {
    customerConnectList.value = response.rows;
    customerConnectTotal.value = response.total;
    drawerOpen.value = true
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    bookId: null,
    customerId: null,
    userId: null,
    createTime: null,
    isRecovery: null,
    endTime: null
  };
  proxy.resetForm("bookRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.bookId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户通讯录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _bookId = row.bookId || ids.value
  getBook(_bookId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户通讯录";
  });
}

function getEndTime(e, bookId) {
  var obj = {
    endTime: e,
    bookId: bookId
  }
  updateBook(obj).then(response => {
    proxy.$modal.msgSuccess("更新成功");
    getList();
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bookRef"].validate(valid => {
    if (valid) {
      if (form.value.bookId != null) {
        updateBook(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBook(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _bookIds = row.bookId || ids.value;
  proxy.$modal.confirm('是否确认删除客户通讯录编号为"' + _bookIds + '"的数据项？').then(function () {
    return delBook(_bookIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

// 回收
function recovery(row){
  recoverys(row).then(response => {
    proxy.$modal.msgSuccess("回收成功");
    getList();
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/book/export', {
    ...queryParams.value
  }, `book_${new Date().getTime()}.xlsx`)
}

getList();
</script>
