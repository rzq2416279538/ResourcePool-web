<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业名称" prop="translateName">
        <el-input
          v-model="queryParams.translateName"
          placeholder="请输入企业名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px;">
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
    <el-table v-loading="loading" :data="translateBookList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="translateName" />
      <el-table-column label="联系人" align="center" prop="contacts" />
      <el-table-column label="联系电话" align="center" prop="pass" />
      <el-table-column label="省份-城市" align="center" prop="addr" />
      <el-table-column label="客户需求" align="center" prop="customerDemand" />
      <el-table-column label="客户来源" align="center" prop="sources" />
      <el-table-column label="备注" align="center" prop="notes" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="是否沟通" align="center" width="180">
        <template #default="scope">
          <el-tag v-if="scope.row.connectCount > 0">已沟通</el-tag>
          <el-tag v-else class="ml-2" type="danger">未沟通</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="沟通记录" align="center" width="180">
        <template #default="scope">
          <span style="color: blue;font-weight: 900;cursor: pointer;text-decoration:underline;" @click="openDrawer(scope.row)">沟通记录</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:translateBook:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:translateBook:remove']">删除</el-button>
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

    <!-- 添加或修改企业通讯录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="translateBookRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企业名称" prop="translateName">
          <el-input v-model="form.translateName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contacts">
          <el-input v-model="form.contacts" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="省份-城市" prop="addr">
          <el-input v-model="form.addr" placeholder="请输入省份-城市" />
        </el-form-item>
        <el-form-item label="客户需求" prop="customerDemand">
          <el-input v-model="form.customerDemand" placeholder="请输入客户需求" />
        </el-form-item>
        <el-form-item label="客户来源" prop="sources">
          <el-input v-model="form.sources" placeholder="请输入客户来源" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="form.notes" placeholder="请输入备注" />
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
        <h4>企业沟通记录</h4>
      </template>
      <template #default>
        <translateConnect :dataObj="dataObj"></translateConnect>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="TranslateBook">
import { listTranslateBook, getTranslateBook, delTranslateBook, addTranslateBook, updateTranslateBook,recoverys} from "@/api/business/translateBook";
import translateConnect from '../translateConnect/index.vue'
const { proxy } = getCurrentInstance();

const translateBookList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const drawerOpen = ref(false)
const dataObj = ref({})
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    translateId: null,
    translateName: null,
    contacts: null,
    phone: null,
    addr: null,
    customerDemand: null,
    sources: null,
    userId: null,
    userName: null,
    isRecovery: null,
  },
  rules: {
    translateId: [
      { required: true, message: "企业id不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询企业通讯录列表 */
function getList() {
  loading.value = true;
  listTranslateBook(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    translateBookList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function drawerClose(){
  getList()
}

function openDrawer(row){
  dataObj.value = row
  drawerOpen.value = true
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    translateBookId: null,
    translateId: null,
    translateName: null,
    contacts: null,
    phone: null,
    addr: null,
    customerDemand: null,
    sources: null,
    userId: null,
    userName: null,
    isRecovery: null,
    createTime: null
  };
  proxy.resetForm("translateBookRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.translateBookId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加企业通讯录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _translateBookId = row.translateBookId || ids.value
  getTranslateBook(_translateBookId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改企业通讯录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["translateBookRef"].validate(valid => {
    if (valid) {
      if (form.value.translateBookId != null) {
        updateTranslateBook(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTranslateBook(form.value).then(response => {
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
  const _translateBookIds = row.translateBookId || ids.value;
  proxy.$modal.confirm('是否确认删除企业通讯录编号为"' + _translateBookIds + '"的数据项？').then(function() {
    return delTranslateBook(_translateBookIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 回收
// 回收
function recovery(row){
  recoverys(row).then(response => {
    proxy.$modal.msgSuccess("回收成功");
    getList();
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/translateBook/export', {
    ...queryParams.value
  }, `translateBook_${new Date().getTime()}.xlsx`)
}

getList();
</script>
